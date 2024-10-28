<template>
    <gb-window class="!justify-start" :header="playerExplorerStore.show === 'concepts' ? 'Evaluate ideas' : `Explore player insights${usePortalStore().titleDemo()}`">

        <gembase-ui-window-subtitle v-if="playerExplorerStore.show !== 'concepts'" close-id="player-explorer-title">
                <span>
                    Set up and compare various groups of players to deeply understand their traits, motivations and interests.
                </span>
        </gembase-ui-window-subtitle>
        <!-- FILTERS -->
        <div class="gb-layout-ml-row w-full">
            <player-explorer-segments :from="from" @audience-tooltip="onAudienceTooltip" @threat-score-tooltip="onThreatScoreTooltip" v-model="demoTooltip"></player-explorer-segments>
        </div>
        <div v-if="playerExplorerStore.filtersInvalidated" class="w-full">
            <gembase-ui-window-subtitle class="w-full" close-id="player-explorer-save-changes">
            <span class="portal-ui-text-anim">
                You have made changes to Segment settings. Please update charts to reflect them.
            </span>
            </gembase-ui-window-subtitle>
        </div>
        <div class="gb-layout-ml-row w-full pt-2 pb-2 gap-2 pl-2">
            <gb-button @click="playerExplorerStore.updateFilters()" class="gbc-bg-primary" icon="flip_card" text="Update charts" :show-exclamation="playerExplorerStore.filtersInvalidated"></gb-button>
            <gb-button v-if="playerExplorerStore.canAddSegment()" @click="playerExplorerStore.addFilterGroup" class="gbc-bg-primary" icon="plus" :text="`Add segment ${playerExplorerStore.filters.length + 1}`"></gb-button>
            <div class="relative">
                <gb-button @click="onShareLink" class="gbc-bg-primary" icon="share" :demo="playerExplorerStore.isLocked()" tooltip="Share segments' settings"></gb-button>
                <gb-tooltip :show="shareLinkTooltipState" text="Link with segments' settings has been copied to clipboard …"></gb-tooltip>
            </div>
        </div>
        <!-- CHARTS -->
        <template v-if="playerExplorerStore.show === 'concepts'">
            <div class="gb-layout-tc-row w-full min-w-[800px] gap-2">
                <div class="gb-layout w-full gap-2">
                    <div class="gb-layout w-full">
                        <player-explorer-dcm-concepts-charts class="w-full h-full"></player-explorer-dcm-concepts-charts>
                    </div>
                </div>
            </div>
        </template>
        <template v-else>
            <div class="gb-layout-tc-row w-full gap-2">
                <template v-for="(chartGroup, index) in playerExplorerStore.currentChartData.charts" :key="index">
                    <div class="gb-layout-tc gap-2">
                        <template v-for="chartData in chartGroup" :key="chartData.id">
                            <div class="gb-inner-window">
                                <div class="gb-layout w-[440px]">
                                    <div class="gb-layout-m-between w-full pl-4 pr-4">
                                        <div class="gb-chart-card-title">{{ GembaseUtils.upperFirst(chartData.name) }}</div>
                                        <gb-button v-if="!chartData.locked && chartData.template !== CHART_TEMPLATE_BEHAVIORS" @click="playerExplorerStore.toggleChartSize(chartData.id)" icon="expand_menu" class="gbc-bg-primary !w-[40px]" :class="{'gb2-flip-y-svg': playerExplorerStore.isChartMaximized(chartData.id)}"></gb-button>
                                    </div>
                                    <div v-if="chartData.locked" class="gb-layout w-full mt-3 mb-3 gap-3 max-w-[70%]">
                                        <div class="text-[0.7em]">This category is unavailable in DEMO.</div>
                                        <portal-ui-reveal-btn></portal-ui-reveal-btn>
                                    </div>
                                    <player-explorer-chart v-else class="w-full h-[calc(100%-60px)]" :app-id="playerExplorerStore.appId" :app-tags="playerExplorerStore.appTags" :chart-data="chartData" :filters="playerExplorerStore.filters" :update-columns-request="playerExplorerStore.isChartMaximized(chartData.id)" :update-filters-request="playerExplorerStore.updateFiltersRequest"></player-explorer-chart>
                                </div>
                            </div>
                        </template>
                    </div>
                </template>
            </div>
        </template>

        <threat-score-detail-popup :fixed="true" v-if="threatScoreTooltip !== undefined" @on-close="threatScoreTooltip = undefined" :tooltip-data="threatScoreTooltip" :demo="portalStore.isDemo() || portalStore.isAuditorLocked()"></threat-score-detail-popup>
        <audience-detail-popup :fixed="true" v-if="audienceTooltip !== undefined" @on-close="audienceTooltip = undefined" :tooltip-data="audienceTooltip as AudienceTooltip"></audience-detail-popup>
        <threat-score-demo-detail-popup v-if="demoTooltip" v-model="demoTooltip"></threat-score-demo-detail-popup>
    </gb-window>
