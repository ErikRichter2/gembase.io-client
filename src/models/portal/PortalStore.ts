import {defineStore} from "pinia";
import EndpointRequest from "@/core/requests/EndpointRequest";
import {useAuthStore} from "@/models/auth/AuthStore";
import {
    AppDetail,
    DevDetail,
    TAppId,
    TagDetail,
    TDeveloperId,
    TTagId
} from "@/models/portal/apps/AppsData";
import {
    AllowedTagsPerLockedModuleDef,
    AppDetailChanges,
    AppGalleryChanges,
    ITutorialResponse,
    PortalCommandResponse,
    PromptDef,
    TAG_SUBCATEGORY_GENRE,
    TsParamsDef,
    UserPositionDef,
    UserRoleDef,
} from "@/models/portal/PortalDataTypes";
import ClientError from "@/core/errors/ClientError";
import {PlatformProductDefData, TagsViewTagData} from "@/models/portal/platformProduct/PlatformProductData";
import GembaseUtils from "@/utils/GembaseUtils";
import {TagsHelper} from "@/models/portal/tags/TagsHelper";
import {EndpointFilesRequest} from "@/core/requests/EndpointFileRequest";
import {AppDetailUtils} from "@/models/portal/apps/AppDetailUtils";
import {EBillingModuleId, EModuleId, PortalConstants} from "@/models/portal/PortalConstants";
import {UserPositionAreaDef, UserPositionRoleDef} from "@/models/portal/definitions/DefinitionsData";
import {
    AdvancedFilterData,
    InstallTier,
    SearchSortEnum,
    SearchWeight
} from "@/models/portal/competitor/PortalCompetitorData";
import {LocalStorageModel} from "@/models/storage/LocalStorageModel";
import {TaggingContext, useTaggingStore} from "@/models/portal/tags/TaggingStore";
import {useTutorialStore} from "@/models/portal/tutorial/TutorialStore";
import {PlatformProductTreeView, TagsModel} from "@/models/portal/tags/TagsModel";
import {useAppsStore} from "@/models/portal/apps/AppsStore";
import {usePlatformCalcStore} from "@/models/portal/calc/PlatformCalcStore";
import {
    IPlatformCalcAffinity,
} from "@/models/portal/calc/PlatformCalcData";
import {OpportunityHelper} from "@/models/portal/gaps/OpportunityHelper";

const portalDefProductMap: Map<TTagId, PlatformProductDefData> = new Map<TTagId, PlatformProductDefData>();

export declare type TGapsSortBy = "ts" | "tam";

interface IPotentialDownloads {
    geo: {id: "na" | "eu" | "latam" | "mena" | "apac", ratio: number}[];
    platform: {id: "mobile" | "pc" | "console", absolute: number}[];
}

interface IInitialData {
    state: string,
    app_details: AppDetail[],
    credits: number,
    unlocked_modules: number[],
    def: {
        product_nodes: PlatformProductDefData[],
        user_roles: UserRoleDef[],
        user_positions: UserPositionDef[],
        user_position_role: UserPositionRoleDef[],
        user_position_area: UserPositionAreaDef[],
        allowed_tags_per_locked_module: AllowedTagsPerLockedModuleDef[],
        advanced_filter_weights: SearchWeight[],
        install_tiers: InstallTier[],
        ts_params: TsParamsDef[],
        potential_downloads: IPotentialDownloads
    },
    tutorial: ITutorialResponse
}

