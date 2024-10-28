<template>
    <gb-window-container class="scoped-root">

        <div class="relative gb-auditor-window-width" :data-state="tunerPopupState.toString()">

            <div class="absolute inset-0">
                <div v-if="tunerPopupState != 1" class="absolute top-1/2 right-[-45px] h-[50px] w-[70px]">
                    <gb-button @click="showTuner" :demo="isTunerLocked" tooltip="Tuner" icon="potential" class="gbc-bg-primary !rounded-xl !h-full !w-full !pr-0 !pt-[8px] !pb-[8px]"></gb-button>
                </div>
                <div v-if="!isTunerLocked" :data-state="tunerPopupState.toString()" class="tuner-popup-container w-full h-full relative gb-layout-ml">
                    <div v-if="tunerPopupState === 1 || tunerPopupState === 0" class="tuner-popup gb-bg-window text-[0.8rem]" :data-state="tunerPopupState.toString()">
                        <auditor-audit-tuner-popup @change="onTunerChange" @close="tunerPopupState = 0" :app-id="appDetail?.app_id" :history="auditorTuner.tunerHistory.value" :tuner-index="auditorTuner.tunerIndex.value"></auditor-audit-tuner-popup>
                    </div>
                </div>
            </div>

            <div class="gb-window w-fit">

                <gembase-ui-window-close-btn></gembase-ui-window-close-btn>

                <div class="gb-layout-tl gap-2 max-w-[var(--default-w)] w-[var(--default-w)]">

                    <!-- loading progress -->
                    <div v-if="calcProgress !== undefined" class="absolute top-[52px] right-[18px] gb-layout z-50">
                        <tagging-progress class="!p-2" :product-nodes-progress="calcProgress ?? 0"></tagging-progress>
                    </div>
                    <!-- loading progress -->

                    <!-- TITLE >> -->
                    <div class="gb-layout-m-between w-full gap-2 pl-2 pb-2">
                        <div class="gb-layout-ml-row gap-2">
                            <platform-app-icon class="rounded-xl !w-[70px] !h-[70px]" :force-concept-icon="saveChangesPopup" :default-black-border="true" :app-icon="appDetail"></platform-app-icon>
                            <div class="gb-layout-tl">
                                <div class="gb-layout-tl-row gap-3 pl-1">
                                    <div class="gb-layout-tl leading-[1.1rem]">
                                        <auditor-app-title-with-developer :force-concept="saveChangesPopup" :opportunity="__opportunityDetail" :demo="portalStore.isDemo()" :app-detail="appDetail" :tags="tags"></auditor-app-title-with-developer>
                                    </div>
                                    <div class="gb-layout-tl-row">
                                        <auditor-games-explorer-developer-route-element v-if="appDetail?.dev_id !== undefined" :dev-id="appDetail.dev_id"></auditor-games-explorer-developer-route-element>
                                        <auditor-app-store-icon-link :app="appDetail" class="pl-2"></auditor-app-store-icon-link>
                                    </div>
                                </div>
                                <auditor-app-kpis :app-detail="appDetail"></auditor-app-kpis>
                            </div>
                        </div>
                    </div>


                    <!-- << TITLE -->

                    <gembase-ui-window-subtitle close-id="competitor-page-audience">
                    <span>
                        Explore Mechanics and Content to discover features with high market potential and low threat score. Tap the features to change product’s position in the market.
                    </span>
                    </gembase-ui-window-subtitle>

                    <!-- TAGS >> -->
                    <div class="gb-inner-window gb-auditor-tags w-full relative" :data-save-changes="saveChangesPopup">
                        <mechanics-content-tags v-model="calcProgress" :calc-data="mechanicsContentCalcDataViewInput" :context="platformCalcContext" :app-title="myAppTitle" @toggle-tag="toggleTag" :my-app="appDetail" :competitor-app="selectedCompetitor"></mechanics-content-tags>
                        <gb-svg icon="expand_menu" class="text-white/5 w-[30px] h-[20px] absolute bottom-[-15px] left-[calc(50%-10px)]"></gb-svg>
                    </div>
                    <!-- << TAGS -->

                    <!-- AUDIENCE >> -->
                    <div class="gb-inner-window w-full relative">
                        <div class="gb-layout w-full gap-2">
                            <div class="gb-layout w-full h-full gap-2 pt-1">
                                <div class="gb-layout-row w-full pr-2 gap-5 h-[35px] pl-2">
                                    <div class="gb-layout-row h-full gap-2">
                                        <gb-svg class="h-[90%] w-auto" :src="PortalUtils.getIconForNodeCategory(NODE_CATEGORY_AUDIENCE)"></gb-svg>
                                        <span class="font-bold">Audiences</span>
                                    </div>
                                    <div class="gb-layout-row relative h-full grow">
                                        <template v-if="audienceAngles.length > 0 && audienceSelectOptions.length > 0">
                                            <gembase-ui-select options-id-prefix="auditor_audiences_select_options" id="auditor_audiences_select" class="gb-ui-competitor-page-audience-select !w-full h-full" @on-change="onAudienceChange" :selected="routerQuery.query.value.audienceAngle" :items="audienceSelectOptions" placeholder="Choose an audience angle …"></gembase-ui-select>
                                            <gb-svg v-if="audienceAngleData !== undefined" icon="expand_menu" class="absolute w-[30px] h-[20px] left-[50%] bottom-[-11px]"></gb-svg>
                                        </template>
                                    </div>
                                    <div class="w-[180px] h-[30px]">
                                        <portal-ui-tam-v2 class="w-full h-full" @audience="onAudienceSelectAudienceClick" v-if="audienceAngles.length > 0 && audienceAngleData !== undefined" :tam="audienceAngleData.tam" :audience="audienceAngleData.audience_stats" :show-icon="true"></portal-ui-tam-v2>
                                    </div>
                                </div>
                                <div v-if="audienceAngleData !== undefined" class="gb-inner-window gb-layout-m-between w-full pt-2 pb-2">
                                    <div class="text-[0.9em]">{{ demoText }}</div>
                                    <portal-ui-router-link :to="{name: RoutesEnum.PLAYERS, query: playerExplorerQuery}">
                                        <gb-button id="auditor_audit_players_explorer_btn" :icon="PortalConstants.ICON_PLAYERS" class="gbc-bg-primary" tooltip="Segment details"></gb-button>
                                    </portal-ui-router-link>
                                </div>
                            </div>
                            <gb-svg icon="expand_menu" class="text-white/5 w-[30px] h-[20px] absolute bottom-[-15px] left-[calc(50%-10px)]"></gb-svg>
                        </div>
                        <gembase-ui-inline-loading-bar-anim :h="50" :w="50" :show="inlineLoadingAudienceHandler.visible.value"></gembase-ui-inline-loading-bar-anim>
                    </div>

                    <!-- << AUDIENCE -->

                    <!-- COMPETITORS >> -->
                    <div class="gb-inner-window w-full relative">
                        <div class="gb-layout-tl w-full gap-2 max-h-[300px]">
                            <div class="gb-layout w-full gap-2">
                                <div class="gb-layout w-full gap-2">
                                    <div class="gb-layout-c-between w-full h-[40px]">
                                        <div class="gb-layout-m-between w-full h-full gap-2 pl-2 pt-1">
                                            <div class="gb-layout-row w-full gap-1 h-full">
                                                <gb-svg icon="competitors" class="h-full w-auto"></gb-svg>
                                                <div class="w-full h-full">
                                                        <span class="w-full h-full gb-layout-ml-row gap-2 font-bold pr-2">
                                                            <template v-if="competitors !== undefined">
                                                                <div v-if="competitors.ts_items !== undefined">
                                                                    Top {{shownTopCompetitorsCount}} competitors
                                                                </div>
                                                                <div v-else>
                                                                    No competitors for selected opportunity and audience
                                                                </div>
                                                            </template>
                                                            <template v-else>
                                                                <div class="gb-layout-m-between w-full h-full">
                                                                    <span>Top 20 competitors</span>
                                                                    <span class="text-[0.7em] font-normal text-gray-600">Choose audience to see fitting competitors</span>
                                                                </div>
                                                            </template>
                                                            <games-explorer-router-element id="auditor_audit_games_explorer_btn" v-if="gamesExplorerQuery !== undefined" :demo="portalStore.isModuleLocked(EModuleId.GAMES_EXPLORER)" :query="gamesExplorerQuery"></games-explorer-router-element>
                                                            <gb-button v-if="(competitors?.ts_items?.length ?? 0) > 0" tooltip="Advanced filter" @click="showAdvancedFilter = !showAdvancedFilter" icon="digital-transformation" class="gbc-bg-primary" :show-glow="true"></gb-button>
                                                        </span>
                                                </div>
                                            </div>
                                            <div v-if="competitors !== undefined" class="h-[35px] w-[120px]">
                                                <portal-ui-threat-score-component :angle="PortalCompetitorUtils.getNameForAudience(audienceAngleData)" id="auditor_competitors_ts" :show-icon="true" @click="setThreatScoreTooltipDataForTopApps" :threat-score="shownTopCompetitorsMedian"></portal-ui-threat-score-component>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-if="competitors !== undefined && competitors.ts_items !== undefined" class="gb-layout-tl-row w-full gap-[2px]" :class="{'gb-ui-scroll-h': shownTopCompetitorsCount > 20}" :style="{height: shownTopCompetitorsCount > 20 ? '40px' : '32px', paddingBottom: shownTopCompetitorsCount > 20 ? '8px' : '0', maxWidth: shownTopCompetitorsCount > 20 ? '750px' : 'auto', justifyContent: shownTopCompetitorsCount < 20 ? 'flex-start': 'space-between'}">
                                        <template v-for="(c, index) in competitors.ts_items" :key="c.app_id">
                                            <interactive-image v-if="index < maxTopCompetitorsCount" @click="onSelectCompetitor(c.app_id)" class="h-full w-auto aspect-square rounded-md" data-fade-state="in" :data-tooltip="getCompetitorDetail(c.app_id)?.title">
                                                <platform-app-icon :default-black-border="true" :app-icon="getCompetitorDetail(c.app_id)" :selected="selectedCompetitor?.app_id === c.app_id"></platform-app-icon>
                                            </interactive-image>
                                        </template>
                                    </div>
                                </div>
                                <auditor-audit-competitor-detail @on-ts-single-app="setThreatScoreTooltipDataForSingleApp" :selected-competitor="selectedCompetitor" :competitors="competitors"></auditor-audit-competitor-detail>
                            </div>
                        </div>
                        <gembase-ui-inline-loading-bar-anim class="w-full h-full" :w="50" :h="50" :show="inlineLoadingCompetitorsHandler.visible.value"></gembase-ui-inline-loading-bar-anim>
                    </div>

                    <!-- SAVE CHANGES SECTION ### -->
                    <div v-if="saveChangesPopup" class="gb-layout w-full gap-2 pl-4 pr-4">
                        <gembase-ui-window-subtitle close-id="competitor-page-audience-changes">
                            <div v-if="appDetail !== undefined">
                                You are making changes to {{AppDetailUtils.getTitle(appDetail)}}. All market indicators recalculate in real time.
                            </div>
                            <div v-else>
                                You are making changes to discovered opportunity. All market indicators recalculate in real time.
                            </div>
                        </gembase-ui-window-subtitle>
                        <div class="gb-layout-ml-row gap-2 w-full">
                            <gb-button @click="onSaveChanges" class="gbc-bg-primary" icon="check_single" text="Save new concept"></gb-button>
                            <gb-button v-if="appDetail !== undefined && appDetail.app_type === AppTypeEnum.CONCEPT" @click="onUpdateConcept" class="gbc-bg-secondary" icon="check_single" text="Update current concept"></gb-button>
                            <gb-button v-if="appDetail !== undefined" @click="onCancelChanges" class="gbc-bg-primary" icon="flip_card" text="Revert changes"></gb-button>
                        </div>
                    </div>
                    <!-- ### SAVE CHANGES SECTION -->
                </div>
                <gembase-ui-inline-loading-popup :show="inlineLoadingHandler.visible.value"></gembase-ui-inline-loading-popup>
            </div>
        </div>

    </gb-window-container>
    <auditor-audit-advanced-filter v-if="showAdvancedFilter" v-model="showAdvancedFilter" @confirm="onAdvancedFilterConfirm" @reset="onAdvancedFilterReset" :advanced-filter-data="portalStore.advancedFilterData" :my-app-store="advancedFilterAppStore"></auditor-audit-advanced-filter>
    <threat-score-detail-popup v-if="threatScoreTooltip !== undefined" :competitors-count="portalStore.advancedFilterData?.top_competitors" @on-close="threatScoreTooltip = undefined" :tooltip-data="threatScoreTooltip" :demo="portalStore.isDemo() || portalStore.isAuditorLocked()"></threat-score-detail-popup>
    <threat-score-demo-detail-popup v-if="demoTooltip" v-model="demoTooltip"></threat-score-demo-detail-popup>
    <audience-detail-popup v-if="audienceTooltip !== undefined" @on-close="audienceTooltip = undefined" :tooltip-data="audienceTooltip as AudienceTooltip"></audience-detail-popup>
