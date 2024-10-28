<template>
    <div v-if="gamesExplorerStore.filteredSelectedItems.length > 0" class="scoped-root gb-inner-window w-full p-2 pt-2">
        <div class="gb-layout-ml w-full gap-2 relative max-w-[calc(100vw-var(--gb-ui-portal-sidebar-w)-100px)]">
            <div class="pl-4 pt-2 font-bold">
                Games comparison map
            </div>
            <games-explorer-kpi-charts class="pb-2 pl-2 pr-2"></games-explorer-kpi-charts>
            <div class="absolute top-0 left-0 right-0">
                <div class="absolute top-0 right-0 mr-2 mt-2">
                    <gb-button tooltip="Advanced filter" :demo="portalStore.isInsightLocked()" @click="showAdvancedFilterMap = !showAdvancedFilterMap" icon="digital-transformation" class="gbc-bg-primary"></gb-button>
                </div>
                <games-explorer-advanced-filter class="z-[1001]" v-if="showAdvancedFilterMap" v-model="showAdvancedFilterMap" @confirm="onAdvancedFilterMapConfirm" @reset="onAdvancedFilterMapReset" filter-id="" :advanced-filter-data="gamesExplorerStore.advancedFilterDataMap"></games-explorer-advanced-filter>
            </div>
            <div class="gb-layout-tl-row gap-1">
                <div class="relative">
                    <gb-button @click="onSaveChanges" class="gbc-bg-primary" icon="check_single" text="Save changes" :demo="portalStore.isAuditorLocked()" :disabled="!wasChange"></gb-button>
                    <gb-tooltip :duration="3000" class="absolute top-[-45px]" :show="saveChangesTooltip" :text="saveChangesTooltipText"></gb-tooltip>
                </div>
                <gb-button @click="onRevertChanges" class="gbc-bg-primary" icon="flip_card" text="Revert changes" :disabled="!wasChange"></gb-button>
                <gb-admin-button @click="onAdminSaveChanges" text="Admin: Save changes"></gb-admin-button>
                <gb-admin-button @click="adminView = !adminView" text="Admin: Toggle view"></gb-admin-button>
            </div>
            <div ref="refComparisonMapFloatingScroll" class="fixed bottom-[5px] z-[1000] gb-layout-tl w-full h-[10px] gb-ui-scroll-h">
                <div class="w-full h-full"></div>
            </div>
            <div ref="refComparisonMapScrollDiv" class="gb-ui-scroll-h gb-bg-window !gb-layout-tl w-full h-full">
                <div class="gb-layout-tc relative text-[0.65em] pt-4 pb-2">
                    <div class="gb-bg-window compare-apps-separator left-[var(--gb-games-explorer-map-header-w)]"></div>
                    <div v-for="item in gamesExplorerStore.filteredSelectedItems" class="gb-bg-window compare-apps-separator" :style="{left: `calc(var(--gb-games-explorer-map-header-w) + ${getColumnSumWidth(item)}px`}" :key="item.id"></div>
                    <div ref="refHeaderDiv" class="gb-layout-ml-row w-full h-[60px]">
                    </div>
                    <div ref="refHeaderContent" class="gb-layout-ml-row w-full absolute z-[1000] top-[10px] h-[70px]">
                        <div class="w-[var(--gb-games-explorer-map-header-w)]">
                        </div>
                        <div v-for="item in gamesExplorerStore.filteredSelectedItems" :key="item.id" :data-floating="isHeaderFloating" class="gb-layout-row gb-app-header-bg relative" :style="{width: getColumnWidth(item)}">
                            <div v-if="gamesExplorerStore.hasAudienceTs(item) && tunerPopupState == 1" class="absolute left-[-200px] top-[-10px] z-50">
                                <auditor-audit-tuner-popup-v2 :product-nodes-progress="allTagsList.calcProgress.value ?? 0" @change="onTunerChange" @close="tunerPopupState = 0" :history="auditorTuner.tunerHistory.value" :tuner-index="auditorTuner.tunerIndex.value"></auditor-audit-tuner-popup-v2>
                            </div>
                            <div v-if="gamesExplorerStore.hasAudienceTs(item) && tunerPopupState != 1 && auditorTuner.tunerHistory.value.items.length > 0" @click="showTuner" class="absolute gb-layout-row left-[20px] top-[5px] z-50">
                                <div class="gbc-bg-primary rounded-l-2xl pt-1 pb-1 pl-2 pr-1 cursor-pointer" data-interactive>
                                    <gb-svg class="h-[25px]" icon="potential"></gb-svg>
                                </div>
                                <div class="relative h-full gb-layout">
                                    <gb-svg class="h-[20px] gb2-rotate-270-svg text-yellow absolute right-[-13px]" icon="expand_menu"></gb-svg>
                                </div>
                            </div>

                            <div class="gb-layout-tc gb-layout-full gap-4">
                                <div class="relative h-[33px]">
                                    <portal-ui-router-link :disabled="isRemoveMouseOver" :name="RoutesEnum.PORTAL_MY_APPS" :query="{appId: item.id} as AuditorQueryParams">
                                        <div @mouseenter="mouseOverApp = item.id" @mouseleave="() => {if (isRemoveMouseOver === false) mouseOverApp = undefined}" class="relative h-full">
                                            <div class="h-full w-auto rounded mt-2 border-[2px]" :style="{borderColor: gamesExplorerStore.getItemColor(item.id)}">
                                                <platform-app-icon :app-icon="gamesExplorerStore.getAppIcon(item)"></platform-app-icon>
                                            </div>
                                            <gembase-ui-inline-loading-bar-anim :show="taggingApps.includes(item.id)"></gembase-ui-inline-loading-bar-anim>
                                            <gembase-ui-icon-close-btn v-if="mouseOverApp === item.id" @mouseenter="isRemoveMouseOver = true" @mouseleave="isRemoveMouseOver = false" @click="onRemoveItem(item)"></gembase-ui-icon-close-btn>
                                        </div>
                                    </portal-ui-router-link>
                                </div>
                                <div class="w-[90%] h-full max-h-[20px] overflow-hidden">
                                    <div class="leading-[1em] text-[0.8em] w-full h-full overflow-hidden overflow-ellipsis text-center">
                                        {{gamesExplorerStore.getIconTitle(item)?.title}}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="gb-layout-tc w-full">
                        <div class="gb-layout-ml-row w-full pt-2 pb-1 gap-2 cursor-pointer">
                        </div>
                        <div class="gb-layout-row w-full gap-1 pl-2">
                            <div class="gb-layout-tc w-full h-[25px]">
                                <div class="gb-bg-map-row">
                                    <div class="gb-layout-ml-row w-full h-full">
                                        <div class="gb-layout-ml-row pl-2 h-full w-[calc(var(--gb-games-explorer-map-header-w)-28px)]">
                                            Segments
                                        </div>
                                        <div v-for="item in gamesExplorerStore.filteredSelectedItems" :key="item.id" class="gb-layout h-full" :style="{width: getColumnWidth(item)}">
                                            <div class="gb-layout-row gap-1">
                                                <div v-for="color in gamesExplorerStore.getAppSegmentsColors(item.id)" :key="color" class="w-[10px] h-[10px] rounded-circle" :style="{backgroundColor: color}">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-for="section in gamesExplorerStore.compareViewData" :key="section.header" class="gb-layout-tc w-full">
                        <div @click="GembaseUtils.toggleArr(gamesExplorerStore.minimizedCompareSections, section.header)" class="gb-layout-ml-row w-full pl-4 pt-2 pb-2 gap-2 cursor-pointer">
                            <gb-svg class="h-[15px] w-auto" icon="expand_menu" :style="{transform: `rotate(${gamesExplorerStore.minimizedCompareSections.includes(section.header) ? 0 : 180}deg)`}"></gb-svg>
                            <div class="font-bold">{{section.header}}</div>
                        </div>
                        <div v-if="!gamesExplorerStore.minimizedCompareSections.includes(section.header)" class="gb-layout-tl w-full gap-[2px] pl-2">
                            <div v-if="section.locked" class="gb-inner-window w-full h-[80px]">
                                <div class="w-full h-full gap-3 relative">
                                    <div class="absolute top-0 bottom-0" :style="{left: `${revealLeftPx}px`, width: `${revealWidthPx}px`}">
                                        <div class="w-full h-full gb-layout">
                                            <div>This category is not available in DEMO.</div>
                                            <portal-ui-reveal-btn></portal-ui-reveal-btn>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div v-else v-for="row in section.rows" :key="row.title" class="gb-layout-tc w-full h-[25px]">
                                <div class="gb-bg-map-row">
                                    <div class="gb-layout-ml-row w-full h-full">
                                        <div class="gb-layout-ml-row h-full w-[calc(var(--gb-games-explorer-map-header-w)-20px)]">
                                            <div v-if="row.locked === 1" class="gb-layout-row w-full h-ful pl-2">
                                                <gb-svg icon="locked" class="h-[80%] w-auto"></gb-svg>
                                                <div>Locked</div>
                                            </div>
                                            <div v-else class="pl-1" :data-tooltip="row.tooltip">
                                                {{row.title}}
                                            </div>
                                        </div>
                                        <div v-for="value in row.values" :key="value.tagId" @click="() => {value.click !== undefined ? value.click(value) : undefined}" class="gb-layout h-full pl-2 pr-2 data-[pointer='true']:cursor-pointer" :style="{width: getColumnWidth(value.item)}" :data-pointer="value.click !== undefined">
                                            <div v-if="value.l === true" class="w-full h-full gb-layout-row">
                                                <gb-svg class="gb2-loading-anim aspect-square h-[70%]" icon="loading"></gb-svg>
                                            </div>
                                            <template v-else-if="value.b !== undefined">
                                                <div v-if="(adminView || value.canChange) && value.tagId !== undefined && value.tagsViewTagData !== undefined" class="gb-layout-tc-row">
                                                    <div class="w-[50px] text-[0.5rem]">
                                                        <platform-product-node-element class="!h-[20px]" :hide-text="true" @click="toggleTag(value)" :toggled="TagsHelper.hasTag(value.tagDetail, value.tagId)" :node="value.tagsViewTagData" :rank="getTagRank(value)"></platform-product-node-element>
                                                    </div>
                                                    <div v-if="gamesExplorerStore.hasAudienceTs(value.item)" class="w-[140px]">
                                                        <div class="gb-layout-mr-row gap-1 cursor-pointer text-[0.6rem]">
                                                            <portal-ui-audience :audience="value.calcItem?.audience_stats" @click="onAudienceClick(value.tagId)" :inactive="!TagsHelper.hasTag(value.tagDetail, value.tagId)" :data-tooltip="`${value.calcItem?.audience_stats.total_audience} fans of ${value.tagDef?.node} would like ${value.title}`" class="w-full h-[20px]"></portal-ui-audience>
                                                            <div class="w-[50px] text-[0.5rem]">
                                                                <portal-ui-threat-score-component :angle="portalStore.getTagName(value.tagId)" class="w-[65px] h-[20px] text-[0.6rem]" @click="onThreatScoreClick(value.tagId)" :threat-score="value.calcItem?.ts" :unselected="!TagsHelper.hasTag(value.tagDetail, value.tagId)"></portal-ui-threat-score-component>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <gb-svg v-else-if="value.b" class="h-[80%] w-auto" icon="check_single"></gb-svg>
                                            </template>
                                            <div v-else class="w-full overflow-hidden overflow-ellipsis pl-2">{{value.s}}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, ref, watch} from "vue";
