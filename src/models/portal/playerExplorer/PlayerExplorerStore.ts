import {defineStore} from "pinia";
import {TAppId, TTagId} from "@/models/portal/apps/AppsData";
import {
    PlayerExplorerChart,
    PlayerExplorerChartItemData,
    PlayerExplorerFilter,
    PlayerExplorerFilterView,
    PlayerExplorerStatsItem,
} from "@/models/portal/PortalDataTypes";
import GembaseUtils from "@/utils/GembaseUtils";
import EndpointRequest from "@/core/requests/EndpointRequest";
import {LocationQuery} from "vue-router";
import {usePortalStore} from "@/models/portal/PortalStore";
import {EModuleId} from "@/models/portal/PortalConstants";
import {TagsHelper} from "@/models/portal/tags/TagsHelper";
import {useAppsStore} from "@/models/portal/apps/AppsStore";
import {GB_PALETTE} from "@/tailwind/gembaseTwPalette";
import {useRouterStore} from "@/core/router/RouterStore";

let countdownToUpdate = 0;

export const playerExplorerGroupsColorsCss: string[] = [
    GB_PALETTE.DIM_OCEAN,
    GB_PALETTE.DIM_MAGENTA,
    GB_PALETTE.YELLOW_GOLD
];

export const usePlayerExplorerStore = defineStore('playerExplorerStore', {
    state: () => ({
        maximizedCharts: [] as string[],
        filters: [{
            data: {
                id: GembaseUtils.guid()
            }
        }] as PlayerExplorerFilterView[],
        toggledTraitsFilter: [] as string[],
        isUpdating: false,
        updateFiltersRequest: 0,
        currentChartData: {
            charts: [] as PlayerExplorerChart[][],
            stats: [] as PlayerExplorerStatsItem[]
        },
        ignoreUpdateRequest: false,
        filtersInvalidated: false,
        show: undefined as string | undefined,
        selectedDcmConceptsHeader: undefined as string | undefined,
        marketReachTooltip: undefined as PlayerExplorerChartItemData | undefined,
        appId: undefined as TAppId | undefined,
        appTags: undefined as TTagId[] | undefined
    }),
    actions: {
        isChartMaximized(chartId: string): boolean {
            const index = this.maximizedCharts.indexOf(chartId);
            return index !== -1;
        },
        toggleChartSize(chartId: string) {
            if (this.isChartMaximized(chartId)) {
                const index = this.maximizedCharts.indexOf(chartId);
                this.maximizedCharts.splice(index, 1);
            } else {
                this.maximizedCharts.push(chartId);
            }
        },
        isToggledTraitsFilter(filterId: string) {
            for (let i = 0; i < this.toggledTraitsFilter.length; ++i) {
                if (this.toggledTraitsFilter[i] === filterId) {
                    return true;
                }
            }
            return false;
        },
        toggleTraitsFilter(filterId: string) {
            if (this.isToggledTraitsFilter(filterId)) {
                GembaseUtils.removeFromArr(this.toggledTraitsFilter, filterId);
            } else {
                this.toggledTraitsFilter.push(filterId);
            }
        },
        addFilterGroup() {
            const filter = {
                data: {
                    id: GembaseUtils.guid(),
                    loved: {
                        tag_ids: []
                    },
                    not_hated: {
                        tag_ids: []
                    }
                }
            }
            this.filters.push(filter);
            this.toggleTraitsFilter(filter.data.id);
            this.updateFilters();
        },
        removeFilterGroup(filterId: string) {
            for (let i = 0; i < this.filters.length; ++i) {
                if (this.filters[i].data.id === filterId) {
                    this.filters.splice(i, 1);
                    this.updateFilters();
                    break;
                }
            }
        },
        copyFilterGroup(filterId: string) {
            for (let i = 0; i < this.filters.length; ++i) {
                if (this.filters[i].data.id === filterId) {
                    const copy = GembaseUtils.copy(this.filters[i].data);
                    copy.id = GembaseUtils.guid();
                    this.filters.push({
                        data: copy
                    });
                    this.updateFilters();
                    break;
                }
            }
        },
        async updateFilters() {
            this.clearUpdateFiltersCountdown();

            if (this.filters.length <= 0) {
                this.currentChartData = {
                    charts: [],
                    stats: []
                }
                this.updateFiltersRequest += 1;
                return;
            }

            if (this.isUpdating) {
                return;
            }

            this.isUpdating = true;
            this.filtersInvalidated = false;
            this.ignoreUpdateRequest = true;

            const token = useRouterStore().getQueryKey("token");
            const filtersData: PlayerExplorerFilter[] = [];
            this.filters.forEach((x) => filtersData.push(x.data));

            const response = await EndpointRequest.process2<{
                charts: PlayerExplorerChart[][],
                filters: PlayerExplorerFilter[],
                stats: PlayerExplorerStatsItem[],
                show: string | undefined
            }>("portal:get_player_explorer_data", {
                filters: filtersData,
                token: token,
                show: this.show
            });

            this.show = response.show;
            this.ignoreUpdateRequest = true;
            const filtersArr: PlayerExplorerFilterView[] = [];
            response.filters.forEach((x) => filtersArr.push({
                data: x
            }));
            this.filters = filtersArr;
            this.isUpdating = false;
            this.currentChartData = response;
            this.updateFiltersRequest += 1;
            if (this.show === "concepts") {
                this.currentChartData.charts[0].forEach((x) => {
                    if (x.id === "market_reach") {
                        if (x.data.length > 0) {
                            let found = false;
                            x.data.forEach((y) => {
                                if (y.id === this.selectedDcmConceptsHeader) {
                                    found = true;
                                    return;
                                }
                            });
                            if (!found) {
                                this.updateDcmConceptsHeader(x.data[0].id);
                            }
                        } else {
                            this.updateDcmConceptsHeader(undefined);
                        }
                    }
                });
            }
            await GembaseUtils.sleep(100);
            this.ignoreUpdateRequest = false;
            this.filtersInvalidated = false;
            this.filtersToUrlQuery();
        },
        updateDcmConceptsHeader(value: string | undefined) {
            this.selectedDcmConceptsHeader = value;
            this.updateFiltersRequest++;
        },
        generateUrlQuery(
            filters: PlayerExplorerFilterView[],
            show: string | undefined = undefined,
            from: string | undefined = undefined,
            appId: TAppId | undefined = undefined
        ): LocationQuery {
            const arr: PlayerExplorerFilter[] = [];
            filters.forEach((x) => arr.push(x.data));

            const res: LocationQuery = {
                filters: GembaseUtils.compressData(JSON.stringify(arr)),
            }

            if (show !== undefined) {
                res.show = show;
            }

            if (from !== undefined) {
                res.from = from;
            }

            if (appId !== undefined) {
                res.appId = appId;
            }

            return res
        },
        filtersToUrlQuery() {
            useRouterStore().setQuery(
                this.generateUrlQuery(this.filters, this.show, undefined, this.appId),
                {replace: true}
            );
        },
        async filtersFromUrlQuery() {
            this.appTags = undefined;
            const show = useRouterStore().getQueryKey("show");
            const appId = useRouterStore().getQueryKey("appId");
            if (appId !== undefined) {
                const appDetail = await useAppsStore().getAppDetailAsync({
                    appId: appId
                });
                this.appTags = TagsHelper.getTagsList(appDetail.tags);
            }
            this.show = show ?? undefined;
            this.appId = appId;
            const o = useRouterStore().getQueryKey("filters");
            if (o !== undefined) {
                const filtersStr = GembaseUtils.decompressData(o);
                const arr: PlayerExplorerFilter[] = JSON.parse(filtersStr);
                const arrView: PlayerExplorerFilterView[] = [];
                arr.forEach((x) => arrView.push({data: x}));
                this.filters = arrView;

                const appTags: TTagId[] = [];
                if (this.filters.length === 1) {
                    const filter = this.filters[0];
                    filter.data.loved?.tag_ids.forEach((x) => {
                        if (!appTags.includes(x)) {
                            appTags.push(x);
                        }
                    });
                    filter.data.not_hated?.tag_ids.forEach((x) => {
                        if (!appTags.includes(x)) {
                            appTags.push(x);
                        }
                    });
                    if (appTags.length > 0) {
                        this.appTags = appTags;
                    }
                }
            } else {
                this.filters.length = 0;
                this.addFilterGroup();
            }
            if (this.filters.length > 0) {
                GembaseUtils.addToArrUnique(this.toggledTraitsFilter, this.filters[0].data.id);
            }
            const from = useRouterStore().getQueryKey("from");
            if (from !== undefined) {
                await useRouterStore().removeQueryKey("from");
            }
            await this.updateFilters();
        },
        toggleLovedNode(filterId: string, tagId: TTagId) {
            const filter = this.getFilter(filterId);
            if (filter !== undefined) {
                if (filter.loved === undefined) {
                    filter.loved = {
                        tag_ids: []
                    };
                }
                GembaseUtils.toggleArr(filter.loved.tag_ids, tagId);
                if (filter.loved.tag_ids.length > 2) {
                    filter.loved.tag_ids.shift();
                }
                if (filter.not_hated === undefined || !filter.not_hated.tag_ids.includes(tagId)) {
                    filter.not_hated ??= {
                        tag_ids: []
                    };
                    filter.not_hated.tag_ids.push(tagId);
                }
                this.filtersInvalidated = true;
                this.filtersToUrlQuery();
                this.initUpdateFiltersCountdown();
            }
        },
        setNotHatedTags(filterId: string | undefined, tags: TTagId[]) {
            const filter = this.getFilter(filterId);
            if (filter !== undefined) {
                filter.not_hated = {
                    tag_ids: [...tags]
                };
                this.filtersInvalidated = true;
                this.filtersToUrlQuery();
                this.initUpdateFiltersCountdown();
            }
        },
        toggleNotHatedNode(filterId: string, tagId: TTagId) {
            const filter = this.getFilter(filterId);
            if (filter !== undefined) {
                if (filter.not_hated === undefined) {
                    filter.not_hated = {
                        tag_ids: []
                    };
                }
                GembaseUtils.toggleArr(filter.not_hated.tag_ids, tagId);
                if (filter.loved !== undefined && filter.loved.tag_ids.includes(tagId)) {
                    GembaseUtils.removeFromArr(filter.loved.tag_ids, tagId);
                }
                this.filtersInvalidated = true;
                this.filtersToUrlQuery();
                this.initUpdateFiltersCountdown();
            }
        },
        setStudy(filterId: string | undefined, studyId: string) {
            const filter = this.getFilter(filterId);
            if (filter !== undefined && filter.surveys !== undefined) {
                filter.surveys.active = studyId;
                this.filtersInvalidated = true;
                this.filtersToUrlQuery();
                this.initUpdateFiltersCountdown();
            }
        },
        getFilter(filterId: string | undefined) {
            for (let i = 0; i < this.filters.length; ++i) {
                if (this.filters[i].data.id === filterId) {
                    return this.filters[i].data;
                }
            }
            return undefined;
        },
        getFilterView(filterId: string | undefined) {
            for (let i = 0; i < this.filters.length; ++i) {
                if (this.filters[i].data.id === filterId) {
                    return this.filters[i];
                }
            }
            return undefined;
        },
        initUpdateFiltersCountdown() {
            return;
            if (this.ignoreUpdateRequest) {
                return;
            }
            this.clearUpdateFiltersCountdown();
            countdownToUpdate = window.setInterval(() => {
                if (!this.ignoreUpdateRequest) {
                    if (this.isUpdating) {
                        this.initUpdateFiltersCountdown();
                    } else {
                        this.updateFilters();
                    }
                }
            }, 2000);
        },
        clearUpdateFiltersCountdown() {
            if (countdownToUpdate !== 0) {
                window.clearInterval(countdownToUpdate);
                countdownToUpdate = 0;
            }
        },
        setAgeFilter(filterId: string | undefined, from: number, to: number) {
            const filter = this.getFilter(filterId);
            if (filter !== undefined) {
                if (filter.age === undefined) {
                    filter.age = {
                        value: 0,
                        min: 18,
                        max: 65,
                        from: from,
                        to: to
                    }
                }
                filter.age.from = from;
                filter.age.to = to;
                this.filtersInvalidated = true;
                this.filtersToUrlQuery();
                this.initUpdateFiltersCountdown();
            }
        },
        setFemalesFilter(filterId: string | undefined, value: number) {
            const filter = this.getFilter(filterId);
            if (filter !== undefined) {
                if (filter.females === undefined) {
                    filter.females = {
                        value: value,
                        min: 0,
                        max: 100
                    }
                }
                filter.females.value = value;
                this.filtersInvalidated = true;
                this.filtersToUrlQuery();
                this.initUpdateFiltersCountdown();
            }
        },
        setSpendingFilter(filterId: string | undefined, spendingId: string) {
            const filter = this.getFilter(filterId);
            if (filter !== undefined) {
                if (filter.spending === undefined) {
                    filter.spending = {
                        active: [],
                        items: []
                    }
                }
                GembaseUtils.toggleArr(filter.spending.active, spendingId);
                this.filtersInvalidated = true;
                this.filtersToUrlQuery();
                this.initUpdateFiltersCountdown();
            }
        },
        getBestFeaturesForHeader(headerId: string) {
            let feature1: string | undefined = undefined;
            let feature2: string | undefined = undefined;
            this.currentChartData.charts[0].forEach((x) => {
                if (x.id === headerId) {
                    x.data.forEach((z) => {
                        if (feature1 === undefined && z.feature_pool_id === "features_1") {
                            feature1 = z.name;
                        }
                        if (feature2 === undefined && z.feature_pool_id === "features_2") {
                            feature2 = z.name;
                        }
                    });
                }
            });
            return `${feature1} ${feature2}`
        },
        canAddSegment() {
            return this.filters.length == 0 || (this.filters.length <= 2 && this.show !== 'concepts');
        },
        isLocked() {
            return usePortalStore().isModuleLocked(EModuleId.PLAYERS_EXPLORER);
        }
    }
});