</template>

<script setup lang="ts">

import {usePortalStore} from "@/models/portal/PortalStore";
import {computed, onMounted, onUnmounted, ref} from "vue";
import {AppDetail, AppTypeEnum, TagDetail, TAppId, TTagId} from "@/models/portal/apps/AppsData";
import {
    NODE_CATEGORY_AUDIENCE,
    PlayerExplorerFilter
} from "@/models/portal/PortalDataTypes";
import {
    AdvancedFilterData,
    AudienceTooltip,
    SearchSortEnum,
    TooltipDataV2
} from "@/models/portal/competitor/PortalCompetitorData";
import PortalUtils from "@/models/portal/PortalUtils";
import {TagsHelper} from "@/models/portal/tags/TagsHelper";
import GembaseUiSelect from "@/views/ui/GembaseUiSelect.vue";
import {SelectOptionItem} from "@/views/ui/UiData";
import GembaseUiInlineLoadingPopup from "@/views/ui/GembaseUiInlineLoadingPopup.vue";
import ClientError from "@/core/errors/ClientError";
import {AppDetailUtils} from "@/models/portal/apps/AppDetailUtils";
import GembaseUiInlineLoadingBarAnim from "@/views/ui/GembaseUiInlineLoadingBarAnim.vue";
import GembaseUiWindowCloseBtn from "@/views/ui/GembaseUiWindowCloseBtn.vue";
import GembaseUiWindowSubtitle from "@/views/ui/GembaseUiWindowSubtitle.vue";
import {LocalStorageModel} from "@/models/storage/LocalStorageModel";
import {PortalCompetitorUtils} from "@/models/portal/competitor/PortalCompetitorUtils";
import {RoutesEnum} from "@/router/RoutesEnum";
import {LocationQuery} from "vue-router";
import GembaseUtils from "@/utils/GembaseUtils";
import {usePlayerExplorerStore} from "@/models/portal/playerExplorer/PlayerExplorerStore";
import {useGamesExplorerStore} from "@/models/portal/gamesExplorer/GamesExplorerStore";
import PortalUiThreatScoreComponent from "@/views/platform/modules/__components/PlatformThreatScoreElement.vue";
import {EBillingModuleId, EModuleId, PortalConstants} from "@/models/portal/PortalConstants";
import PortalUiRouterLink from "@/views/ui/router/PortalUiRouterLink.vue";
import {AuditorQueryParams, tunerPopupState} from "@/models/portal/auditor/AuditorData";
import AuditorAuditTunerPopup from "@/views/platform/modules/auditor/__components/__components/AuditorAuditTunerPopup.vue";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import AuditorAuditAdvancedFilter from "@/views/platform/modules/auditor/__components/__components/AuditorAuditAdvancedFilter.vue";
import {OpportunityHelper} from "@/models/portal/gaps/OpportunityHelper";
import {
    GamesExplorerSelectedItem,
    GamesExplorerSelectedItemTypeEnum
} from "@/models/portal/gamesExplorer/GamesExplorerData";
import PortalUiTamV2 from "@/views/platform/modules/auditor/__components/__components/AuditorTamElement.vue";
import AuditorAuditCompetitorDetail
    from "@/views/platform/modules/auditor/__components/__components/AuditorAuditCompetitorDetail.vue";
