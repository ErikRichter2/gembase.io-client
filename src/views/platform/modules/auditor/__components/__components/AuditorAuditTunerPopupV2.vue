<script setup lang="ts">

import {RoutesEnum} from "@/router/RoutesEnum";
import {PortalCompetitorUtils} from "@/models/portal/competitor/PortalCompetitorUtils";
import {LocationQuery} from "vue-router";
import {TAppId} from "@/models/portal/apps/AppsData";
import {PlayerExplorerFilter} from "@/models/portal/PortalDataTypes";
import GembaseUtils from "@/utils/GembaseUtils";
import {TagsHelper} from "@/models/portal/tags/TagsHelper";
import {usePlayerExplorerStore} from "@/models/portal/playerExplorer/PlayerExplorerStore";
import {usePortalStore} from "@/models/portal/PortalStore";
import {computed} from "vue";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import {PortalConstants} from "@/models/portal/PortalConstants";
import PortalUiRouterLink from "@/views/ui/router/PortalUiRouterLink.vue";
import GbSvg from "@/views/ui/icons/GbSvg.vue";
import PortalUiTamV2 from "@/views/platform/modules/auditor/__components/__components/AuditorTamElement.vue";
import PortalUiThreatScoreComponent from "@/views/platform/modules/__components/PlatformThreatScoreElement.vue";
import PortalUtils from "@/models/portal/PortalUtils";
import {AuditorTunerHistory} from "@/models/portal/auditor/tuner/AuditorTunerData";
import TaggingProgress from "@/views/platform/modules/__components/TaggingProgress.vue";

const portalStore = usePortalStore();

const emits = defineEmits<{
    (event: "close"),
    (event: "change", tunerIndex: number)
}>();

const props = defineProps<{
    appId?: TAppId,
    history: AuditorTunerHistory,
    tunerIndex: number,
    productNodesProgress: number | null
}>();

const tunerAudiencePlayerExplorerQuery = computed(() => {
    let query: LocationQuery | undefined = undefined;

    if (props.history.items.length > 0 && props.tunerIndex < props.history.items.length) {

        const audience = props.history.items[props.tunerIndex].competitors?.audience_detail;
        const tags = props.history.items[props.tunerIndex].tags;

        if (audience !== undefined && tags !== undefined) {
            const filter: PlayerExplorerFilter = {
                id: GembaseUtils.guid()
            }
            if (audience.tag_ids.length > 0) {
                filter.loved = {
                    tag_ids: GembaseUtils.copy(audience.tag_ids)
                };
            }
            filter.not_hated = {
                tag_ids: TagsHelper.getTagsList(tags)
            }

            query = usePlayerExplorerStore().generateUrlQuery([{data: filter}], undefined, "audit", props.appId);
        }
    }

    return query;
});

function getTunerNodeText(index: number) {
    const data = props.history.items[index];
    let text = "";

    if (data.tagId !== undefined) {
        if (TagsHelper.hasTag(data.tags, data.tagId)) {
            text += "Added ";
        } else {
            text += "Removed "
        }
        text += portalStore.getPortalDefProductItem(data.tagId)?.node;
    }

    return text;
}

function tunerUndo() {
    if (props.tunerIndex > 0) {
        emits("change", props.tunerIndex - 1);
    }
}

function tunerRedo() {
    if (props.tunerIndex < props.history.items.length - 1) {
        emits("change", props.tunerIndex + 1);
    }
}

</script>

<template>
    <div v-if="history.items.length > 0" class="gb-window !gb-layout-tl gap-1 p-2">
        <div class="gb-layout-tl-row h-[20px] gap-3 pl-2">
            <div class="gb-layout-row gap-1 h-full">
                <gb-svg class="h-full w-auto" :icon="PortalConstants.ICON_PLAYERS"></gb-svg>
                <div>{{PortalCompetitorUtils.getNameForAudience(history.items[history.items.length - 1].competitors?.audience_detail)}} fans</div>
            </div>
            <div class="gb-layout-tl-row h-full gap-1">
                <portal-ui-router-link class="h-full" :to="{name: RoutesEnum.PLAYERS, query: tunerAudiencePlayerExplorerQuery}">
                    <gb-button :icon="PortalConstants.ICON_PLAYERS" class="gbc-bg-primary !pt-0 !pb-0 !h-full !w-[20px]"></gb-button>
                </portal-ui-router-link>
                <gb-button class="gbc-bg-secondary !h-full !w-[20px]" icon="close" @click="emits('close')"></gb-button>
            </div>
        </div>
        <div class="gb-layout-row w-full h-[40px] gap-1">
            <div class="w-[120px] h-[30px]">
                <portal-ui-tam-v2 :readonly="true" :audience="history.items[history.items.length - 1].competitors?.audience_detail?.audience_stats" :tam="history.items[history.items.length - 1].competitors?.audience_detail?.tam"></portal-ui-tam-v2>
            </div>
            <div class="w-[70px] h-[30px]">
                <portal-ui-threat-score-component :readonly="true" :show-icon="true" :threat-score="history.items[history.items.length - 1].ts"></portal-ui-threat-score-component>
            </div>
        </div>
        <div class="gb-layout-tl-row h-[20px] gap-1">
            <gb-svg icon="history"></gb-svg>
            <gb-button :demo="portalStore.isTunerLocked()" :disabled="tunerIndex <= 0" @click="tunerUndo" class="gbc-bg-primary !h-full !w-[20px]" icon="undo" tooltip="Undo"></gb-button>
            <gb-button :demo="portalStore.isTunerLocked()" :disabled="tunerIndex >= history.items.length - 1" @click="tunerRedo" class="gbc-bg-primary !h-full !w-[20px] gb2-flip-svg" icon="undo" tooltip="Redo"></gb-button>
        </div>
        <div class="relative">
            <div class="absolute h-[20px] gb-layout-m-between top-[-20px] right-[20px] w-[85px]">
                <gb-svg class="h-full" :icon="PortalConstants.ICON_PLAYERS"></gb-svg>
                <gb-svg class="!h-[10px]" :icon="PortalConstants.ICON_THREAT_SCORE"></gb-svg>
            </div>
        </div>
        <div v-if="history.items.length > 1" class="gb-layout-m-between gbc-bg-node rounded-full pl-2 pr-2 text-[0.7rem] w-full mt-1 pt-0 pb-0 h-auto" :data-selected="true" :data-glow="true">
            <div class="whitespace-nowrap">Total difference</div>
            <div class="gb-layout-mr-row gap-[30px] font-bold">
                <div class="gb-layout-row text-white w-[35px]" :data-tooltip="history.audienceTitle" :data-tint="(history.audienceDiff ?? 0) < 0 ? 'r' : (history.audienceDiff ?? 0) > 0 ? 'g' : ''">{{PortalUtils.formatHistoryDiffNumber(history.audienceDiff)}}%</div>
                <div class="gb-layout-row text-white w-[35px]" :data-tooltip="history.tsTitle" :data-tint="(history.tsDiff ?? 0) > 0 ? 'r' : (history.tsDiff ?? 0) < 0 ? 'g' : ''">{{PortalUtils.formatHistoryDiffNumber(history.tsDiff)}}%</div>
            </div>
        </div>
        <!-- loading progress -->
        <div v-if="productNodesProgress !== null" class="gb-layout z-50 pt-2">
            <tagging-progress :product-nodes-progress="productNodesProgress"></tagging-progress>
        </div>
        <!-- loading progress -->
    </div>
</template>
