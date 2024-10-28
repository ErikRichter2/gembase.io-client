<script setup lang="ts">

import {RoutesEnum} from "@/router/RoutesEnum";
import {PortalCompetitorUtils} from "@/models/portal/competitor/PortalCompetitorUtils";
import GembaseUiWindowCloseBtn from "@/views/ui/GembaseUiWindowCloseBtn.vue";
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
import PortalUiThreatScoreComponent from "@/views/platform/modules/__components/PlatformThreatScoreElement.vue";
import PortalUiTamV2 from "@/views/platform/modules/auditor/__components/__components/AuditorTamElement.vue";
import GbSvg from "@/views/ui/icons/GbSvg.vue";
import PortalUtils from "@/models/portal/PortalUtils";
import {AuditorTunerHistory} from "@/models/portal/auditor/tuner/AuditorTunerData";

const portalStore = usePortalStore();

const emits = defineEmits<{
    (event: "close"),
    (event: "change", tunerIndex: number)
}>();

const props = defineProps<{
    appId?: TAppId,
    history: AuditorTunerHistory,
    tunerIndex: number
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
            };

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

function getTs(): number {
    return props.history.items[props.history.items.length - 1].ts ?? 0;
}

</script>

<template>
    <gembase-ui-window-close-btn :prevent-route-back="true" @on-close="emits('close')"></gembase-ui-window-close-btn>
    <div class="gb-layout gap-2 pt-4">
        <div class="gb-layout-ml-row w-full pl-2 gap-1">
            <gb-svg icon="potential" class="w-[20px] h-[20px]"></gb-svg>
            <div class="text-[1.2em] font-bold">
                Tuner
            </div>
        </div>
        <div class="gb-inner-window w-full">
            <div class="gb-layout-tl w-full">
                <div class="gb-layout-row gap-1 pl-2 pb-1">
                    <gb-svg icon="tam_audience" class="w-[20px] h-[20px]"></gb-svg>
                    <div class="font-bold">
                        Top audience
                    </div>
                </div>
                <div class="gb-inner-window w-full">
                    <div class="w-full">
                        <div v-if="history.items.length > 0" class="gb-layout w-full gap-2">
                            <div class="gb-layout-m-between w-full gap-2 min-w-[250px]">
                                <div class="text-[1em] pl-2">
                                    {{PortalCompetitorUtils.getNameForAudience(history.items[history.items.length - 1].competitors?.audience_detail)}} fans
                                </div>
                                <portal-ui-router-link :to="{name: RoutesEnum.PLAYERS, query: tunerAudiencePlayerExplorerQuery}">
                                    <gb-button class="gbc-bg-primary" :icon="PortalConstants.ICON_PLAYERS" tooltip="Segment details"></gb-button>
                                </portal-ui-router-link>
                            </div>
                            <div class="gb-layout-row gap-4">
                                <div class="w-[160px] h-[30px]">
                                    <portal-ui-tam-v2 :readonly="true" :show-icon="true" :audience="history.items[history.items.length - 1].competitors?.audience_detail?.audience_stats" :tam="history.items[history.items.length - 1].competitors?.audience_detail?.tam"></portal-ui-tam-v2>
                                </div>
                                <div class="w-[65px] h-[30px] text-[12px]">
                                    <portal-ui-threat-score-component :angle="PortalCompetitorUtils.getNameForAudience(history.items[history.items.length - 1].competitors?.audience_detail)" :show-icon="true" :threat-score="getTs()" :readonly="true"></portal-ui-threat-score-component>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="gb-inner-window w-full">
            <div class="gb-layout-tl w-full h-[150px]">
                <div class="gb-ui-scroll-v gb-layout-tc w-full h-full gap-[2px]">
                    <div class="gb-layout-m-between w-full pb-1 h-[25px]">
                        <div class="gb-layout-ml-row gap-1 w-[140px] h-full">
                            <gb-svg icon="history" class="pl-1 h-full w-auto"></gb-svg>
                            <div class="text-[0.8em] font-bold">History</div>
                        </div>
                        <div class="gb-layout-row w-[60px] h-full">
                            <gb-svg icon="tam_audience" class="h-full w-auto"></gb-svg>
                        </div>
                        <div class="gb-layout-row w-[60px] h-full">
                            <gb-svg icon="threat_score" class="h-full w-auto"></gb-svg>
                        </div>
                    </div>
                    <div v-for="(it, index) in history.items" :key="index" class="gb-layout-m-between w-full gap-1 text-[0.6rem]">
                        <template v-if="it.tagId !== undefined">
                            <div class="gb-layout-ml-row gbc-bg-node rounded-full pl-2 pr-2 pt-0 pb-0 h-auto w-[140px]" :data-selected="tunerIndex === index">
                                {{getTunerNodeText(index)}}
                            </div>
                            <div class="gbc-bg-node gb-layout-row rounded-full pl-2 pr-2 w-[60px] h-auto" :data-selected="tunerIndex === index" :data-tooltip="it.audienceTitle">
                                <div class="gb-layout-row w-full" :data-inactive="tunerIndex !== index" :data-tint="(it.diff_audience ?? 0) < 0 ? 'r' : (it.diff_audience ?? 0) > 0 ? 'g' : ''">{{PortalUtils.formatHistoryDiffNumber(it.diff_audience)}}%</div>
                            </div>
                            <div class="gbc-bg-node gb-layout-row rounded-full pl-2 pr-2 w-[60px] h-auto" :data-selected="tunerIndex === index" :data-tooltip="it.tsTitle">
                                <div class="gb-layout-row w-full" :data-inactive="tunerIndex !== index" :data-tint="(it.diff_ts ?? 0) > 0 ? 'r' : (it.diff_ts ?? 0) < 0 ? 'g' : ''">{{PortalUtils.formatHistoryDiffNumber(it.diff_ts)}}%</div>
                            </div>
                        </template>
                    </div>
                </div>
                <div v-if="history.items.length > 1" class="gb-layout-m-between gbc-bg-node rounded-full pl-2 pr-2 text-[0.7rem] w-full mt-2 pt-0 pb-0 h-auto" :data-selected="true" :data-glow="true">
                    <div class="whitespace-nowrap">Total difference</div>
                    <div class="gb-layout-mr-row gap-[40px] font-bold">
                        <div class="gb-layout-row w-[30px]" :data-tooltip="history.audienceTitle" :data-tint="(history.audienceDiff ?? 0) < 0 ? 'r' : (history.audienceDiff ?? 0) > 0 ? 'g' : ''">{{PortalUtils.formatHistoryDiffNumber(history.audienceDiff)}}%</div>
                        <div class="gb-layout-row w-[50px]" :data-tooltip="history.tsTitle" :data-tint="(history.tsDiff ?? 0) > 0 ? 'r' : (history.tsDiff ?? 0) < 0 ? 'g' : ''">{{PortalUtils.formatHistoryDiffNumber(history.tsDiff)}}%</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="gb-layout-m-between w-[90%] pb-4">
            <gb-button :demo="portalStore.isTunerLocked()" :disabled="tunerIndex <= 0" @click="tunerUndo" class="gbc-bg-primary" icon="undo" tooltip="Undo"></gb-button>
            <gb-button :demo="portalStore.isTunerLocked()" :disabled="tunerIndex >= history.items.length - 1" @click="tunerRedo" class="gbc-bg-primary gb2-flip-svg" icon="undo" tooltip="Redo"></gb-button>
        </div>
    </div>
</template>