import {PlatformValuesHelper} from "@/models/portal/competitor/PlatformValuesHelper";
import AuditorAppKpis from "@/views/platform/modules/auditor/__components/__components/AuditorAppKpis.vue";
import {useAppsStore} from "@/models/portal/apps/AppsStore";
import {usePlatformCalcStore} from "@/models/portal/calc/PlatformCalcStore";
import {
    IPlatformCalcAudienceAngle,
    IPlatformCalcCompetitors,
    IPlatformCalcCompetitorsAppDetail,
    IPlatformCalcAffinity, IPlatformCalcViewInput
} from "@/models/portal/calc/PlatformCalcData";
import {useAuditorTuner} from "@/models/portal/auditor/tuner/AuditorTunerComposable";
import {PlatformCalcRequestToken} from "@/models/portal/calc/PlatformCalcRequestToken";
import GbWindowContainer from "@/views/ui/popups/GbWindowContainer.vue";
import MechanicsContentTags from "@/views/platform/modules/__components/MechanicsContentTags.vue";
import {usePlatformCalcContext} from "@/models/portal/calc/PlatformCalcContextComposable";
import InteractiveImage from "@/views/ui/img/InteractiveImage.vue";
import GbSvg from "@/views/ui/icons/GbSvg.vue";
import {useRouterQuery} from "@/core/router/query/RouterQueryComposable";
import AudienceDetailPopup from "@/views/platform/modules/__components/AudienceDetailPopup.vue";
import ThreatScoreDetailPopup from "@/views/platform/modules/__components/ThreatScoreDetailPopup.vue";
import PlatformAppIcon from "@/views/platform/modules/__components/PlatformAppIcon.vue";
import AuditorAppStoreIconLink
    from "@/views/platform/modules/auditor/__components/__components/AuditorAppStoreIconLink.vue";