import GembaseUtils from "@/utils/GembaseUtils";
import {useGamesExplorerStore} from "@/models/portal/gamesExplorer/GamesExplorerStore";
import {TagDetail, TaggingState, TAppId, TTagId} from "@/models/portal/apps/AppsData";
import {GamesExplorerCompareViewDataValue} from "@/models/portal/PortalDataTypes";
import {usePortalStore} from "@/models/portal/PortalStore";
import {RoutesEnum} from "@/router/RoutesEnum";
import PortalUiRevealBtn from "@/views/shared/DemoRevealBtn.vue";
import {useAuthStore} from "@/models/auth/AuthStore";
import EndpointRequest from "@/core/requests/EndpointRequest";
import {TagsHelper} from "@/models/portal/tags/TagsHelper";
import PortalUiRouterLink from "@/views/ui/router/PortalUiRouterLink.vue";
import {AuditorQueryParams} from "@/models/portal/auditor/AuditorData";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import {useTaggingStore} from "@/models/portal/tags/TaggingStore";
import GembaseUiInlineLoadingBarAnim from "@/views/ui/GembaseUiInlineLoadingBarAnim.vue";
import GbTooltip from "@/views/ui/tooltips/GbTooltip.vue";
import GbAdminButton from "@/views/platform/ui/GbAdminButton.vue";
import {
    AdvancedFilterData,
} from "@/models/portal/competitor/PortalCompetitorData";
import {
    GamesExplorerSelectedItem,
    GamesExplorerSelectedItemTypeEnum
} from "@/models/portal/gamesExplorer/GamesExplorerData";
import PortalUiThreatScoreComponent from "@/views/platform/modules/__components/PlatformThreatScoreElement.vue";
import {PortalCompetitorUtils} from "@/models/portal/competitor/PortalCompetitorUtils";
import AuditorAuditTunerPopupV2 from "@/views/platform/modules/auditor/__components/__components/AuditorAuditTunerPopupV2.vue";
import GbSvg from "@/views/ui/icons/GbSvg.vue";
import PortalUiAudience from "@/views/platform/modules/__components/PlatformAudienceElement.vue";
import GamesExplorerAdvancedFilter from "@/views/platform/modules/gamesExplorer/__components/GamesExplorerAdvancedFilter.vue";
import GamesExplorerKpiCharts from "@/views/platform/modules/gamesExplorer/__components/GamesExplorerKpiCharts.vue";
import {useAppsStore} from "@/models/portal/apps/AppsStore";
import {usePlatformCalcStore} from "@/models/portal/calc/PlatformCalcStore";
import {useAllTagsList} from "@/models/portal/auditor/AllTagsListComposable";
import {useAuditorTuner} from "@/models/portal/auditor/tuner/AuditorTunerComposable";
import GembaseUiIconCloseBtn from "@/views/ui/GembaseUiIconCloseBtn.vue";
import PlatformAppIcon from "@/views/platform/modules/__components/PlatformAppIcon.vue";
import PlatformProductNodeElement from "@/views/platform/modules/__components/PlatformProductNodeElement.vue";
import {useFullscreenLoading} from "@/models/ui/FullscreenLoadingComposable";

