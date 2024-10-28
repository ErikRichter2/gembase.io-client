<template>
    <gb-window class="scoped-root" :header="`Explore games${portalStore.titleDemo()}`">
        <div class="gb-layout-tl gap-2">
            <gembase-ui-window-subtitle close-id="games-explorer">
                <span>
                    Explore Mechanics and Content to discover features with high market potential and low threat score. Tap the features to change product’s position in the market.
                </span>
            </gembase-ui-window-subtitle>

            <games-explorer-segment v-for="filter in gamesExplorerStore.filters" :key="filter.filter.id" :filter-id="filter.filter.id" @toggle-item="onToggleItem"></games-explorer-segment>

            <div class="gb-layout-ml-row w-full gap-2 pl-2">
                <gb-button v-if="gamesExplorerStore.filters.length <= 2" @click="gamesExplorerStore.addFilterGroup" tooltip="Add segment" class="gbc-bg-primary" icon="plus" :text="`Add segment ${gamesExplorerStore.filters.length + 1}`"></gb-button>
                <gembase-ui-apps-input data-tooltip="Search game" class="w-[300px] h-[30px] text-[0.75em]" @on-hint-selected="onHintSelected" :placeholder="'Enter title to add single game'" :search-in-concepts="true"></gembase-ui-apps-input>
                <div class="relative">
                    <gb-module-button :module-id="EModuleId.GAMES_EXPLORER" @click="onShareLink" class="gbc-bg-primary" icon="share" tooltip="Share segments' settings"></gb-module-button>
                    <gb-tooltip :show="shareLinkTooltip" text="Link with segments' settings has been copied to clipboard …"></gb-tooltip>
                </div>
                <gb-button @click="gamesExplorerStore.clearAll()" class="gbc-bg-primary" text="Clear all" icon="delete"></gb-button>
            </div>

            <games-explorer-comparison-map v-if="isReady"></games-explorer-comparison-map>
        </div>
        <audience-detail-popup class="!z-[1001]" :fixed="true" v-if="gamesExplorerStore.audienceTooltip !== undefined" @on-close="gamesExplorerStore.audienceTooltip = undefined" :tooltip-data="gamesExplorerStore.audienceTooltip as AudienceTooltip"></audience-detail-popup>
        <threat-score-detail-popup class="!z-[1001]" :max-competitors-count="true" :fixed="true" v-if="gamesExplorerStore.threatScoreTooltip !== undefined" @on-close="gamesExplorerStore.threatScoreTooltip = undefined" :tooltip-data="gamesExplorerStore.threatScoreTooltip as TooltipDataV2" :demo="portalStore.isDemo() || portalStore.isAuditorLocked()"></threat-score-detail-popup>
        <threat-score-demo-detail-popup class="!z-[1001]" v-if="demoTooltip" v-model="demoTooltip"></threat-score-demo-detail-popup>
    </gb-window>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, ref, watch} from "vue";
import GembaseUtils from "@/utils/GembaseUtils";
import GembaseUiWindowSubtitle from "@/views/ui/GembaseUiWindowSubtitle.vue";
import {useGamesExplorerStore} from "@/models/portal/gamesExplorer/GamesExplorerStore";
import {TAppId} from "@/models/portal/apps/AppsData";
import {StoreAppSearch,} from "@/models/portal/PortalDataTypes";
import {usePortalStore} from "@/models/portal/PortalStore";
import GembaseUiAppsInput from "@/views/ui/GembaseUiAppsInput.vue";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import GbModuleButton from "@/views/platform/ui/GbModuleButton.vue";
import {EModuleId} from "@/models/portal/PortalConstants";
import GbTooltip from "@/views/ui/tooltips/GbTooltip.vue";
import {
    AudienceTooltip,
    TooltipDataV2
} from "@/models/portal/competitor/PortalCompetitorData";
import {
    GamesExplorerSelectedItemTypeEnum
} from "@/models/portal/gamesExplorer/GamesExplorerData";
import {useAppsStore} from "@/models/portal/apps/AppsStore";
import GbWindow from "@/views/ui/popups/GbWindow.vue";
import GamesExplorerSegment from "@/views/platform/modules/gamesExplorer/__components/GamesExplorerSegment.vue";
import GamesExplorerComparisonMap
    from "@/views/platform/modules/gamesExplorer/__components/GamesExplorerComparisonMap.vue";
import AudienceDetailPopup from "@/views/platform/modules/__components/AudienceDetailPopup.vue";
import ThreatScoreDetailPopup from "@/views/platform/modules/__components/ThreatScoreDetailPopup.vue";
import ThreatScoreDemoDetailPopup from "@/views/platform/modules/__components/ThreatScoreDemoDetailPopup.vue";
import {useFullscreenLoading} from "@/models/ui/FullscreenLoadingComposable";

const gamesExplorerStore = useGamesExplorerStore();
const portalStore = usePortalStore();
const fullscreenLoading = useFullscreenLoading();

const mouseOverApp = ref<TAppId>();
const demoTooltip = ref(false);
const shareLinkTooltip = ref(0);
const isReady = ref(false);

onMounted(async () => {
    gamesExplorerStore.clearData();
    await gamesExplorerStore.getFilterDef();
    await gamesExplorerStore.filtersFromUrlQuery();
    await gamesExplorerStore.refreshThreatScore();
    isReady.value = true;
});

onUnmounted(() => {
    gamesExplorerStore.clearData();
});

watch(() => gamesExplorerStore.isUpdating, (value) => {
    if (value) {
        fullscreenLoading.show();
    } else {
        fullscreenLoading.hide();
    }
});

function onShareLink() {
    GembaseUtils.copyUrlToClipboard();
    shareLinkTooltip.value++;
}

function onToggleItem() {
    mouseOverApp.value = undefined;
}

async function onHintSelected(hint: StoreAppSearch) {
    if (hint.app_id === undefined) {
        const appDetail = await portalStore.scrapApp(hint.app_id_in_store, hint.store);
        hint.app_id = appDetail.app_id;
    }

    await useAppsStore().getAppDetailAsync({
        appId: hint.app_id
    });
    gamesExplorerStore.toggleItem({
        id: hint.app_id,
        type: GamesExplorerSelectedItemTypeEnum.APP
    });
}

</script>