import AuditorAppTitleWithDeveloper
    from "@/views/platform/modules/auditor/__components/__components/AuditorAppTitleWithDeveloper.vue";
import ThreatScoreDemoDetailPopup from "@/views/platform/modules/__components/ThreatScoreDemoDetailPopup.vue";
import AuditorGamesExplorerDeveloperRouteElement
    from "@/views/platform/modules/auditor/__components/__components/AuditorGamesExplorerDeveloperRouteElement.vue";
import GamesExplorerRouterElement
    from "@/views/platform/modules/__components/__components/GamesExplorerRouterElement.vue";
import TaggingProgress from "@/views/platform/modules/__components/TaggingProgress.vue";
import {useInlineLoading} from "@/models/ui/InlineLoadingComposable";

const portalStore = usePortalStore();
const platformCalcContext = usePlatformCalcContext("auditor-audit").contextId;

const calcProgress = ref<number>();
const initialTags = ref<TagDetail[]>([]);
const audienceAngles = ref<IPlatformCalcAudienceAngle[]>([]);
const competitors = ref<IPlatformCalcCompetitors>();
const selectedCompetitor = ref<IPlatformCalcCompetitorsAppDetail>();
const myAppId = ref<TAppId>();

const saveChangesPopup = ref(false);
const audienceTooltip = ref<AudienceTooltip>();
const threatScoreTooltip = ref<TooltipDataV2>();
const demoTooltip = ref(false);
const showAdvancedFilter = ref(false);

const tagsBeforeEdit = ref<TagDetail[]>();
const inlineLoadingHandler = useInlineLoading("portal-competitor-page");
const inlineLoadingAudienceHandler = useInlineLoading("portal-competitor-page-audience");
const inlineLoadingCompetitorsHandler = useInlineLoading("portal-competitor-page-competitors");

const tags = ref<TagDetail[]>([]);
const appDetail = ref<AppDetail>();

const auditorTuner = useAuditorTuner();
const routerQuery = useRouterQuery<AuditorQueryParams>();

const __opportunityDetail = ref<IPlatformCalcAffinity>();

onMounted(async () => {
    inlineLoadingHandler.show("portal-competitor-page-init");

    appDetail.value = undefined;

    if (routerQuery.query.value.opportunity !== undefined) {
        __opportunityDetail.value = await portalStore.getOpportunityDetail(routerQuery.query.value.opportunity);
    }

    if (__opportunityDetail.value !== undefined) {
        tags.value = new OpportunityHelper(__opportunityDetail.value).tags;
    } else if (routerQuery.query.value.appId !== undefined) {
        appDetail.value = await useAppsStore().getAppDetailAsync({
            appId: routerQuery.query.value.appId
        });
    } else if (portalStore.my_apps.length > 0) {
        appDetail.value = await useAppsStore().getAppDetailAsync({
            appId: portalStore.my_apps[0]
        });
    }

    if (appDetail.value !== undefined) {
        myAppId.value = appDetail.value.app_id;

        if (appDetail.value.tagging_state?.state !== "done") {
            await routerQuery.remove({show: undefined});
            return;
        }

        tags.value = GembaseUtils.copy(appDetail.value.tags);
        await routerQuery.merge({appId: appDetail.value.app_id});
    } else if (!portalStore.isAuditorLocked()) {
        saveChangesPopup.value = true;
    }

    initialTags.value = [];
    if (tags.value !== undefined) {
        initialTags.value = GembaseUtils.copy(tags.value);
    }

    await calcImplicitAudienceAngles();

    auditorTuner.reset();
    auditorTuner.calc(platformCalcContext, {
        dev_id: calcDevId.value,
        app_id: calcAppId.value,
        advanced_filter: portalStore.advancedFilterData,
        growth: growth.value,
        tier: tier.value,
        tag_details: GembaseUtils.copy(initialTags.value)
    });

    inlineLoadingHandler.hide("portal-competitor-page-init");
});