</template>

<script setup lang="ts">
import {onBeforeMount, onUnmounted, ref, watch} from "vue";
import GembaseUtils from "@/utils/GembaseUtils";
import PlayerExplorerSegments from "@/views/platform/modules/playerExplorer/__components/PlayerExplorerSegments.vue";
import {usePlayerExplorerStore} from "@/models/portal/playerExplorer/PlayerExplorerStore";
import GembaseUiWindowSubtitle from "@/views/ui/GembaseUiWindowSubtitle.vue";
import PlayerExplorerDcmConceptsCharts from "@/views/platform/modules/playerExplorer/__components/PlayerExplorerDcmConceptsCharts.vue";
import PortalUiRevealBtn from "@/views/shared/DemoRevealBtn.vue";
import {usePortalStore} from "@/models/portal/PortalStore";
import {AudienceTooltip, TooltipDataV2} from "@/models/portal/competitor/PortalCompetitorData";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import GbTooltip from "@/views/ui/tooltips/GbTooltip.vue";
import {CHART_TEMPLATE_BEHAVIORS} from "@/models/portal/PortalDataTypes";
import GbWindow from "@/views/ui/popups/GbWindow.vue";
import {useRouterStore} from "@/core/router/RouterStore";
import PlayerExplorerChart from "@/views/platform/modules/playerExplorer/__components/PlayerExplorerChart.vue";
import AudienceDetailPopup from "@/views/platform/modules/__components/AudienceDetailPopup.vue";
import ThreatScoreDetailPopup from "@/views/platform/modules/__components/ThreatScoreDetailPopup.vue";
import ThreatScoreDemoDetailPopup from "@/views/platform/modules/__components/ThreatScoreDemoDetailPopup.vue";
import {useFullscreenLoading} from "@/models/ui/FullscreenLoadingComposable";

const playerExplorerStore = usePlayerExplorerStore();
const portalStore = usePortalStore();
const fullscreenLoading = useFullscreenLoading();

const demoTooltip = ref(false);
const audienceTooltip = ref<AudienceTooltip>();
const threatScoreTooltip = ref<TooltipDataV2>();
const from = ref<string>();
const shareLinkTooltipState = ref(0);

onBeforeMount(async () => {
    from.value = useRouterStore().getQueryKey("from");
    await playerExplorerStore.filtersFromUrlQuery();
});

onUnmounted(() => {
    playerExplorerStore.clearUpdateFiltersCountdown();
});

watch(() => playerExplorerStore.isUpdating, (value) => {
    if (value) {
        fullscreenLoading.show();
    } else {
        fullscreenLoading.hide();
    }
});

async function onShareLink() {
    GembaseUtils.copyUrlToClipboard();
    shareLinkTooltipState.value = 1;
    await GembaseUtils.sleep(1000);
    shareLinkTooltipState.value = 2;
}

function onAudienceTooltip(value: AudienceTooltip) {
    audienceTooltip.value = value;
}

function onThreatScoreTooltip(value: TooltipDataV2) {
    threatScoreTooltip.value = value;
}

</script>

<style>
.gb-chart-card-title {
  @apply gb-layout-ml-row text-[1em] font-bold pt-4 pb-2 gap-2 pl-2;
}

.slider-container {
  width: 100%;
}

.slider-container .slider {
  @apply appearance-none w-full h-[5px] bg-violet-gray outline-none opacity-70 transition-opacity duration-200;
}

.slider-container .slider:hover {
  opacity: 1;
}

.slider-container .slider::-webkit-slider-thumb {
  @apply appearance-none w-[18px] h-[18px] bg-orange cursor-pointer rounded-circle;
}

.slider-container .slider::-moz-range-thumb {
  @apply appearance-none w-[18px] h-[18px] bg-orange cursor-pointer rounded-circle;
}

.portal-ui-text-anim {
  @apply text-orange;

  animation-name: portal-ui-text-anim-frames;
  animation-duration: 2s;
  animation-iteration-count: infinite;
}

@keyframes portal-ui-text-anim-frames {
  0% {
    @apply text-black;
  }

  50% {
    @apply text-orange;
  }

  100% {
    @apply text-black;
  }
}

</style>