export const usePortalStore = defineStore('portalStore', {
    state: () => ({
        initialized: Boolean(false),
        my_apps: [] as TAppId[],
        promptsDef: {} as PromptDef,
        componentName: String(""),
        portalSidebarOn: Boolean(true),
        portalDefProduct: [] as PlatformProductDefData[],
        credits: Number(0),
        gapsTagIds: [] as TTagId[],
        userPositionDef: [] as UserPositionDef[],
        userRoleDef: [] as UserPositionDef[],
        userPositionRoleDef: [] as UserPositionRoleDef[],
        userPositionAreaDef: [] as UserPositionAreaDef[],
        unlockedModules: [] as EBillingModuleId[],
        allowedTagsPerLockedModule: [] as AllowedTagsPerLockedModuleDef[],
        opportunitiesDetails: [] as IPlatformCalcAffinity[],
        advancedFilterWeightsDef: [] as SearchWeight[],
        advancedFilterData: undefined as AdvancedFilterData | undefined,
        unlockedTagsIds: [] as TTagId[],
        inviteFriendPopup: false,
        installTiers: [] as InstallTier[],
        tsParams: [] as TsParamsDef[],
        searchGapsSortType: "tam" as TGapsSortBy,
        searchGapsSortAsc: [] as TGapsSortBy[],
        potentialDownloads: {} as IPotentialDownloads
    }),
    actions: {
        async init() {
            if (this.initialized) {
                return;
            }
            await this.loadPortalData();
            const advancedFilter = LocalStorageModel.getItem("auditor-advanced-filter");
            if (advancedFilter !== undefined) {
                try {
                    const advancedFilterData: AdvancedFilterData = {
                        stores: [],
                        weights: [],
                        current_store: true,
                        top_competitors: 20,
                        sorting: SearchSortEnum.ThreatScore
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
                    this.advancedFilterData = advancedFilterData;
                } catch (e) {
                    // do nothing
                }
            }
            this.initialized = true;
            this.searchDefaultGaps();
            EndpointRequest.addResponseHook("portal-store", this.responseHook);
        },
        responseHook(response: PortalCommandResponse) {
            if (response.credits !== undefined) {
                this.credits = response.credits;
            }
        },
        getPosition(positionArea: number, positionRole: number) {
            return `${this.getPositionArea(positionArea)?.value} ${this.getPositionRole(positionRole)?.value}`;
        },
        getPositionRole(id: number): UserPositionRoleDef | undefined {
            return this.userPositionAreaDef.find((x) => x.id === id);
        },
        getPositionArea(id: number): UserPositionAreaDef | undefined {
            return this.userPositionAreaDef.find((x) => x.id === id);
        },
        remainingConceptsToCreate() {
            if (this.isAuditorLocked()) {
                const res = 2 - useAuthStore().data.user.concepts_counter;
                if (res < 0) {
                    return 0;
                }
                return res;
            }
            return 0;
        },
        canTagConcept(appId: TAppId): boolean {
            if (this.isAuditorLocked()) {
                return useAppsStore().getAppDetail(appId).tagged_by_user < 1;
            }
            return true;
        },
        getTagName(tagId: TTagId): string {
            const def = this.getPortalDefProductItem(tagId);
            if (def === undefined) {
                throw new ClientError(`Tag ${tagId} not found`)
            }
            if (def.locked === 1) {
                return "Locked";
            }
            return def.node;
        },
        getSubcategoryName(subcategoryInt: number): string {
            const d = this.portalDefProduct.find((x) => x.subcategory_int === subcategoryInt)
            if (d !== undefined) {
                return d.subcategory;
            }
            throw new ClientError(`Subcategory ${subcategoryInt} not found`);
        },
        getPortalDefProductItem(tagId: TTagId): PlatformProductDefData | undefined {
            return portalDefProductMap.get(tagId);
        },
        clear() {
            this.initialized = false;
        },
        async tagConceptApp(
            appId: TAppId,
            taggingContext: TaggingContext
        ) {
            const appDetail = useAppsStore().getAppDetail(appId);
            appDetail.tagged_by_user++;
            useTaggingStore().removeTaggedApp(appId);
            return await useTaggingStore().tagConceptApp(appId, taggingContext);
        },
        searchDefaultGaps() {
            usePlatformCalcStore().allTags({
                context: "platform",
                input: {}
            });
        },
        isSidebarOn() {
            return useAuthStore().data.isAuthenticated && this.portalSidebarOn;
        },
        async loadPortalData() {

            const response = await EndpointRequest.processUntil<IInitialData>({
                command: "portal:get",
                stopCallback: (data) => data.state === "ok",
                delay: 1000
            });

            // genres topics first
            response.def.product_nodes.sort((a, b) => {
                if (a.subcategory_int != b.subcategory_int) {
                    if (a.subcategory_int === TagsHelper.TAG_SUBCATEGORY_GENRE) {
                        return -1;
                    }
                    if (b.subcategory_int === TagsHelper.TAG_SUBCATEGORY_GENRE) {
                        return 1;
                    }
                    if (a.subcategory_int === TagsHelper.TAG_SUBCATEGORY_TOPICS) {
                        return -1;
                    }
                    if (b.subcategory_int === TagsHelper.TAG_SUBCATEGORY_TOPICS) {
                        return 1;
                    }
                }
                return 0;
            });
            this.portalDefProduct = response.def.product_nodes;
            this.userPositionDef = response.def.user_positions;
            this.userPositionRoleDef = response.def.user_position_role;
            this.userPositionAreaDef = response.def.user_position_area;
            this.allowedTagsPerLockedModule = response.def.allowed_tags_per_locked_module;
            this.advancedFilterWeightsDef = response.def.advanced_filter_weights;
            this.installTiers = response.def.install_tiers;
            this.tsParams = response.def.ts_params;
            this.potentialDownloads = response.def.potential_downloads;

            this.unlockedTagsIds = [];
            this.portalDefProduct.forEach((x) => {
                if (x.locked === 0) {
                    this.unlockedTagsIds.push(x.tag_id);
                }
            })
            TagsHelper.init(this.portalDefProduct);
            portalDefProductMap.clear();
            this.portalDefProduct.forEach((x) => {
                portalDefProductMap.set(x.tag_id, x);
            });
            this.portalDefProduct.sort((a, b) => {
                const ix1 = TagsHelper.SORT_SUBCATEGORIES.indexOf(a.subcategory_int);
                const ix2 = TagsHelper.SORT_SUBCATEGORIES.indexOf(b.subcategory_int);
                if (ix1 != ix2) {
                    if (ix1 === -1) {
                        return 1;
                    }
                    if (ix2 === -1) {
                        return -1;
                    }
                    return ix1 - ix2;
                }
                return a.node.localeCompare(b.node);
            });
            this.credits = response.credits;
            response.app_details.forEach((x) => {
                useAppsStore().addAppDetail(x);
            });
            this.unlockedModules = response.unlocked_modules;

            const myApps: TAppId[] = [];
            response.app_details.forEach((x) => {
                myApps.push(x.app_id);
            });
            this.my_apps = myApps;

            useTutorialStore().init(response.tutorial);
        },
        async addAppFromStoreToMyApps(appIdInStore: string, store: number): Promise<AppDetail> {
            const response = await EndpointRequest.process2<AppDetail>("portal:add_app_from_store_to_my_apps", {
                app_id_in_store: appIdInStore,
                store: store
            });

            GembaseUtils.addToArrUnique(this.my_apps, response.app_id);
            useAppsStore().addAppDetail(response);
            useAuthStore().data.user.added_to_my_apps++;

            return response;
        },
        __addAppIdToMyAppsModel(appId: TAppId) {
            GembaseUtils.addToArrUnique(this.my_apps, appId);
        },

        async removeAppFromMyApps(appId: TAppId) {
            await EndpointRequest.process2("portal:remove_app_from_my_apps", {
                app_id: appId
            });
            GembaseUtils.removeFromArr(this.my_apps, appId);
        },
        async scrapApp(appIdInStore: string, store: number) {
            const response = await EndpointRequest.process2<AppDetail>("portal:scrap_app", {
                app_id_in_store: appIdInStore,
                store: store
            });
            useAppsStore().addAppDetail(response);
            return response;
        },
        async scrapDev(devIdInStore: string, store: number) {
            const response = await EndpointRequest.processUntil<{
                state: string,
                dev_detail: DevDetail
            }>({
                command: "portal:scrap_dev",
                requestPayload: {
                    dev_id_in_store: devIdInStore,
                    store: store
                },
                stopCallback: (data) => data.state === "ok"
            });

            useAppsStore().addDevDetail(response.dev_detail);
            return response.dev_detail;
        },
        async getMyAppDetailsAsync(): Promise<void> {
            const appIdsToGet = this.my_apps.filter((x) => !useAppsStore().hasAppDetail(x));

            if (appIdsToGet.length > 0) {
                const response = await EndpointRequest.processUntil<{
                    state: number,
                    app_details: AppDetail[]
                }>({
                    command: "portal:get_app_details",
                    requestPayload: {
                        app_ids: appIdsToGet
                    },
                    stopCallback: (data) => data.state !== 2
                });

                response.app_details.forEach((x) => {
                    useAppsStore().addAppDetail(x);
                });
            }
        },
        async getDevDetailAsync(devId: TDeveloperId): Promise<DevDetail> {
            const devsDetails = await useAppsStore().getDevsDetailsAsync([devId]);
            for (let i = 0; i < devsDetails.length; ++i) {
                if (devsDetails[i].dev_id === devId) {
                    return devsDetails[i];
                }
            }
            throw new ClientError(`Developer ${devId} not found`);
        },
        async getOpportunityDetail(opportunityUuid: string | undefined): Promise<IPlatformCalcAffinity | undefined> {
            if (opportunityUuid === undefined) {
                return undefined;
            }
            const opportunity = this.opportunitiesDetails.find(
                (x) => x.uuid === opportunityUuid
            );
            if (opportunity !== undefined) {
                return opportunity;
            }
            const response =
                await EndpointRequest.process2<IPlatformCalcAffinity | undefined>("portal:get_opportunity_detail", {
                    uuid: opportunityUuid
                });
            if (response !== undefined) {
                this.opportunitiesDetails.push(response);
            }
            return response;
        },
        canChangeTag(tagId: TTagId, moduleId: EBillingModuleId) {
            if (this.isBillingModuleLocked(moduleId)) {
                const tagDef = this.getPortalDefProductItem(tagId);

                if (tagDef === undefined) {
                    return false;
                }

                if (tagDef.locked) {
                    return false;
                }

                if (this.isDemo() && TagsHelper.canChange(true, moduleId, tagDef.tag_id, this.allowedTagsPerLockedModule)) {
                    return true;
                }

                return false;
            }

            return true;
        },
        async loadDevsAppsDetails() {
            await this.getMyAppDetailsAsync();
        },
        async createConceptAsCopy(appId: TAppId) {
            const response = await EndpointRequest.process2<AppDetail>("portal:create_concept_as_copy", {
                app_id: appId
            });
            this.__addAppIdToMyAppsModel(response.app_id);
            useAppsStore().addAppDetail(response);
            return response;
        },
        async saveConceptApp(
            appId: TAppId,
            appDetailChanges: AppDetailChanges | undefined,
            galleryChanges: AppGalleryChanges | undefined,
            appIconChange?: File) {

            const files: File[] = [];

            if (galleryChanges !== undefined) {
                galleryChanges.added_images.forEach((x) => {
                    files.push(x.file)
                });
            }

            if (useAppsStore().hasAppDetail(appId)) {
                if (appDetailChanges?.tags !== undefined) {
                    const currentTags = useAppsStore().getAppDetail(appId).tags;
                    if (GembaseUtils.compareObjObj(currentTags, appDetailChanges.tags)) {
                        appDetailChanges.tags = undefined;
                    }
                }
            }

            let appDetail = await EndpointFilesRequest.process2<AppDetail>("portal:save_concept_app", files, {
                app_id: appId,
                app_detail_changes: appDetailChanges
            });

            if (appIconChange !== undefined) {
                appDetail = await EndpointFilesRequest.process2<AppDetail>("portal:save_concept_app_icon", [appIconChange], {
                    app_id: appId
                });
                appDetail.rnd = GembaseUtils.serverTimestamp().toString();
            }

            useAppsStore().addAppDetail(appDetail);
            return appDetail;
        },
        async createConceptAppFromTemp(
            appDetailChanges: AppDetailChanges | undefined
        ) {
            const response = await EndpointRequest.process2<AppDetail>("portal:create_concept_app_from_temp", {
                app_detail_changes: appDetailChanges
            });
            useAuthStore().data.user.concepts_counter++;
            this.__addAppIdToMyAppsModel(response.app_id);
            useAppsStore().addAppDetail(response);
            return response;
        },
        getAppTitle(
            appDetail: AppDetail | undefined,
            tagsIds: TTagId[] | undefined,
            opportunity: IPlatformCalcAffinity | undefined = undefined
        ): string | undefined {
            if (opportunity !== undefined) {
                return new OpportunityHelper(opportunity).title;
            }

            if (appDetail !== undefined) {
                return AppDetailUtils.getTitle(appDetail);
            }

            if (tagsIds !== undefined) {
                const arr: string[] = [];
                for (let i = 0; i < tagsIds.length; ++i) {
                    const tagDef = this.getPortalDefProductItem(tagsIds[i]);
                    if (tagDef !== undefined) {
                        if (i === 0) {
                            arr.push(tagDef.node);
                        } else if (tagDef.subcategory === TAG_SUBCATEGORY_GENRE && arr.length < 3) {
                            arr.push(tagDef.node);
                        }
                    }
                }
                return arr.join(" ");
            }

            return undefined;
        },
        titleDemo() {
            if (this.isDemo()) {
                return " (DEMO)";
            }
            return "";
        },
        isDemo() {
            return this.isAuditorLocked();
        },
        isTunerLocked() {
            return this.isAuditorLocked();
        },
        isModuleLocked(moduleId: EModuleId) {
            const m = PortalConstants.billingModules.find((x) => x.modules.includes(moduleId));
            if (m === undefined) {
                throw new ClientError(`Module ${moduleId} not found`);
            }
            return this.isBillingModuleLocked(m.id);
        },
        isBillingModuleLocked(moduleId: EBillingModuleId) {
            return !this.unlockedModules.includes(moduleId);
        },
        isAuditorLocked() {
            return this.isBillingModuleLocked(EBillingModuleId.AUDIT);
        },
        isIdeasLocked() {
            return this.isBillingModuleLocked(EBillingModuleId.IDEAS);
        },
        isInsightLocked() {
            return this.isBillingModuleLocked(EBillingModuleId.INSIGHTS);
        },
        canShowTooltips(moduleId: EBillingModuleId, tags: TagDetail[], tagId: TTagId) {
            if (this.isAuditorLocked()) {
                if (TagsHelper.hasTag(tags, tagId)) {
                    return true;
                }
                if (this.canChangeTag(tagId, moduleId)) {
                    return true;
                }
                return false;
            }
            return true;
        }
    },
    getters: {
        tagsTreeView(): PlatformProductTreeView<TagsViewTagData> {
            const tags: TagsViewTagData[] = [];
            this.portalDefProduct.forEach((x) => {
                tags.push({
                    tagDef: x,
                    readonly: this.auditorLocked
                })
            });
            return TagsModel.createTreeView(tags);
        },
        auditorLocked(): boolean {
            return !this.unlockedModules.includes(EBillingModuleId.AUDIT);
        },
        isAdmin(): boolean {
            return useAuthStore().isAdmin();
        }
    }
});