onUnmounted(() => {
    inlineLoadingHandler.clear();
    usePlatformCalcStore().removeContext(platformCalcContext);
});

const advancedFilterAppStore = computed(() => {
    if (appDetail.value !== undefined) {
        return appDetail.value.store;
    }

    return undefined;
});

function onTunerChange(index: number) {
    auditorTuner.setHistoryIndex(index);
    tags.value = GembaseUtils.copy(
        auditorTuner.tunerHistory.value.items[auditorTuner.tunerIndex.value].tags
    );
    recalc();
}

function showTuner() {
    if (isTunerLocked.value) {
        return;
    }
    tunerPopupState.value = 1;
}

const isTunerLocked = computed(() => {
    if (portalStore.isDemo()) {
        return false;
    }
    return portalStore.isTunerLocked();
});

const audienceAngleData = computed(() => {
    const localAudienceAngleData = audienceAngles.value.find(
        (x) => x.audience_angle_id === routerQuery.query.value.audienceAngle
    );
    if (localAudienceAngleData !== undefined) {
        refreshCompetitors(localAudienceAngleData);
    }
    return localAudienceAngleData;
});

function setThreatScoreTooltipDataForSingleApp(appId: TAppId | undefined = undefined) {
    if (competitors.value !== undefined &&
        selectedCompetitor.value !== undefined
    ) {
        threatScoreTooltip.value = PortalCompetitorUtils.getTooltipDataForTopAppsV2({
            competitors: competitors.value,
            myAppId: myAppId.value,
            singleAppCompetitor: appId !== undefined ? appId : selectedCompetitor.value?.app_id
        });
    }
}

const myAppTitle = computed(() => {
    return portalStore.getAppTitle(appDetail.value, TagsHelper.getTagsList(tags.value), __opportunityDetail.value);
});

function setThreatScoreTooltipDataForTopApps() {
    if (competitors.value !== undefined &&
        selectedCompetitor.value !== undefined
    ) {
        threatScoreTooltip.value = PortalCompetitorUtils.getTooltipDataForTopAppsV2({
            competitors: competitors.value,
            myAppTitle: myAppTitle.value,
            myAppId: appDetail.value?.app_id,
        });
    }
}

const calcImplicitAudienceAnglesRequestToken = new PlatformCalcRequestToken();

async function calcImplicitAudienceAngles() {
    const request = await usePlatformCalcStore().audienceAngles({
        requestToken: calcImplicitAudienceAnglesRequestToken.recreate(),
        context: platformCalcContext,
        appId: calcAppId.value,
        input: {
            dev_id: calcDevId.value,
            tag_details: tags.value,
            include_angle: {
                audience_angle_id: routerQuery.query.value.audienceAngle
            }
        },
        responseCallback: {
            finally: () => inlineLoadingAudienceHandler.hide(),
            done: callbackData => {
                if (callbackData.response.payload?.result_data === undefined) {
                    return;
                }
                audienceAngles.value.length = 0;
                callbackData.response.payload.result_data.forEach((x) => {
                    if (x.tam > 0) {
                        audienceAngles.value.push(x);
                    }
                });
            }
        }
    });

    if (!request.cached && request.requestGuid === calcImplicitAudienceAnglesRequestToken.guid) {
        inlineLoadingAudienceHandler.show();
    }
}

const maxTopCompetitorsCount = computed(() => {
    return portalStore.advancedFilterData?.top_competitors ?? 50;
});

const shownTopCompetitorsCount = computed(() => {
    return Math.min(
        maxTopCompetitorsCount.value,
        competitors.value?.ts_items?.length ?? 0
    );
});

const shownTopCompetitorsMedian = computed(() => {
    const arr: number[] = [];
    competitors.value?.ts_items?.forEach((x) => {
        arr.push(x.ts);
    })
    return PlatformValuesHelper.competitorsTsValue(arr);
});

const tier = computed(() => {
    if (appDetail.value !== undefined) {
        return appDetail.value.tier;
    }
    return 0;
})

const growth = computed(() => {
    if (appDetail.value !== undefined) {
        return appDetail.value.growth;
    }
    return 0;
})

const calcAppId = computed(() => {
    if (tagsSelectionChanged.value) {
        return undefined;
    }
    return appDetail.value?.app_id;
});

const calcDevId = computed(() => {
    if (tagsSelectionChanged.value) {
        return undefined;
    }
    return appDetail.value?.dev_id;
});

function onSelectCompetitor(appId: TAppId) {
    competitors.value?.competitor_apps_details?.forEach((x) => {
        if (x.app_id === appId) {
            selectedCompetitor.value = x;
            return;
        }
    })
}

function getCompetitorDetail(appId: TAppId): IPlatformCalcCompetitorsAppDetail | null {
    if (competitors.value !== undefined && competitors.value?.competitor_apps_details !== undefined) {
        for (let i = 0; i < competitors.value?.competitor_apps_details.length; ++i) {
            if (competitors.value?.competitor_apps_details[i].app_id === appId) {
                return competitors.value?.competitor_apps_details[i];
            }
        }
    }
    return null;
}

function onCancelChanges() {
    if (tagsBeforeEdit.value !== undefined) {
        tags.value = GembaseUtils.copy(tagsBeforeEdit.value);
    }
    saveChangesPopup.value = false;
    auditorTuner.reset();
    recalc();
}

