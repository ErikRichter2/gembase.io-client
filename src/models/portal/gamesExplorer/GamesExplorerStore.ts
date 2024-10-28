import {defineStore} from "pinia";
import {
    AppStoreEnum,
    AppTypeEnum,
    IAppIcon,
    TagDetail,
    TAppId,
    TDeveloperId,
    TTagId
} from "@/models/portal/apps/AppsData";
import {
    DevDetailFilter,
    GamesExplorerCompareViewData,
    GamesExplorerCompareViewDataValue,
    GamesExplorerFilterData,
    GamesExplorerFilterDef,
    GamesExplorerFilterInstance,
    GamesExplorerPriceFilterDef
} from "@/models/portal/PortalDataTypes";
import GembaseUtils from "@/utils/GembaseUtils";
import EndpointRequest from "@/core/requests/EndpointRequest";
import {LocationQuery} from "vue-router";
import {usePortalStore} from "@/models/portal/PortalStore";
import {EModuleId} from "@/models/portal/PortalConstants";
import {TagsHelper} from "@/models/portal/tags/TagsHelper";
import {UiUtils} from "@/utils/UiUtils";
import {OpportunityHelper} from "@/models/portal/gaps/OpportunityHelper";
import {
    GamesExplorerCompareResponseAppData,
    GamesExplorerFiltersResponseApp,
    GamesExplorerFilterView,
    GamesExplorerQueryData,
    GamesExplorerSelectedItem,
    GamesExplorerSelectedItemTypeEnum
} from "@/models/portal/gamesExplorer/GamesExplorerData";
import {AppDetailUtils} from "@/models/portal/apps/AppDetailUtils";
import ClientError from "@/core/errors/ClientError";
import {
    AdvancedFilterData,
    AudienceTooltip,
    SearchSortEnum,
    TooltipDataV2
} from "@/models/portal/competitor/PortalCompetitorData";
import {LocalStorageModel} from "@/models/storage/LocalStorageModel";
import {useAppsStore} from "@/models/portal/apps/AppsStore";
import {usePlatformCalcStore} from "@/models/portal/calc/PlatformCalcStore";
import {PlatformCalcRequestToken} from "@/models/portal/calc/PlatformCalcRequestToken";
import {GB_PALETTE} from "@/tailwind/gembaseTwPalette";
import {useRouterStore} from "@/core/router/RouterStore";
import {useUiStore} from "@/models/ui/UiStore";
import {PortalCompetitorUtils} from "@/models/portal/competitor/PortalCompetitorUtils";
import {RangeSliderData} from "@/models/ui/RangeSliderData";

const itemsPalette = [
    GB_PALETTE.DIM_OCEAN,
    GB_PALETTE.DIM_MAGENTA,
    GB_PALETTE.YELLOW_GOLD,
    "#aec7e8",
    "#ff7f0e",
    "#ffbb78",
    "#2ca02c",
    "#98df8a",
    "#d62728",
    "#ff9896",
    "#9467bd",
    "#c5b0d5",
    "#8c564b",
    "#c49c94",
    "#e377c2",
    "#f7b6d2",
    "#7f7f7f",
    "#c7c7c7",
    "#bcbd22",
    "#dbdb8d",
    "#17becf",
    "#9edae5"
]

const takenColorPerId: Map<string, string> = new Map<string, string>();

const itemData: Map<string, GamesExplorerFiltersResponseApp> = new Map<string, GamesExplorerFiltersResponseApp>();
const compareItemData: Map<string, GamesExplorerCompareResponseAppData> = new Map<string, GamesExplorerCompareResponseAppData>();
const portalStore = usePortalStore();

let filterTimeout = 0;

const requestToken = new PlatformCalcRequestToken();

function getInitialTier(): RangeSliderData {
    let min: number | undefined = undefined;
    let max: number | undefined = undefined;

    portalStore.installTiers.forEach((x) => {
        if (min === undefined || x.tier < min) {
            min = x.tier;
        }
        if (max === undefined || x.tier > max) {
            max = x.tier;
        }
    });

    if (min === undefined || max === undefined) {
        throw new ClientError("Tier not found");
    }

    return {
        from: min,
        to: max,
        min: min,
        max: max,
        value: 0
    }
}

function getInitialPrices(): RangeSliderData {
    let min: number | undefined = undefined;
    let max: number | undefined = undefined;

    filterDefPrices.forEach((x) => {
        if (min === undefined || x.tier < min) {
            min = x.tier;
        }
        if (max === undefined || x.tier > max) {
            max = x.tier;
        }
    });

    if (min === undefined || max === undefined) {
        throw new ClientError("Tier not found");
    }

    return {
        from: min,
        to: max,
        min: min,
        max: max,
        value: 0
    }
}

export let filterDefPrices: GamesExplorerPriceFilterDef[] = [];

interface IThreatScoreData {
    id: string;
    ts?: string;
    tsRaw?: number;
}

let isThreatScoreWorking = false;
let firstAdvancedFilterData: AdvancedFilterData | undefined = undefined;

interface IChartData {
    appId: TAppId;
    tam: number;
    ts: number;
}

