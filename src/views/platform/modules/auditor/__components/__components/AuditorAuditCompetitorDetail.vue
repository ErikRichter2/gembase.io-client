<script setup lang="ts">

import {AppDetailUtils} from "@/models/portal/apps/AppDetailUtils";
import PortalUiRevealBtn from "@/views/shared/DemoRevealBtn.vue";
import PortalUiThreatScoreComponent from "@/views/platform/modules/__components/PlatformThreatScoreElement.vue";
import {computed, ref} from "vue";
import {TAppId} from "@/models/portal/apps/AppsData";
import {
    ETsGroup, IPlatformCalcCompetitors,
    IPlatformCalcCompetitorsAppDetail,
    IPlatformCalcCompetitorsTs,
    IPlatformCalcCompetitorsTsGroup
} from "@/models/portal/calc/PlatformCalcData";
import {PlatformValuesHelper} from "@/models/portal/competitor/PlatformValuesHelper";
import EndpointRequest from "@/core/requests/EndpointRequest";
import {ITsGroupLogSimilarity} from "@/models/portal/PortalDataTypes";
import AuditorPopupTsSimilarityDetail
    from "@/views/platform/modules/auditor/__components/__components/AuditorPopupTsSimilarityDetail.vue";
import GbPopup from "@/views/ui/popups/GbPopup.vue";
import {useAuthStore} from "@/models/auth/AuthStore";
import AuditorAppStoreIconLink
    from "@/views/platform/modules/auditor/__components/__components/AuditorAppStoreIconLink.vue";
import AuditorAppRouteElement
    from "@/views/platform/modules/auditor/__components/__components/__components/AuditorAppRouteElement.vue";
import {useFullscreenLoading} from "@/models/ui/FullscreenLoadingComposable";

const fullscreenLoading = useFullscreenLoading();

const props = defineProps<{
    selectedCompetitor?: IPlatformCalcCompetitorsAppDetail,
    competitors?: IPlatformCalcCompetitors;
}>();

const emits = defineEmits<{
    (event: "onTsSingleApp", appId: TAppId | undefined);
}>();

const tsGroupSimilarityLog = ref<ITsGroupLogSimilarity>();

const selectedCompetitorThreatScore = computed((): IPlatformCalcCompetitorsTs | null => {
    if (props.competitors?.ts_items !== undefined) {
        for (let i = 0; i < props.competitors.ts_items.length; ++i) {
            if (props.competitors.ts_items[i].app_id === props.selectedCompetitor?.app_id) {
                return props.competitors.ts_items[i];
            }
        }
    }
    return null;
});

const hoverGroup = ref<string>();

function getGroupText(group: IPlatformCalcCompetitorsTsGroup) {
    if (hoverGroup.value !== undefined && hoverGroup.value === group.gr) {
        const altText = PlatformValuesHelper.tsGroupAltText(group);
        if (altText !== undefined) {
            return altText;
        }
    }

    return group.ts_name;
}

async function onTsGroupClick(tsGroup: IPlatformCalcCompetitorsTsGroup) {
    if (!useAuthStore().isAdmin()) {
        return;
    }
    fullscreenLoading.show();
    if (tsGroup.gr === ETsGroup.Similar) {
        const serverData = await EndpointRequest.process2<any>("platform_values:get_ts_similarity_log", {
            platform_id: props.competitors?.platform_id,
            competitor: {
                app_id: props.selectedCompetitor?.app_id
            }
        });
        tsGroupSimilarityLog.value = {
            competitor: props.selectedCompetitor,
            data: serverData
        }
    }
    fullscreenLoading.hide();
}

</script>

<template>
    <div v-if="selectedCompetitor !== undefined" class="gb-inner-window w-full">
        <div class="gb-layout-ml-row gap-2 w-full h-full">
            <div class="w-[70px] h-[70px]">
                <img class="h-full w-auto border border-black rounded-lg" :src="AppDetailUtils.getIcon(selectedCompetitor)">
            </div>
            <div class="gb-layout-tl h-full gap-1 w-[calc(100%-70px)] pl-1">
                <div class="gb-layout-t-between gb-layout-full pt-1">
                    <div class="gb-layout-ml w-full h-full pl-1">
                        <div class="gb-layout-tl-row gap-3">
                            <div class="gb-text-ellipsis font-bold max-w-[440px]">
                                {{ selectedCompetitor?.locked ? 'Game locked in DEMO' : selectedCompetitor.title }}
                            </div>
                            <div class="gb-layout-tl-row gap-1">
                                <auditor-app-route-element :app-id="selectedCompetitor.app_id"></auditor-app-route-element>
                                <auditor-app-store-icon-link :app="selectedCompetitor"></auditor-app-store-icon-link>
                            </div>
                        </div>
                        <div v-if="selectedCompetitor?.locked" class="text-[0.7em]">
                            This section is not available in DEMO.
                        </div>
                    </div>
                    <div v-if="selectedCompetitor?.locked">
                        <portal-ui-reveal-btn></portal-ui-reveal-btn>
                    </div>
                    <div v-else class="gb-layout-tl-row h-full gap-4">
                        <div class="text-[0.8em] h-[30px] w-[90px]">
                            <portal-ui-threat-score-component :app-title="selectedCompetitor.title" :single-version="true" :show-icon="true" @click="emits('onTsSingleApp', props.selectedCompetitor?.app_id)" :threat-score="selectedCompetitorThreatScore?.ts"></portal-ui-threat-score-component>
                        </div>
                    </div>
                </div>
                <div class="gb-layout-ml-row justify-evenly w-full h-full gap-1">
                    <div @click="onTsGroupClick(tsGroup)" v-for="tsGroup in selectedCompetitorThreatScore?.ts_groups" :key="tsGroup.gr" class="gb-layout-m-between grow p-1 pl-2 pr-2 gap-2 rounded-full gbc-bg-secondary text-[0.55em]" data-tooltip-delay="0" :data-tooltip="getGroupText(tsGroup)" @mouseover="hoverGroup = tsGroup.gr" @mouseout="hoverGroup = undefined">
                        <div class="whitespace-nowrap">{{PlatformValuesHelper.tsName(tsGroup)}}</div>
                        <div class="gbc-semaphore-icon" :data-color="tsGroup.c"></div>
                    </div>
                </div>
            </div>
        </div>
        <gb-popup v-if="tsGroupSimilarityLog !== undefined" @close="tsGroupSimilarityLog = undefined">
            <auditor-popup-ts-similarity-detail v-if="tsGroupSimilarityLog !== undefined" :data="tsGroupSimilarityLog"></auditor-popup-ts-similarity-detail>
        </gb-popup>
    </div>
</template>