async function onUpdateConcept() {
    if (saveChangesPopup.value === false) {
        return;
    }

    inlineLoadingHandler.show();
    tagsBeforeEdit.value = undefined;
    saveChangesPopup.value = false;

    if (appDetail.value !== undefined) {

        if (appDetail.value.app_type === AppTypeEnum.CONCEPT) {
            appDetail.value = await portalStore.saveConceptApp(appDetail.value.app_id, {
                tags: tags.value
            }, undefined);
        }

        auditorTuner.reset();
        recalc();
    }

    inlineLoadingHandler.hide();
}

async function onSaveChanges() {
    if (saveChangesPopup.value === false) {
        return;
    }

    inlineLoadingHandler.show();
    tagsBeforeEdit.value = undefined;
    saveChangesPopup.value = false;

    const localTags: TagDetail[] = GembaseUtils.copy(tags.value);

    if (appDetail.value === undefined) {
        appDetail.value = await portalStore.createConceptAppFromTemp({
            tags: localTags
        });
        tags.value = localTags;

        await routerQuery.merge({appId: appDetail.value.app_id});

        auditorTuner.reset();
        recalc();

    } else {
        let conceptCreated = false;

        if (appDetail.value.app_type === AppTypeEnum.STORE) {
            conceptCreated = true;
            const appDetailCopy = await portalStore.createConceptAsCopy(appDetail.value.app_id);
            appDetail.value = await portalStore.saveConceptApp(appDetailCopy.app_id, {
                tags: tags.value
            }, undefined);
        }

        if (appDetail.value.app_type !== AppTypeEnum.CONCEPT) {
            throw new ClientError(`App ${appDetail.value.app_id} is not a concept app`)
        }

        // if app id changed, route to new url
        if (conceptCreated) {
            await routerQuery.merge({appId: appDetail.value.app_id});
        }

        tags.value = GembaseUtils.copy(localTags);

        auditorTuner.reset();
        recalc();
    }

    inlineLoadingHandler.hide();
}

function onAudienceSelectAudienceClick() {
    const selected = audienceAngles.value.find(
        (x) => x.audience_angle_id === routerQuery.query.value.audienceAngle
    );
    if (selected !== undefined) {
        audienceTooltip.value = {
            lovedTags: selected.tag_ids,
            hatedTags: TagsHelper.getTagsList(tags.value),
            audienceStats: selected.audience_stats,
            audienceAngleId: selected.audience_angle_id
        }
    }
}

function toggleTag(tagId: TTagId) {
    if (!portalStore.canChangeTag(tagId, EBillingModuleId.AUDIT)) {
        return;
    }

    if (tagsBeforeEdit.value === undefined) {
        tagsBeforeEdit.value = GembaseUtils.copy(tags.value);
    }

    tags.value = TagsHelper.toggleTag("auditor-audit", tags.value, tagId);

    if (appDetail.value !== undefined) {
        if (!portalStore.isAuditorLocked()) {
            saveChangesPopup.value = tagsSelectionChanged.value;
        }
    }

    recalc();
    showTuner();
    auditorTuner.reset(auditorTuner.tunerIndex.value);
    auditorTuner.calc(platformCalcContext, {
        dev_id: calcDevId.value,
        app_id: calcAppId.value,
        advanced_filter: portalStore.advancedFilterData,
        growth: growth.value,
        tier: tier.value,
        tag_details: GembaseUtils.copy(tags.value)
    }, tagId);
}

const mechanicsContentCalcDataViewInput = computed((): IPlatformCalcViewInput => {
    return {
        type: "auditor",
        devId: calcDevId.value,
        appId: calcAppId.value,
        tags: tags.value,
        tier: tier.value,
        growth: growth.value
    }
});

function resetAudience() {
    inlineLoadingAudienceHandler.show();
    inlineLoadingCompetitorsHandler.hide();
    competitors.value = undefined;
    selectedCompetitor.value = undefined;
    audienceAngles.value = [];
    calcImplicitAudienceAnglesRequestToken.recreate();
    routerQuery.remove({audienceAngle: undefined});
}

function recalc() {
    resetAudience();
    calcImplicitAudienceAngles();
}

const tagsSelectionChanged = computed(() => {
    if (tagsBeforeEdit.value !== undefined) {
        if (tags.value.length !== tagsBeforeEdit.value.length) {
            return true;
        }
        for (let i = 0; i < tags.value.length; ++i) {
            let found = false;
            for (let j = 0; j < tagsBeforeEdit.value.length; ++j) {
                if (tagsBeforeEdit.value[j].tag_id === tags.value[i].tag_id) {
                    if (tagsBeforeEdit.value[j].tag_rank === tags.value[i].tag_rank) {
                        found = true;
                        break;
                    }
                }
            }
            if (!found) {
                return true;
            }
        }
        for (let i = 0; i < tagsBeforeEdit.value.length; ++i) {
            let found = false;
            for (let j = 0; j < tags.value.length; ++j) {
                if (tags.value[j].tag_id === tagsBeforeEdit.value[i].tag_id) {
                    if (tags.value[j].tag_rank === tagsBeforeEdit.value[i].tag_rank) {
                        found = true;
                        break;
                    }
                }
            }
            if (!found) {
                return true;
            }
        }
    }
    return false;
});