export const useGamesExplorerStore = defineStore('gamesExplorerStore', {
    state: () => ({
        filters: [] as GamesExplorerFilterView[],
        filterDef: undefined as GamesExplorerFilterDef | undefined,
        isUpdating: false,
        selectedItems: [] as GamesExplorerSelectedItem[],
        minimizedCompareSections: [] as string[],
        compareViewData: [] as GamesExplorerCompareViewData[],
        threatScores: [] as IThreatScoreData[],
        advancedFilterDataMap: undefined as AdvancedFilterData | undefined,
        compareViewDataChange: 0,
        chartData: [] as IChartData[],
        devDetails: [] as DevDetailFilter[],
        audienceTooltip: undefined as AudienceTooltip | undefined,
        threatScoreTooltip: undefined as TooltipDataV2 | undefined
    }),
    actions: {
        clearData() {
            takenColorPerId.clear();
            itemData.clear();
            compareItemData.clear();
            this.threatScores.length = 0;
            isThreatScoreWorking = false;

            const advancedFilter = LocalStorageModel.getItem("games-explorer-advanced-filter");
            if (advancedFilter !== undefined) {
                try {
                    const advancedFilterData: AdvancedFilterData = {
                        stores: [],
                        weights: [],
                        current_store: true,
                        top_competitors: 20,
                        sorting: SearchSortEnum.Installs
                    }
                    const parsed = JSON.parse(advancedFilter);
                    if ("top_competitors" in parsed) {
                        advancedFilterData.top_competitors = parsed["top_competitors"];
                    }
                    if ("sorting" in parsed) {
                        advancedFilterData.sorting = parsed["sorting"];
                    }
                    if ("stores" in parsed) {
                        advancedFilterData.stores = parsed["stores"];
                    }
                    if ("weights" in parsed) {
                        advancedFilterData.weights = parsed["weights"];
                    }
                    if ("current_store" in parsed) {
                        advancedFilterData.current_store = parsed["current_store"];
                    }
                    firstAdvancedFilterData = advancedFilterData;
                    if (this.filters.length > 0) {
                        this.filters[0].filter.advanced_filter_data = firstAdvancedFilterData;
                    }
                } catch (e) {
                    // do nothing
                }
            }

            const advancedFilterMap = LocalStorageModel.getItem("games-explorer-advanced-filter-map");
            if (advancedFilterMap !== undefined) {
                try {
                    const advancedFilterData: AdvancedFilterData = {
                        stores: [],
                        weights: [],
                        current_store: true,
                        top_competitors: 20,
                        sorting: SearchSortEnum.Installs
                    }
                    const parsed = JSON.parse(advancedFilterMap);
                    if ("top_competitors" in parsed) {
                        advancedFilterData.top_competitors = parsed["top_competitors"];
                    }
                    if ("sorting" in parsed) {
                        advancedFilterData.sorting = parsed["sorting"];
                    }
                    if ("stores" in parsed) {
                        advancedFilterData.stores = parsed["stores"];
                    }
                    if ("weights" in parsed) {
                        advancedFilterData.weights = parsed["weights"];
                    }
                    if ("current_store" in parsed) {
                        advancedFilterData.current_store = parsed["current_store"];
                    }
                    this.advancedFilterDataMap = advancedFilterData;
                } catch (e) {
                    // do nothing
                }
            }
        },
        getFirstHasAudienceTs() {
            for (let i = 0; i < this.filteredSelectedItems.length; ++i) {
                if (this.hasAudienceTs(this.filteredSelectedItems[i])) {
                    return this.filteredSelectedItems[i];
                }
            }

            return undefined;
        },
        hasAudienceTs(item: GamesExplorerSelectedItem | undefined) {
            if (item === undefined) {
                return;
            }
            return this.filteredSelectedItems.indexOf(item) === 0 && (item.type === GamesExplorerSelectedItemTypeEnum.CONCEPT || item.type === GamesExplorerSelectedItemTypeEnum.OPPORTUNITY);
        },
        async getFilterDef() {
            if (this.filterDef === undefined) {
                const filterDef = await EndpointRequest.process2<{
                    prices: GamesExplorerPriceFilterDef[],
                    stores: {
                        id: number,
                        label: string
                    }[]
                }>("portal:get_games_explorer_filters_def");
                filterDefPrices = filterDef.prices;
                this.filterDef = {
                    prices: getInitialPrices(),
                    stores: filterDef.stores,
                    tier: getInitialTier()
                }
            }
            return this.filterDef;
        },
        addFilterGroup() {
            const guid = GembaseUtils.guid();
            const tags: TTagId[] = [];
            const isFirst = this.filters.length === 0;
            this.filters.push({
                filter: {
                    id: guid,
                    tag_ids: tags,
                    dev_ids: [],
                    prices: getInitialPrices(),
                    stores: [],
                    tier: getInitialTier(),
                    advanced_filter_data: isFirst ? firstAdvancedFilterData : undefined
                },
                apps: []
            });
            this.updateFilters();
        },
        setAdvancedFilterMap(data: AdvancedFilterData | undefined) {
            if (data !== undefined) {
                LocalStorageModel.setItem("games-explorer-advanced-filter-map", JSON.stringify(data));
            } else {
                LocalStorageModel.removeItem("games-explorer-advanced-filter-map");
            }

            this.advancedFilterDataMap = data;
            this.sortSelectedItems();
            this.refreshCompareViewData();
        },
        sortSelectedItems() {
            this.selectedItems.sort((a, b) => {
                const dataA = this.getCompareAppData(a);
                const dataB = this.getCompareAppData(b);

                if (dataA === undefined || dataB === undefined) {
                    return 0;
                } else if (this.advancedFilterDataMap === undefined) {
                    return 0;
                } else {
                    if (this.advancedFilterDataMap.sorting === SearchSortEnum.Growth) {
                        return dataB.growth_raw - dataA.growth_raw;
                    } else if (this.advancedFilterDataMap.sorting === SearchSortEnum.Novelty) {
                        return dataB.novelty_raw - dataA.novelty_raw;
                    } else if (this.advancedFilterDataMap.sorting === SearchSortEnum.Installs) {
                        return dataB.installs_raw - dataA.installs_raw;
                    } else if (this.advancedFilterDataMap.sorting === SearchSortEnum.Quality) {
                        return dataB.rating_raw - dataA.rating_raw;
                    } else if (this.advancedFilterDataMap.sorting === SearchSortEnum.TAM) {
                        return dataB.total_audience_raw - dataA.total_audience_raw;
                    }
                }

                return 0;
            });
        },
        setAdvancedFilter(filterId: string, data: AdvancedFilterData | undefined) {
            const filter = this.filters.find((x) => x.filter.id === filterId);
            if (filter !== undefined) {
                filter.filter.advanced_filter_data = data;
                if (this.filters.indexOf(filter) === 0) {
                    if (data !== undefined) {
                        LocalStorageModel.setItem("games-explorer-advanced-filter", JSON.stringify(data));
                    } else {
                        LocalStorageModel.removeItem("games-explorer-advanced-filter");
                    }
                }
                window.clearTimeout(filterTimeout);
                filterTimeout = window.setTimeout(() => {
                    this.updateFilter(filterId);
                }, 1000);
            }
        },
        setTierFilter(filterId: string, from: number, to: number) {
            const filter = this.filters.find((x) => x.filter.id === filterId);
            if (filter !== undefined) {
                if (filter.filter.tier === undefined) {
                    filter.filter.tier = getInitialTier();
                }
                filter.filter.tier.from = from;
                filter.filter.tier.to = to;
                window.clearTimeout(filterTimeout);
                filterTimeout = window.setTimeout(() => {
                    this.updateFilter(filterId);
                }, 1000);
            }
        },
        setPriceFilter(filterId: string, from: number, to: number) {
            const filter = this.filters.find((x) => x.filter.id === filterId);
            if (filter !== undefined) {
                if (filter.filter.prices === undefined) {
                    filter.filter.prices = getInitialPrices();
                }
                filter.filter.prices.from = from;
                filter.filter.prices.to = to;
                window.clearTimeout(filterTimeout);
                filterTimeout = window.setTimeout(() => {
                    this.updateFilter(filterId);
                }, 1000);
            }
        },
        removeFilterGroup(filterId: string) {
            for (let i = 0; i < this.filters.length; ++i) {
                if (this.filters[i].filter.id === filterId) {
                    this.filters.splice(i, 1);
                    break;
                }
            }
        },
        copyFilterGroup(filterId: string) {
            for (let i = 0; i < this.filters.length; ++i) {
                if (this.filters[i].filter.id === filterId) {
                    const copy = {
                        filter: GembaseUtils.copy(this.filters[i].filter),
                        apps: []
                    }
                    copy.filter.id = GembaseUtils.guid();
                    this.filters.push(copy);
                    this.updateFilter(copy.filter.id);
                    break;
                }
            }
        },
        processFilterResponse(response: {id: string, apps: GamesExplorerFiltersResponseApp[]}[]) {
            response.forEach((x) => {
                x.apps.forEach((y) => {
                    if (!itemData.has(y.item.id)) {
                        itemData.set(y.item.id, y);
                    }
                });
            });

            for (let i = 0; i < this.filters.length; ++i) {
                for (let j = 0; j < response.length; ++j) {
                    if (this.filters[i].filter.id === response[j].id) {
                        this.filters[i].apps = response[j].apps;
                    }
                }
            }
        },
        async updateFilter(filterId: string) {

            window.clearTimeout(filterTimeout);

            if (this.isUpdating) {
                return;
            }

            const filter = this.getFilter(filterId);

            if (filter === undefined) {
                return;
            }

            this.isUpdating = true;

            let state = "";
            do {
                const response = await EndpointRequest.process2<{
                    state: string,
                    data: {
                        id: string,
                        apps: GamesExplorerFiltersResponseApp[]
                    }[]
                }>("portal:get_games_explorer_filter_apps", {
                    filters: [filter]
                });

                state = response.state;

                if (state === "ok") {
                    this.processFilterResponse(response.data);
                }
            } while (state !== "ok")

            this.isUpdating = false;

            this.filtersToUrlQuery();
        },
        async updateFilters(refreshQuery = true) {

            if (this.filters.length <= 0) {
                return;
            }

            if (this.isUpdating) {
                return;
            }

            this.isUpdating = true;

            const filters: GamesExplorerFilterInstance[] = [];
            this.filters.forEach((x) => {
                filters.push(x.filter)
            });

            let state = "";

            do {
                const response = await EndpointRequest.process2<{
                    state: string,
                    data: {
                        id: string,
                        apps: GamesExplorerFiltersResponseApp[]
                    }[]
                }>("portal:get_games_explorer_filter_apps", {
                    filters: filters
                });

                state = response.state;

                if (response.state === "ok") {
                    this.processFilterResponse(response.data);
                }
            } while (state !== "ok")

            this.isUpdating = false;

            if (refreshQuery) {
                this.filtersToUrlQuery();
            }
        },
        generateUrlQuery(
            queryData: GamesExplorerQueryData | undefined = undefined
        ): LocationQuery {

            if (queryData === undefined) {
                const filters: GamesExplorerFilterInstance[] = [];
                this.filters.forEach((x) => {
                    filters.push(x.filter);
                });
                queryData = {
                    selectedItems: this.selectedItems,
                    initialSelectAllFilteredApps: false,
                    filters: filters
                }
            }

            return {
                data: GembaseUtils.compressData(JSON.stringify({
                    filters: queryData.filters ?? [],
                    selectedItems: queryData.selectedItems ?? [],
                    initialSelectAllFilteredApps: queryData.initialSelectAllFilteredApps ?? false
                }))
            }
        },
        async filtersToUrlQuery() {
            await useRouterStore().setQuery(this.generateUrlQuery(), {replace: true});
        },
        async filtersFromUrlQuery() {
            const o = useRouterStore().getQueryKey("data");
            if (o !== undefined) {
                const data: {
                    filters: GamesExplorerFilterData[],
                    selectedItems: GamesExplorerSelectedItem[],
                    initialSelectAllFilteredApps: boolean
                } = JSON.parse(GembaseUtils.decompressData(o));
                this.filters = []
                data.filters.forEach((x) => {
                    this.filters.push({
                        filter: {
                            id: GembaseUtils.guid(),
                            tag_ids: x.tag_ids,
                            dev_ids: x.dev_ids,
                            prices: x.prices ?? getInitialPrices(),
                            stores: x.stores,
                            tier: x.tier ?? getInitialTier(),
                            my_apps: x.my_apps
                        },
                        apps: []
                    });
                })
                await this.updateFilters(false);
                const selectedItems: GamesExplorerSelectedItem[] = [];
                if (data.selectedItems.length > 0) {
                    data.selectedItems.forEach((x) => {
                        selectedItems.push(x);
                    });
                } else {
                    if (data.initialSelectAllFilteredApps) {
                        this.filters.forEach((x) => {
                            x.apps.forEach((y) => {
                                selectedItems.push(y.item);
                            });
                        });
                    }
                }

                await this.getGamesExplorerCompareAppsDataAsync(selectedItems);
                await this.filtersToUrlQuery();
            } else {
                this.filters.length = 0;
                this.selectedItems.length = 0;
                this.addFilterGroup();
                await this.updateFilters();
            }
        },
        __hasCompareAppData(item: GamesExplorerSelectedItem): boolean {
            return compareItemData.has(item.id);
        },
        getCompareAppData(item: GamesExplorerSelectedItem): GamesExplorerCompareResponseAppData {
            return compareItemData.get(item.id) as GamesExplorerCompareResponseAppData;
        },
        toggleStore(filterId: string, storeId: number) {
            const filter = this.getFilter(filterId);
            GembaseUtils.toggleArr(filter?.stores, storeId);
            this.updateFilter(filterId);
        },
        toggleNode(filterId: string, tagId: TTagId) {
            const filter = this.getFilter(filterId);
            if (filter !== undefined) {
                GembaseUtils.toggleArr(filter.tag_ids, tagId);
                this.filtersToUrlQuery();
            }
        },
        getFilter(filterId: string | undefined) {
            for (let i = 0; i < this.filters.length; ++i) {
                if (this.filters[i].filter.id === filterId) {
                    return this.filters[i].filter;
                }
            }
            return undefined;
        },
        getFilterIndex(filterId: string | undefined) {
            return this.filters.findIndex((x) => x.filter.id === filterId);
        },
        getFilterView(filterId: string | undefined) {
            for (let i = 0; i < this.filters.length; ++i) {
                if (this.filters[i].filter.id === filterId) {
                    return this.filters[i];
                }
            }
            return undefined;
        },
        getApps(filterId: string): GamesExplorerFiltersResponseApp[] {
            for (let i = 0; i < this.filters.length; ++i) {
                if (this.filters[i].filter.id === filterId) {
                    return this.filters[i].apps;
                }
            }
            return [];
        },
        getAppIcon(item: GamesExplorerSelectedItem): IAppIcon | undefined {
            if (this.__hasCompareAppData(item)) {
                return this.getCompareAppData(item);
            }
            return undefined;
        },
        getIconTitle(item: GamesExplorerSelectedItem): {icon: string, title: string} | undefined {
            if (this.__hasCompareAppData(item)) {
                const d = this.getCompareAppData(item);
                return {
                    icon: AppDetailUtils.getIcon(d),
                    title: d.title
                }
            }

            return undefined;
        },
        unselectItemByAppId(appId: string) {
            for (let i = 0; i < this.selectedItems.length; ++i) {
                if (this.selectedItems[i].id === appId) {
                    this.selectedItems.splice(i, 1);
                    this.refreshCompareViewData();
                    this.filtersToUrlQuery();
                    this.compareViewDataChange++;
                    return;
                }
            }
        },
        toggleItem(item: GamesExplorerSelectedItem) {
            for (let i = 0; i < this.selectedItems.length; ++i) {
                if (this.selectedItems[i].id === item.id) {
                    if (takenColorPerId.has(item.id)) {
                        takenColorPerId.delete(item.id);
                    }
                    this.selectedItems.splice(i, 1);
                    this.refreshCompareViewData();
                    this.filtersToUrlQuery();
                    return;
                }
            }

            this.selectedItems.push(item);
            this.sortSelectedItems();
            this.refreshAppsData();
            this.filtersToUrlQuery();
            this.refreshThreatScore();
            this.compareViewDataChange++;
        },
        refreshAppsData(force=false) {
            this.getGamesExplorerCompareAppsDataAsync(this.selectedItems, force);
        },
        async getGamesExplorerCompareAppsDataAsync(items: GamesExplorerSelectedItem[], force=false) {
            const toUpdate: TAppId[] = [];

            for (let i = 0; i < items.length; ++i) {
                if (items[i].type === GamesExplorerSelectedItemTypeEnum.OPPORTUNITY) {
                    continue;
                }
                const hasData = this.__hasCompareAppData(items[i]);
                if (!hasData || force) {
                    toUpdate.push(items[i].id);
                }
            }

            if (toUpdate.length > 0) {
                const response = await EndpointRequest.process2<GamesExplorerCompareResponseAppData[]>("portal:get_games_explorer_compare_apps_data", {
                    app_ids: toUpdate
                });

                for (let i = 0; i < response.length; ++i) {
                    compareItemData.set(response[i].item.id, response[i]);
                    itemData.set(response[i].item.id, {
                        item: response[i].item,
                        store: response[i].store,
                        title: response[i].title,
                        dev_id: response[i].dev_id,
                        dev_title: response[i].dev_title,
                        icon: response[i].icon,
                        app_id_in_store: response[i].app_id_in_store,
                        locked: false,
                        app_type: response[i].app_type
                    });
                }
            }
            this.selectedItems = [];
            for (let i = 0; i < items.length; ++i) {
                if (items[i].type === GamesExplorerSelectedItemTypeEnum.CONCEPT || items[i].type === GamesExplorerSelectedItemTypeEnum.OPPORTUNITY) {
                    if (!this.__hasCompareAppData(items[i])) {
                        if (items[i].type === GamesExplorerSelectedItemTypeEnum.CONCEPT) {
                            const appDetail = await useAppsStore().getAppDetailAsync({
                                appId: items[i].id
                            });
                            if (appDetail !== undefined) {
                                if (appDetail.app_type === AppTypeEnum.CONCEPT) {
                                    const tags = GembaseUtils.copy<TagDetail[]>(appDetail.tags);
                                    compareItemData.set(items[i].id, {
                                        installs: "",
                                        growth: "",
                                        rating: "",
                                        tam: "",
                                        total_audience: "",
                                        tags: tags,
                                        released_year: "",
                                        scraped_t: undefined,
                                        tagged_t: appDetail.tagged_t,
                                        locked: false,
                                        app_type: appDetail.app_type,
                                        store: appDetail.store,
                                        icon: appDetail.icon,
                                        title: AppDetailUtils.getTitle(appDetail),
                                        app_id_in_store: appDetail.app_id_in_store,
                                        dev_title: appDetail.dev_title,
                                        app_id: appDetail.app_id,
                                        item: items[i],
                                        novelty_raw: 0,
                                        rating_raw: 0,
                                        growth_raw: 0,
                                        installs_raw: 0,
                                        tam_raw: 0,
                                        total_audience_raw: 0
                                    });
                                }
                            }
                        } else if (items[i].type === GamesExplorerSelectedItemTypeEnum.OPPORTUNITY) {
                            const opportunity = await portalStore.getOpportunityDetail(items[i].id);
                            if (opportunity !== undefined) {
                                compareItemData.set(items[i].id, {
                                    installs: "",
                                    growth: "",
                                    rating: "",
                                    tam: "",
                                    total_audience: "",
                                    tags: new OpportunityHelper(opportunity).tags,
                                    released_year: "",
                                    scraped_t: undefined,
                                    tagged_t: GembaseUtils.serverTimestamp(),
                                    locked: false,
                                    app_type: AppTypeEnum.CONCEPT,
                                    store: AppStoreEnum.CONCEPT,
                                    icon: UiUtils.WipImage,
                                    title: "Opportunity",
                                    app_id_in_store: undefined,
                                    dev_title: undefined,
                                    app_id: items[i].id,
                                    item: items[i],
                                    novelty_raw: 0,
                                    rating_raw: 0,
                                    growth_raw: 0,
                                    installs_raw: 0,
                                    tam_raw: 0,
                                    total_audience_raw: 0
                                });
                            }
                        }
                    }
                }
                if (this.__hasCompareAppData(items[i])) {
                    this.selectedItems.push(items[i]);
                }
                const toRemove: string[] = []
                for (const [key, value] of takenColorPerId) {
                    if (this.selectedItems.findIndex((x) => x.id === key) === undefined) {
                        toRemove.push(key);
                    }
                }
                toRemove.forEach((x) => takenColorPerId.delete(x));
            }
            this.refreshThreatScore();
            this.refreshCompareViewData();
        },
        isSelected(itemId: string) {
            const item = this.selectedItems.find((x) => x.id === itemId);
            return item !== undefined;
        },
        async toggleTag(v: GamesExplorerCompareViewDataValue) {
            const ts = this.threatScores.find((x) => x.id === v.item?.id);
            GembaseUtils.removeFromArr(this.threatScores, ts);
            this.refreshThreatScore();
        },
        async refreshThreatScore() {
            if (isThreatScoreWorking) {
                return;
            }

            const context = "games-explorer";

            isThreatScoreWorking = true;

            let found: GamesExplorerSelectedItem | undefined = undefined;

            for (let i = 0; i < this.filteredSelectedItems.length; ++i) {
                const item = this.filteredSelectedItems[i];
                if (this.__hasCompareAppData(item)) {
                    const ts = this.threatScores.find((x) => x.id === item.id);
                    if (ts === undefined) {
                        found = item;
                        break;
                    }
                }
            }

            if (found === undefined) {
                isThreatScoreWorking = false;
                return;
            }

            const item = found;
            const myRequestToken = new PlatformCalcRequestToken();
            const data = this.getCompareAppData(found);

            let appId: TAppId | undefined = undefined;
            let devId: TDeveloperId | undefined = undefined;

            if (data.item.type === GamesExplorerSelectedItemTypeEnum.APP) {
                appId = data.app_id;
                devId = data.dev_id
            }

            this.threatScores.push({
                id: item.id
            });

            this.refreshCompareViewData();

            await usePlatformCalcStore().competitors({
                context: context,
                requestToken: myRequestToken,
                input: {
                    dev_id: devId,
                    app_id: appId,
                    tag_details: data.tags
                },
                responseCallback: {
                    finally: () => {
                        isThreatScoreWorking = false;
                        this.refreshThreatScore();
                    },
                    done: callbackData => {
                        if (callbackData.response.payload?.result_data === undefined) {
                            return;
                        }

                        const ts = this.threatScores.find(
                            (x) => x.id === item.id
                        );

                        const clientTsFinal = callbackData.response.payload.result_data.ts;

                        if (ts === undefined) {
                            this.threatScores.push({
                                id: item.id,
                                ts: `${clientTsFinal}%`,
                                tsRaw: clientTsFinal
                            });
                        } else {
                            ts.ts = `${clientTsFinal}%`;
                            ts.tsRaw = clientTsFinal;
                        }

                        if (this.__hasCompareAppData(item)) {
                            this.refreshCompareViewData();
                        }
                    }
                }
            });
        },
        async showAudienceTooltip(item: GamesExplorerCompareViewDataValue) {
            if (item.item?.type === GamesExplorerSelectedItemTypeEnum.APP) {
                useUiStore().showLoadingDialog("games-explorer-showAudienceTooltip");
                await usePlatformCalcStore().audienceAngles({
                    requestToken: requestToken.recreate(),
                    context: "games-explorer",
                    appId: item.item.id,
                    input: {
                        tag_details: item.tagDetail
                    },
                    responseCallback: {
                        finally: () => useUiStore().hideLoadingDialog("games-explorer-showAudienceTooltip"),
                        done: callbackData => {
                            if (callbackData.response.payload?.result_data === undefined) {
                                return;
                            }

                            callbackData.response.payload.result_data.sort((a, b) => {
                                return b.audience_stats.total_audience - a.audience_stats.total_audience;
                            });

                            const angle = callbackData.response.payload.result_data[0];
                            this.audienceTooltip = {
                                lovedTags: angle.tag_ids,
                                hatedTags: TagsHelper.getTagsList(item.tagDetail),
                                audienceStats: angle.audience_stats,
                                audienceAngleId: angle.audience_angle_id
                            };
                        }
                    }
                });
            }
        },
        async showTsTooltip(item: GamesExplorerCompareViewDataValue) {
            if (item.item === undefined) {
                return;
            }

            useUiStore().showLoadingDialog("games-explorer-showTsTooltip");

            const data = this.getCompareAppData(item.item);
            let appId: TAppId | undefined = undefined;
            let devId: TDeveloperId | undefined = undefined;

            if (data.item.type === GamesExplorerSelectedItemTypeEnum.APP) {
                appId = data.app_id;
                devId = data.dev_id
            }
            await usePlatformCalcStore().competitors({
                context: "games-explorer",
                requestToken: requestToken.recreate(),
                input: {
                    dev_id: devId,
                    app_id: appId,
                    tag_details: item.tagDetail
                },
                responseCallback: {
                    finally: () => {
                        useUiStore().hideLoadingDialog("games-explorer-showTsTooltip");
                    },
                    done: callbackData => {
                        if (callbackData.response.payload?.result_data === undefined) {
                            return;
                        }

                        this.threatScoreTooltip = PortalCompetitorUtils.getTooltipDataForTopAppsV2({
                            competitors: callbackData.response.payload?.result_data,
                            myAppId: data.app_id,
                            myAppTitle: data.title
                        });
                    }
                }
            });
        },
        refreshCompareViewData() {
            const compareViewData: GamesExplorerCompareViewData[] = [];

            const storeGp: GamesExplorerCompareViewDataValue[] = [];
            const storeSteam: GamesExplorerCompareViewDataValue[] = [];
            const kpiRevenue: GamesExplorerCompareViewDataValue[] = [];
            const kpiTAM: GamesExplorerCompareViewDataValue[] = [];
            const kpiTotalAudience: GamesExplorerCompareViewDataValue[] = [];
            const kpiThreatScore: GamesExplorerCompareViewDataValue[] = [];
            const kpiInstall: GamesExplorerCompareViewDataValue[] = [];
            const kpiGrowth: GamesExplorerCompareViewDataValue[] = [];
            const kpiRating: GamesExplorerCompareViewDataValue[] = [];
            const kpiReleased: GamesExplorerCompareViewDataValue[] = [];
            const developer: GamesExplorerCompareViewDataValue[] = [];
            //const dateScraped: GamesExplorerCompareViewDataValue[] = [];
            const dateTagged: GamesExplorerCompareViewDataValue[] = [];

            const subcategories: Map<number, Map<TTagId, GamesExplorerCompareViewDataValue[]>> = new Map<number, Map<TTagId, GamesExplorerCompareViewDataValue[]>>();

            function getSubcategoryName(subcategoryId: number): string {
                const d = portalStore.portalDefProduct.find((x) => x.subcategory_int === subcategoryId);
                if (d !== undefined) {
                    return d.subcategory_client_name ?? d.subcategory;
                }
                return "";
            }

            for (let i = 0; i < portalStore.portalDefProduct.length; ++i) {
                const tagDef = portalStore.portalDefProduct[i];

                if (tagDef.wip) {
                    continue;
                }

                if (tagDef.is_survey) {
                    if (!subcategories.has(tagDef.subcategory_int)) {
                        subcategories.set(tagDef.subcategory_int, new Map<TTagId, GamesExplorerCompareViewDataValue[]>());
                    }
                    if (!subcategories.get(tagDef.subcategory_int)?.has(tagDef.tag_id)) {
                        subcategories.get(tagDef.subcategory_int)?.set(tagDef.tag_id, []);
                    }

                    for (let i = 0; i < this.filteredSelectedItems.length; ++i) {
                        const data = this.getCompareAppData(this.filteredSelectedItems[i]);
                        const v: GamesExplorerCompareViewDataValue = {
                            b: TagsHelper.hasTag(data.tags, tagDef.tag_id)
                        }
                        v.item = this.filteredSelectedItems[i];
                        v.canChange = this.filteredSelectedItems[i].type === GamesExplorerSelectedItemTypeEnum.OPPORTUNITY || this.filteredSelectedItems[i].type === GamesExplorerSelectedItemTypeEnum.CONCEPT;
                        v.title = data.title;
                        v.tagDef = tagDef;
                        v.tagId = tagDef.tag_id;
                        v.tagDetail = data.tags;
                        v.tagsViewTagData = {
                            tagDef: tagDef
                        }
                        subcategories.get(tagDef.subcategory_int)?.get(tagDef.tag_id)?.push(v);
                    }
                }
            }

            this.chartData.length = 0;

            for (let i = 0; i < this.filteredSelectedItems.length; ++i) {
                const selectedItem = this.filteredSelectedItems[i];
                const data = this.getCompareAppData(selectedItem);

                let revenue = "-";
                if (data.revenue !== undefined) {
                    revenue = `$${GembaseUtils.formatNumber(data.revenue)}`;
                }

                storeGp.push({
                    b: data.store === AppStoreEnum.GOOGLE_PLAY,
                    item: selectedItem
                });
                storeSteam.push({b: data.store === AppStoreEnum.STEAM, item: selectedItem});
                kpiRevenue.push({s: revenue, item: selectedItem});
                kpiTAM.push({s: data.tam, item: selectedItem});
                let item: GamesExplorerCompareViewDataValue = {s: data.total_audience, item: selectedItem};
                if (selectedItem.type === GamesExplorerSelectedItemTypeEnum.APP || GamesExplorerSelectedItemTypeEnum.CONCEPT) {
                    item.click = this.showAudienceTooltip;
                    item.tagDetail = data.tags;
                }
                kpiTotalAudience.push(item);
                kpiInstall.push({s: data.installs, item: selectedItem});
                kpiGrowth.push({s: data.growth, item: selectedItem});
                kpiRating.push({s: data.rating.toString(), item: selectedItem});
                kpiReleased.push({s: data.released_year.toString(), item: selectedItem});

                const ts = this.threatScores.find((x) => x.id === selectedItem.id);
                item = {l: ts?.ts === undefined, s: ts?.ts ?? "", tagDetail: data.tags, item: selectedItem}
                item.click = this.showTsTooltip;
                kpiThreatScore.push(item);

                if (data.app_type === AppTypeEnum.STORE) {
                    this.chartData.push(
                        {
                            appId: data.app_id,
                            tam: data.tam_raw,
                            ts: ts?.tsRaw ?? 0
                        }
                    )
                }

                let s = "";

                if (data.app_type === AppTypeEnum.STORE && data.scraped_t !== undefined) {
                    s = `${GembaseUtils.timestampDaysDiff(data.scraped_t)} days`
                }
                //dateScraped.push({s: s, item: selectedItem});

                s = "";
                if (data.app_type === AppTypeEnum.STORE && data.tagged_t !== undefined) {
                    s = `${GembaseUtils.timestampDaysDiff(data.tagged_t)} days`
                }
                dateTagged.push({s: s, item: selectedItem});

                developer.push({s: data.dev_title, item: selectedItem});
            }

            compareViewData.push(
                {
                    header: "Platforms",
                    rows: [
                        {
                            title: "Google Play",
                            values: storeGp
                        },
                        {
                            title: "Steam",
                            values: storeSteam
                        }
                    ]
                },
                {
                    header: "Metadata",
                    rows: [
                        {
                            title: "TAM Revenues",
                            values: kpiTAM
                        },
                        {
                            title: "LT Revenues",
                            values: kpiRevenue
                        },

                        {
                            title: "TAM Installs",
                            values: kpiTotalAudience
                        },
                        {
                            title: "LT Installs",
                            values: kpiInstall
                        },
                        {
                            title: "Growth / year",
                            values: kpiGrowth
                        },
                        {
                            title: "Threat score",
                            values: kpiThreatScore
                        },
                        {
                            title: "Rating",
                            values: kpiRating
                        },
                        {
                            title: "Released",
                            values: kpiReleased
                        },
                        {
                            title: "Labeled",
                            values: dateTagged
                        },
                        {
                            title: "Developer",
                            values: developer
                        }
                    ]
                }
            );

            for (const [subcategoryId, tagMap] of subcategories) {
                const subcategoryName = getSubcategoryName(subcategoryId);
                const o: GamesExplorerCompareViewData = {
                    header: subcategoryName,
                    rows: []
                }
                compareViewData.push(o);

                for (const [tagId, values] of tagMap) {
                    const tagDef = portalStore.getPortalDefProductItem(tagId);
                    const node = portalStore.getTagName(tagId);
                    if (tagDef?.locked) {
                        o.locked = true;
                    }
                    o.rows.push({
                        title: node,
                        tooltip: tagDef?.description,
                        values: values,
                        locked: tagDef?.locked
                    });
                }
            }

            this.compareViewData = compareViewData;
            this.compareViewDataChange++;
        },
        async updateDevDetails() {

            // remove unused
            this.devDetails.forEach((y) => {
                const toRemove: DevDetailFilter[] = [];
                if (this.filters.find((f) => f.filter.dev_ids.includes(y.devId)) === undefined) {
                    toRemove.push(y);
                }
                toRemove.forEach((r) => {
                    this.devDetails.splice(this.devDetails.indexOf(r), 1);
                });
            });

            // add not loaded
            this.filters.forEach((f) => {
                f.filter.dev_ids.forEach((x) => {
                    if (this.devDetails.find((y) => y.devId === x) === undefined) {
                        this.devDetails.push({
                            devId: x
                        });
                    }
                });
            })

            // get data for not loaded devs
            const toUpdate: TDeveloperId[] = [...this.devDetails.filter((x) => x.devDetail === undefined).map((x) => x.devId)];
            if (toUpdate.length > 0) {
                const response = await useAppsStore().getDevsDetailsAsync(toUpdate);
                response.forEach((x) => {
                    const d = this.devDetails.find((y) => y.devId === x.dev_id);
                    if (d !== undefined) {
                        d.devDetail = x;
                    }
                });
            }
        },
        addDevFilter(filterId: string, devId: TDeveloperId) {
            this.filters.forEach((x) => {
                if (x.filter.id === filterId) {
                    GembaseUtils.addToArrUnique(x.filter.dev_ids, devId);
                    this.updateFilters();
                }
            });
            this.updateDevDetails();
        },
        removeDevFilter(filterId: string, devId: TDeveloperId) {
            this.filters.forEach((x) => {
                if (x.filter.id === filterId) {
                    GembaseUtils.removeFromArr(x.filter.dev_ids, devId);
                    this.updateFilters();
                }
            });
        },
        getAppSegmentsColors(appId: TAppId) {
            const res: string[] = [];
            for (let i = 0; i < this.filters.length; ++i) {
                for (let j = 0; j < this.filters[i].apps.length; ++j) {
                    if (this.filters[i].apps[j].item.id === appId) {
                        res.push(itemsPalette[i]);
                        break;
                    }
                }
            }
            return res;
        },
        isLocked() {
            return portalStore.isModuleLocked(EModuleId.GAMES_EXPLORER);
        },
        async clearAll() {
            this.filters.length = 0;
            this.selectedItems.length = 0;
            this.addFilterGroup();
            await this.updateFilters();
        },
        getItemColorByIndex(index: number): string {
            if (index > itemsPalette.length - 1) {
                index = index - Math.floor(index / itemsPalette.length) * itemsPalette.length;
            }
            return itemsPalette[index];
        },
        getItemColor(itemId: string): string {
            if (!this.isSelected(itemId)) {
                return GB_PALETTE.BLACK;
            }
            if (takenColorPerId.has(itemId)) {
                return takenColorPerId.get(itemId) ?? GB_PALETTE.BLACK;
            } else {
                for (let i = 0; i < itemsPalette.length; ++i) {
                    let found = false;
                    for (const [id, color] of takenColorPerId) {
                        if (color === itemsPalette[i]) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        takenColorPerId.set(itemId, itemsPalette[i]);
                        return itemsPalette[i];
                    }
                }

                const rnd = GembaseUtils.randomFromArray(itemsPalette);
                if (rnd !== undefined) {
                    takenColorPerId.set(itemId, rnd);
                    return rnd;
                }
                return GB_PALETTE.BLACK;
            }
        }
    },
    getters: {
        filteredSelectedItems(): GamesExplorerSelectedItem[] {
            const itemsCnt = Math.min(
                this.selectedItems.length,
                this.advancedFilterDataMap?.top_competitors ?? this.selectedItems.length);
            return this.selectedItems.slice(0, itemsCnt);
        }
    }
});