const gamesExplorerStore = useGamesExplorerStore();
const portalStore = usePortalStore();
const taggingStore = useTaggingStore();
const allTagsList = useAllTagsList()
const auditorTuner = useAuditorTuner();
const fullscreenLoading = useFullscreenLoading();

const mouseOverApp = ref<TAppId>();
const isRemoveMouseOver = ref(false);
const refHeaderDiv = ref<HTMLDivElement>();
const refHeaderContent = ref<HTMLDivElement>();
const refComparisonMapScrollDiv = ref<HTMLDivElement>();
const refComparisonMapFloatingScroll = ref<HTMLDivElement>();
const isHeaderFloating = ref(false);
const adminView = ref(useAuthStore().isAdmin());
const taggingApps = ref<TAppId[]>([]);
const context = "games_explorer";
const wasChange = ref(false);
const tunerPopupState = ref(-1);
const serviceContext = "games-explorer-app-context"
const showAdvancedFilterMap = ref(false);
const saveChangesTooltip = ref(0);
const saveChangesTooltipText = ref("");
const revealLeftPx = ref(0);
const revealWidthPx = ref(0);

let floatingScrollTimer = 0;
let floatingScrollPosPrev = 0;
let comparisonMapScrollPosPrev = 0;

onMounted(async () => {
    await calcAudiencesTs();

    const item = gamesExplorerStore.getFirstHasAudienceTs();
    if (item !== undefined) {
        const data = gamesExplorerStore.getCompareAppData(item);
        calcForTuner([...data.tags]);
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    window.clearInterval(floatingScrollTimer);
    floatingScrollTimer = window.setInterval(() => {
        if (gamesExplorerStore.filteredSelectedItems.length === 0) {
            refreshComparisonMapFloatingScrollVisibility();
            return;
        }

        if (refComparisonMapFloatingScroll.value !== undefined &&
            refComparisonMapFloatingScroll.value !== null &&
            refComparisonMapScrollDiv.value !== undefined &&
            refComparisonMapScrollDiv.value !== null) {
            refComparisonMapFloatingScroll.value.style.maxWidth = `${refComparisonMapScrollDiv.value.offsetWidth}px`;
            (refComparisonMapFloatingScroll.value.children[0] as HTMLElement).style.width = `${refComparisonMapScrollDiv.value.scrollWidth}px`;

            if (comparisonMapScrollPosPrev !== refComparisonMapScrollDiv.value.scrollLeft) {
                refComparisonMapFloatingScroll.value.scrollLeft = refComparisonMapScrollDiv.value.scrollLeft;
            } else if (floatingScrollPosPrev !== refComparisonMapFloatingScroll.value.scrollLeft) {
                refComparisonMapScrollDiv.value.scrollLeft = refComparisonMapFloatingScroll.value.scrollLeft;
            }

            comparisonMapScrollPosPrev = refComparisonMapScrollDiv.value.scrollLeft;
            floatingScrollPosPrev = refComparisonMapScrollDiv.value.scrollLeft;

            revealLeftPx.value = refComparisonMapScrollDiv.value?.scrollLeft ?? 0;
            revealWidthPx.value = refComparisonMapScrollDiv.value?.offsetWidth ?? 0;

            refreshComparisonMapFloatingScrollVisibility();
        }
    }, 100);
});

onUnmounted(() => {
    taggingStore.removeContext(context);
    window.removeEventListener('scroll', handleScroll);
    window.clearInterval(floatingScrollTimer);
});

watch(() => gamesExplorerStore.selectedItems, tagApps);

async function calcAudiencesTs() {
    allTagsList.clear();

    const item = gamesExplorerStore.getFirstHasAudienceTs();
    if (item === undefined) {
        return;
    }

    await allTagsList.calcAllTagsGamesExplorer({
        context: serviceContext,
        tagDetails: gamesExplorerStore.getCompareAppData(item).tags
    });
}

async function tagApps() {
    const apps: TAppId[] = [];
    gamesExplorerStore.filteredSelectedItems.forEach((x) => {
        if (x.type === GamesExplorerSelectedItemTypeEnum.APP) {
            apps.push(x.id);
        }
    });

    taggingApps.value.length = 0;
    for (let i = 0; i < apps.length; ++i) {
        const response = await taggingStore.tagStoreAppIfNotTagged(apps[i], "games_explorer");
        if (response.state !== "done") {
            taggingStore.checkTaggingState(context, apps[i], __checkTaggingState);
            taggingApps.value.push(apps[i]);
        }
    }
}

function __checkTaggingState(taggingState: TaggingState) {
    if (taggingState.state === "done" && gamesExplorerStore.isSelected(taggingState.app_id)) {
        GembaseUtils.removeFromArr(taggingApps.value, taggingState.app_id);
        gamesExplorerStore.refreshAppsData(true);
    }
}

function handleScroll() {
    if (gamesExplorerStore.filteredSelectedItems.length === 0) {
        return;
    }
    isHeaderFloating.value = false;
    if (refHeaderDiv.value !== undefined && refHeaderContent.value !== undefined && refHeaderContent.value !== null) {
        const rect = refHeaderDiv.value?.getBoundingClientRect();
        refHeaderContent.value.style.top = rect.top < 87 ? `${10 + 87 - rect.top}px` : `10px`;
        isHeaderFloating.value = rect.top < 87;
    }

    refreshComparisonMapFloatingScrollVisibility();
}

function refreshComparisonMapFloatingScrollVisibility() {
    if (refHeaderDiv.value !== undefined &&
        refHeaderDiv.value !== null &&
        refHeaderContent.value !== undefined &&
        refHeaderContent.value !== null &&
        refComparisonMapFloatingScroll.value !== undefined &&
        refComparisonMapFloatingScroll.value !== null &&
        refComparisonMapScrollDiv.value !== undefined &&
        refComparisonMapScrollDiv.value !== null) {
        if (gamesExplorerStore.filteredSelectedItems.length === 0) {
            refComparisonMapFloatingScroll.value.style.display = "none";
        } else if (refComparisonMapScrollDiv.value.offsetWidth >= refComparisonMapScrollDiv.value.scrollWidth) {
            refComparisonMapFloatingScroll.value.style.display = "none";
        } else {
            const rect = refComparisonMapScrollDiv.value.getBoundingClientRect();
            const rectHeader = refHeaderDiv.value.getBoundingClientRect();
            if (rectHeader.bottom > window.innerHeight) {
                refComparisonMapFloatingScroll.value.style.display = "none";
            } else if (rect.bottom < window.innerHeight) {
                refComparisonMapFloatingScroll.value.style.display = "none";
            } else {
                refComparisonMapFloatingScroll.value.style.display = "block";
            }
        }
    }
}

function onRemoveItem(item: GamesExplorerSelectedItem) {
    gamesExplorerStore.toggleItem(item);
    mouseOverApp.value = undefined;
}

function toggleTag(v: GamesExplorerCompareViewDataValue) {
    TagsHelper.toggleTagInplace("games-explorer", v.tagDetail, v.tagId);
    wasChange.value = true;
    calcAudiencesTs();
    showTuner();
    auditorTuner.reset(auditorTuner.tunerIndex.value);
    if (v.item !== undefined &&
        v.tagDetail !== undefined &&
        v.item.id === gamesExplorerStore.getFirstHasAudienceTs()?.id
    ) {
        calcForTuner(v.tagDetail)
    }
    gamesExplorerStore.toggleTag(v);
}

function calcForTuner(localTags: TagDetail[], tagId: TTagId | undefined = undefined) {
    const item = gamesExplorerStore.getFirstHasAudienceTs();
    if (item !== undefined) {
        const appId = item.type !== GamesExplorerSelectedItemTypeEnum.OPPORTUNITY ? item.id : undefined;
        auditorTuner.calc(
            serviceContext,
            {
                app_id: appId,
                tag_details: GembaseUtils.copy(localTags),
            },
            tagId
        )
    }
}

function getTagRank(v: GamesExplorerCompareViewDataValue) {
    return TagsHelper.getTagRank(v.tagDetail, v.tagId);
}

function onRevertChanges() {
    gamesExplorerStore.refreshCompareViewData();
    wasChange.value = false;
}

async function onSaveChanges() {
    fullscreenLoading.show();

    const toSave: {
        app_id: TAppId,
        tag_id: TTagId,
        tag_rank: number,
        b: boolean
    }[] = [];
    const items: GamesExplorerSelectedItem[] = [];
    const opportunities: string[] = [];
    const replaceAppIds: {from: TAppId, to: TAppId}[] = [];
    gamesExplorerStore.compareViewData.forEach((x) => {
        x.rows.forEach((y) => {
            y.values?.forEach((z) => {
                if (z.canChange && z.tagId !== undefined && z.item !== undefined) {

                    if (z.tagDef?.wip) {
                        return;
                    }

                    if (z.item.type === GamesExplorerSelectedItemTypeEnum.OPPORTUNITY) {
                        GembaseUtils.addToArrUnique(opportunities, z.item.id);
                    }

                    if (items.find((w) => w.id === z.item?.id) === undefined) {
                        items.push(z.item);
                    }

                    toSave.push({
                        app_id: z.item.id,
                        tag_id: z.tagId,
                        tag_rank: TagsHelper.getTagRank(z.tagDetail, z.tagId),
                        b: TagsHelper.hasTag(z.tagDetail, z.tagId)
                    });
                }
            })
        })
    });
    for (let i = 0; i < opportunities.length; ++i) {
        const opportunity = await portalStore.getOpportunityDetail(opportunities[i]);
        if (opportunity !== undefined) {
            const tagsDetails: TagDetail[] = [];
            toSave.forEach((x) => {
                if (x.app_id === opportunities[i] && x.b) {
                    tagsDetails.push({
                        tag_id: x.tag_id,
                        tag_rank: x.tag_rank
                    });
                }
            });
            const appDetail = await portalStore.createConceptAppFromTemp({
                tags: tagsDetails
            });
            replaceAppIds.push({
                from: opportunities[i],
                to: appDetail.app_id
            });
            toSave.forEach((x) => {
                if (x.app_id === opportunities[i]) {
                    x.app_id = appDetail.app_id;
                }
            });
        }
    }
    await EndpointRequest.process2("portal:save_tags_from_games_explorer", toSave);

    if (replaceAppIds.length > 0) {
        replaceAppIds.forEach((x) => {
            for (let i = 0; i < gamesExplorerStore.filteredSelectedItems.length; ++i) {
                if (gamesExplorerStore.filteredSelectedItems[i].id === x.from) {
                    gamesExplorerStore.filteredSelectedItems[i] = {
                        id: x.to,
                        type: GamesExplorerSelectedItemTypeEnum.CONCEPT
                    };
                }
            }
        });
        await gamesExplorerStore.filtersToUrlQuery();
        window.location.reload();
        return;
    }
    for (let i = 0; i < items.length; ++i) {
        await useAppsStore().getAppDetailAsync({
            appId: items[i].id,
            force: true
        });
    }
    gamesExplorerStore.refreshCompareViewData();
    wasChange.value = false;
    const item = gamesExplorerStore.getFirstHasAudienceTs();
    if (item !== undefined) {
        const d = gamesExplorerStore.getIconTitle(item);
        if (d !== undefined) {
            saveChangesTooltipText.value = `Saved as ${d.title}`;
            saveChangesTooltip.value++;
        }
    }
    fullscreenLoading.show();
}

async function onAdminSaveChanges() {
    const toSave: {
        app_id: TAppId,
        tag_id: TTagId,
        tag_rank: number,
        b: boolean
    }[] = []
    gamesExplorerStore.compareViewData.forEach((x) => {
        x.rows.forEach((y) => {
            y.values?.forEach((z) => {
                if (z.tagId !== undefined && z.item !== undefined && z.item.type === GamesExplorerSelectedItemTypeEnum.APP) {
                    toSave.push({
                        app_id: z.item.id,
                        tag_id: z.tagId,
                        tag_rank: TagsHelper.getTagRank(z.tagDetail, z.tagId),
                        b: TagsHelper.hasTag(z.tagDetail, z.tagId)
                    });
                }
            })
        })
    });
    await EndpointRequest.process2("admin:save_tags_from_games_explorer", toSave);
    location.reload();
}

function onAudienceClick(tagId: TTagId) {
    gamesExplorerStore.audienceTooltip = undefined;
    const item = allTagsList.platformCalcAllTagsResult.value?.data.find((x) => x.affinity.tag_id === tagId);
    if (item === undefined) {
        return;
    }
    const appData = gamesExplorerStore.getFirstHasAudienceTs();
    if (appData === undefined) {
        return;
    }
    const data = gamesExplorerStore.getCompareAppData(appData);
    gamesExplorerStore.audienceTooltip = {
        lovedTags: [tagId],
        hatedTags: TagsHelper.getTagsList(data.tags),
        audienceStats: item.audience_stats,
        audienceAngleId: item.affinity.tag_id
    }
}

async function onThreatScoreClick(tagId: TTagId) {
    gamesExplorerStore.threatScoreTooltip = undefined;

    const item = gamesExplorerStore.getFirstHasAudienceTs();
    if (item === undefined) {
        return;
    }

    const data = gamesExplorerStore.getCompareAppData(item);
    const tagsDetails = [...data.tags];
    tagsDetails.unshift({tag_id: tagId, tag_rank: 0});

    fullscreenLoading.show();

    usePlatformCalcStore().competitors({
        context: serviceContext,
        input: {
            tag_details: tagsDetails,
            exclusive_angle: {
                audience_angle_id: tagId
            }
        },
        responseCallback: {
            finally: () => fullscreenLoading.hide(),
            done: callbackData => {
                if (callbackData.response.payload?.result_data === undefined) {
                    return;
                }
                gamesExplorerStore.threatScoreTooltip = PortalCompetitorUtils.getTooltipDataForTopAppsV2({
                    competitors: callbackData.response.payload.result_data,
                    myAppTitle: "selected attributes"
                });
            }
        }
    });
}

function getColumnWidthInt(item: GamesExplorerSelectedItem | undefined) {
    return gamesExplorerStore.hasAudienceTs(item) ? 250 : 100;
}

function getColumnWidth(item: GamesExplorerSelectedItem | undefined) {
    return `${getColumnWidthInt(item)}px`
}

function getColumnSumWidth(item: GamesExplorerSelectedItem) {
    let res = 0;
    for (let i = 0; i < gamesExplorerStore.filteredSelectedItems.length; ++i) {
        res += getColumnWidthInt(gamesExplorerStore.filteredSelectedItems[i]);
        if (gamesExplorerStore.filteredSelectedItems[i].id === item.id) {
            break;
        }
    }
    return res;
}

function onTunerChange(index: number) {
    auditorTuner.setHistoryIndex(index);
    const item = gamesExplorerStore.getFirstHasAudienceTs();
    if (item === undefined) {
        return;
    }
    const data = gamesExplorerStore.getCompareAppData(item);
    data.tags.length = 0;
    data.tags.push(...auditorTuner.tunerHistory.value.items[auditorTuner.tunerIndex.value].tags);
    calcAudiencesTs();
}

function showTuner() {
    tunerPopupState.value = 1;
}

function onAdvancedFilterMapConfirm(data: AdvancedFilterData) {
    showAdvancedFilterMap.value = false;
    gamesExplorerStore.setAdvancedFilterMap(data);
}

function onAdvancedFilterMapReset() {
    showAdvancedFilterMap.value = false;
    gamesExplorerStore.setAdvancedFilterMap(undefined);
}

</script>

<style scoped>
.scoped-root {
  --gb-games-explorer-map-header-w: 200px;
}

.compare-apps-separator {
  @apply absolute border-0 top-0 w-[2px] h-full;
}

.gb-bg-map-row {
  @apply w-full h-full bg-white bg-opacity-5 p-2 pt-[2px] pb-[2px] rounded-full;
}

.gb-app-header-bg {
  @apply h-full;
}

.gb-app-header-bg[data-floating="true"] {
  @apply rounded-xl h-[75px] bg-gradient-to-b from-black to-transparent;
}
</style>