const audienceSelectOptions = computed((): SelectOptionItem[] => {
    const res: SelectOptionItem[] = [];

    const audienceIcon = PortalUtils.getIconForNodeCategory(NODE_CATEGORY_AUDIENCE);
    res.push({
        id: "header",
        value: `<div class="gb-layout-m-between w-full"><span>People who love:</span><span style="content: url(${audienceIcon}); width: 55px; height: 25px;"></span></div>`,
        cssData: "header",
        notInteractive: true
    });

    audienceAngles.value?.forEach((x) => {
        if (!x.locked) {
            const name = PortalCompetitorUtils.getNameForAudience(x);
            res.push({
                id: x.audience_angle_id,
                value: `<span>${name}</span>`,
                valueInList: `<span>${name}</span><span> (${GembaseUtils.formatNumber(x.audience_stats.total_audience)})</span>`,
                selectedPrefix: "Fans of "
            });
        }
    });

    if (portalStore.isAuditorLocked()) {
        res.push({
            id: "locked",
            notInteractive: true,
            value: "",
            showReveal: "More audiences are not available in DEMO."
        });
    }

    return res;
});

function onAudienceChange(selectOptionItem: SelectOptionItem) {
    routerQuery.merge({audienceAngle: selectOptionItem.id});
}

const calcImplicitAudienceAngleCompetitorsRequestToken = new PlatformCalcRequestToken();

async function refreshCompetitors(audienceAngle: IPlatformCalcAudienceAngle) {

    const request = await usePlatformCalcStore().competitorsForAngle({
        requestToken: calcImplicitAudienceAngleCompetitorsRequestToken.recreate(),
        context: platformCalcContext,
        input: {
            dev_id: calcDevId.value,
            app_id: calcAppId.value,
            tag_details: tags.value,
            tier: tier.value,
            growth: growth.value,
            audience_angle_row_id: audienceAngle.row_id,
            advanced_filter: portalStore.advancedFilterData
        },
        responseCallback: {
            finally: () => inlineLoadingCompetitorsHandler.hide(),
            done: callbackData => {
                if (callbackData.response.payload?.result_data === undefined) {
                    return;
                }
                setCompetitors(callbackData.response.payload.result_data);
            }
        }
    });

    if (!request.cached && request.requestGuid === calcImplicitAudienceAngleCompetitorsRequestToken.guid) {
        inlineLoadingCompetitorsHandler.show();
    }
}

function setCompetitors(data: IPlatformCalcCompetitors | undefined) {
    competitors.value = data;
    sortCompetitors();
    if (competitors.value?.ts_items !== undefined &&
        competitors.value.ts_items.length > 0) {
        onSelectCompetitor(competitors.value.ts_items[0].app_id);
    }
}

function sortCompetitors() {
    if (portalStore.advancedFilterData?.sorting !== undefined) {
        competitors.value?.ts_items?.sort((a, b) => {
            if (portalStore.advancedFilterData?.sorting === SearchSortEnum.Novelty) {
                return (a.novelty ?? 0) - (b.novelty ?? 0);
            } else if (portalStore.advancedFilterData?.sorting === SearchSortEnum.Quality) {
                return (b.quality ?? 0) - (a.quality ?? 0);
            } else if (portalStore.advancedFilterData?.sorting === SearchSortEnum.Growth) {
                return (b.growth ?? 0) - (a.growth ?? 0);
            } else if (portalStore.advancedFilterData?.sorting === SearchSortEnum.ThreatScore) {
                return b.ts - a.ts;
            } else {
                let gr = "size";

                if (portalStore.advancedFilterData?.sorting === SearchSortEnum.Installs) {
                    gr = "size"
                } else if (portalStore.advancedFilterData?.sorting === SearchSortEnum.TAM) {
                    gr = "tam"
                } else if (portalStore.advancedFilterData?.sorting === SearchSortEnum.Similarity) {
                    gr = "similar"
                }

                const valA = a.ts_groups?.find((x) => x.gr === gr)?.raw_val;
                const valB = b.ts_groups?.find((x) => x.gr === gr)?.raw_val;

                if (valA !== undefined && valB !== undefined) {
                    return valB - valA;
                } else if (valA === undefined) {
                    return 1;
                } else if (valB === undefined) {
                    return -1;
                }
            }
            return 0;
        });
    }
}

const demoText = computed((): string => {
    let res = "";
    let resArr: string[] = [];

    if (audienceAngleData.value !== undefined) {
        resArr.push(audienceAngleData.value.country);

        let gender = "";
        if (audienceAngleData.value.female === 1) {
            gender = "Females";
        } else {
            gender = "Males";
        }
        resArr.push(`${audienceAngleData.value.gender_ratio}% ${gender}`)

        let age = "";
        if (audienceAngleData.value.age_interval.from === -1) {
            age = `younger than ${audienceAngleData.value.age_interval.to}yo`
        } else if (audienceAngleData.value.age_interval.to === -1 || audienceAngleData.value.age_interval.to > 100) {
            age = `${audienceAngleData.value.age_interval.from}+ yo`
        } else {
            age = `${audienceAngleData.value.age_interval.from} - ${audienceAngleData.value.age_interval.to} yo`
        }

        resArr.push(age);

        const tags: string[] = [];
        audienceAngleData.value.top_behaviors?.tag_ids.forEach((x) => {
            tags.push(portalStore.getTagName(x));
        });
        if (portalStore.isAuditorLocked()) {
            resArr.push("preferences are locked in DEMO")
        } else {
            resArr.push(`prefer ${tags.join(", ")}`);
        }

        resArr.push("...")

        res = resArr.join(", ");
    }

    return res;
});

const playerExplorerQuery = computed((): LocationQuery | undefined => {
    let query: LocationQuery | undefined = undefined;

    if (audienceAngleData.value !== undefined) {
        const filter: PlayerExplorerFilter = {
            id: GembaseUtils.guid()
        }
        if (audienceAngleData.value?.tag_ids.length > 0) {
            filter.loved = {
                tag_ids: audienceAngleData.value.tag_ids
            };
        }
        if (tags.value.length > 0) {
            filter.not_hated = {
                tag_ids: TagsHelper.getTagsList(tags.value)
            };
        }

        query = usePlayerExplorerStore().generateUrlQuery([{data: filter}], undefined, "audit", appDetail?.value?.app_id);
    }

    return query;
});

const gamesExplorerQuery = computed((): LocationQuery | undefined => {
    if (competitors.value?.ts_items === undefined) {
        return undefined;
    }
    const tagsIds: TTagId[] = audienceAngleData.value !== undefined ? GembaseUtils.copy(audienceAngleData.value?.tag_ids) : [];
    const items: GamesExplorerSelectedItem[] = [];

    if (appDetail.value?.app_id !== undefined) {
        items.push({
            type: appDetail.value.app_type === AppTypeEnum.CONCEPT ? GamesExplorerSelectedItemTypeEnum.CONCEPT : GamesExplorerSelectedItemTypeEnum.APP,
            id: appDetail.value.app_id
        });
    } else if (routerQuery.query.value.opportunity !== undefined) {
        items.push({
            type: GamesExplorerSelectedItemTypeEnum.OPPORTUNITY,
            id: routerQuery.query.value.opportunity
        });
    }

    competitors.value?.competitor_apps_details?.forEach((x) => {
        if (!x.locked) {
            items.push({
                type: GamesExplorerSelectedItemTypeEnum.APP,
                id: x.app_id
            });
        }
    });

    return useGamesExplorerStore().generateUrlQuery({
        filters: [{
            dev_ids: [],
            tag_ids: tagsIds,
            stores: []
        }],
        selectedItems: items
    });
});

function onAdvancedFilterConfirm(data: AdvancedFilterData) {
    LocalStorageModel.setItem("auditor-advanced-filter", JSON.stringify(data));
    showAdvancedFilter.value = false;
    let needsToRefreshCompetitors = false;
    if (portalStore.advancedFilterData !== undefined) {
        if (!GembaseUtils.compareArr(data.stores, portalStore.advancedFilterData.stores)) {
            needsToRefreshCompetitors = true;
        } else if (data.current_store !== portalStore.advancedFilterData.current_store) {
            needsToRefreshCompetitors = true;
        } else {
            data.weights.forEach((x) => {
                let f = false;
                portalStore.advancedFilterData?.weights.forEach((y) => {
                    if (x.subcategory_int === y.subcategory_int && x.weight === y.weight) {
                        f = true;
                    }
                });
                if (!f) {
                    needsToRefreshCompetitors = true;
                }
            });
            portalStore.advancedFilterData?.weights.forEach((x) => {
                let f = false;
                data.weights.forEach((y) => {
                    if (x.subcategory_int === y.subcategory_int && x.weight === y.weight) {
                        f = true;
                    }
                });
                if (!f) {
                    needsToRefreshCompetitors = true;
                }
            })
        }
    }

    portalStore.advancedFilterData = data;
    if (audienceAngleData.value !== undefined) {
        if (needsToRefreshCompetitors) {
            refreshCompetitors(audienceAngleData.value);
        }
        sortCompetitors();
    }
}

function onAdvancedFilterReset() {
    LocalStorageModel.removeItem("auditor-advanced-filter");
    sortCompetitors();
    showAdvancedFilter.value = false;
    portalStore.advancedFilterData = undefined;
    if (audienceAngleData.value !== undefined) {
        refreshCompetitors(audienceAngleData.value);
        sortCompetitors();
    }
}

</script>

<style scoped>
.scoped-root {
  --default-w: 850px;
  --tuner-w: 350px;
}

.tuner-popup-container {
  opacity: 0;
}

.tuner-popup-container[data-state="0"] {
  transition: 2s;
  opacity: 0;
}

.tuner-popup-container[data-state="1"] {
  transition: 2s;
  opacity: 1;
}

.tuner-popup {
  @apply absolute gb-layout w-[var(--tuner-w)] right-0 h-auto;
}

.gb-auditor-window-width {
  min-width: calc(var(--default-w) + 2 * var(--gb-window-padding));
}

.gb-auditor-window-width[data-state="0"] {
  transition: 0.5s;
  min-width: calc(var(--default-w) + 2 * var(--gb-window-padding));
}

.gb-auditor-window-width[data-state="1"] {
  transition: 0.5s;
  min-width: calc(var(--default-w) + var(--tuner-w) + 2 * var(--gb-window-padding));
}

</style>

<style>
.gb-ui-competitor-page-audience-select .gb-ui-select-options-item {
  @apply gb-layout-t-between w-full;
}

.gb-ui-competitor-page-audience-select .gb-ui-select-options-item[data-select-item="header"] {
  font-weight: bold;
  padding-bottom: 0;
  padding-top: 10px;
}

.gb-auditor-tags .gb-mechanics-content-height {
  max-height: calc(100vh - 650px);
  min-height: 110px;
}

.gb-auditor-tags[data-save-changes] .gb-mechanics-content-height {
  max-height: calc(100vh - 700px);
  min-height: 110px;
}

.gb-auditor-tags .gb-mechanics-content-width {
  width: 380px;
}
</style>
