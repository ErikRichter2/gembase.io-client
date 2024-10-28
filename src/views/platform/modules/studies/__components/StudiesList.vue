<script setup lang="ts">

import {useStudiesStore} from "@/models/portal/studies/StudiesStore";
import {PortalStudiesStudy} from "@/models/portal/studies/StudiesData";
import {StudiesHelper} from "@/models/portal/studies/StudiesHelper";
import {RoutesEnum} from "@/router/RoutesEnum";
import {ref} from "vue";
import GembaseUtils from "@/utils/GembaseUtils";
import {RouteLocationRaw} from "vue-router";
import {usePlayerExplorerStore} from "@/models/portal/playerExplorer/PlayerExplorerStore";
import PortalUiRouterLink from "@/views/ui/router/PortalUiRouterLink.vue";
import {usePortalStore} from "@/models/portal/PortalStore";
import {EModuleId, PortalConstants} from "@/models/portal/PortalConstants";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import GbTooltip from "@/views/ui/tooltips/GbTooltip.vue";
import GbWindow from "@/views/ui/popups/GbWindow.vue";
import {useRouterStore} from "@/core/router/RouterStore";
import GbSvg from "@/views/ui/icons/GbSvg.vue";

const portalStore = usePortalStore();
const studiesStore = useStudiesStore();

const shareLinkTooltipState = ref(0);

async function onShareLink(studyGuid: string) {
    const url = `${useRouterStore().getFullUrl(RoutesEnum.PORTAL_STUDIES_PREVIEW)}?id=${studyGuid}`
    GembaseUtils.copyUrlToClipboard(url);
    shareLinkTooltipState.value = 1;
    await GembaseUtils.sleep(1000);
    shareLinkTooltipState.value = 2;
}

function getStateText(study: PortalStudiesStudy) {
    if (study.state === "preparing") {
        return "preparing";
    }
    if (study.state === "working") {
        return "active";
    }
    if (study.state === "paused") {
        return "paused";
    }
    if (study.state === "done") {
        return "done";
    }
    return "";
}

async function addStudy() {
    const studyGuid = await studiesStore.addStudy();
    await studiesStore.routerQuery.replace({
        show: "concepts",
        study: studyGuid
    });
}

function getPlayerExplorerRoute(studyId: string): RouteLocationRaw {
    const playerExplorerStore = usePlayerExplorerStore();

    const query = playerExplorerStore.generateUrlQuery([
        {
            data: {
                id: GembaseUtils.guid(),
                surveys: {
                    active: studyId,
                    items: []
                }
            }
        }
    ], "concepts")

    return {
        name: RoutesEnum.PLAYERS,
        query: query
    }
}
</script>

<template>
    <gb-window :header="`Validate ideas${portalStore.titleDemo()}`">
        <div class="gb-inner-window w-full">
            <div class="gb-layout-tl w-full">
                <div class="gb-ui-inner-window-header">
                    <b>My studies</b>
                </div>
                <div class="gb-layout-tl w-full gap-1">
                    <div v-for="study in studiesStore.studies" :key="study.guid" class="gbc-bg-node gb-base-shape text-[0.8em]">
                        <div class="gb-layout-ml-row w-full h-[30px] pl-3 pr-3 text-[0.8em]">
                            <div class="w-[150px]">
                                {{study.name}}
                            </div>
                            <div class="gb-layout-ml-row h-full w-[120px]">
                                <gb-svg icon="arrange_meeting" class="icon-h"></gb-svg>
                                <div>
                                    {{GembaseUtils.timestampToShortDate(study.t)}}
                                </div>
                            </div>
                            <div class="gb-layout-ml-row h-full w-[70px]">
                                <gb-svg icon="generate_pool" class="icon-h"></gb-svg>
                                <div>
                                    {{StudiesHelper.getConceptsCountForStudy(study)}}
                                </div>
                            </div>
                            <div class="gb-layout-ml-row h-full gap-2 w-[70px]">
                                <gb-svg icon="tam_audience" class="icon-h"></gb-svg>
                                <div>
                                    {{StudiesHelper.getAudiencesCount(study)}}
                                </div>
                            </div>
                            <div class="gb-layout-ml-row h-full w-[80px]">
                                <div v-if="StudiesHelper.isInternal(study)" class="gb-layout-ml-row w-full h-full pl-2">
                                    internal
                                </div>
                                <div v-else class="gb-layout-ml-row w-full h-full">
                                    <gb-svg icon="currency_dollar" class="icon-h h-[80%]"></gb-svg>
                                    <div>
                                        {{StudiesHelper.getPrice(study)}}
                                    </div>
                                </div>
                            </div>
                            <div class="w-[50px] text-orange data-[done='true']:text-dim-ocean" :data-done="study.progress_perc === 100">
                                <b>{{study.progress_perc}}%</b>
                            </div>
                            <div class="w-[150px]">
                                <span>{{getStateText(study)}}</span>
                            </div>
                            <div class="gb-layout-mr-row h-full gap-1 w-[300px]">
                                <gb-button v-if="study.state === 'preparing' || study.state === 'paused'" icon="play" :demo="studiesStore.isLocked()" class="gbc-bg-primary study-btn" :disabled="!(study.state === 'paused' || studiesStore.isLocked())" tooltip="Start survey"></gb-button>
                                <gb-button v-else class="gbc-bg-primary study-btn" tooltip="Pause survey" icon="pause" :disabled="!(study.state === 'working' || studiesStore.isLocked())" :demo="studiesStore.isLocked()"></gb-button>
                                <router-link :to="{name: RoutesEnum.PORTAL_STUDIES_PREVIEW, query: {id: study.guid, reset: 'true'}}" target= "_blank" data-tooltip="Preview survey">
                                    <gb-button class="gbc-bg-primary study-btn" icon="see_more"></gb-button>
                                </router-link>
                                <router-link :to="{query: {study: study.guid}}" data-tooltip="Edit study">
                                    <gb-button class="gbc-bg-primary study-btn" icon="edit_question"></gb-button>
                                </router-link>
                                <gb-button icon="copy" tooltip="Copy study" :demo="studiesStore.isLocked()" @click="studiesStore.copyStudy(study)" class="gbc-bg-primary study-btn"></gb-button>
                                <gb-button icon="share" tooltip="Share survey preview link" :demo="studiesStore.isLocked()" @click="onShareLink(study.guid)" class="gbc-bg-primary study-btn"></gb-button>
                                <gb-tooltip :show="shareLinkTooltipState" text="Survey preview link has been copied to clipboard …"></gb-tooltip>
                                <gb-button icon="download" class="gbc-bg-primary study-btn" tooltip="Download CSV" :demo="studiesStore.isLocked()" :disabled="!(StudiesHelper.isInternal(study) || studiesStore.isLocked())" @click="studiesStore.generateCsvForInternalLaunch(study.guid)"></gb-button>
                                <gb-button icon="currency_dollar" tooltip="Billing" :demo="studiesStore.isLocked()" :disabled="!(!StudiesHelper.isInternal(study) || studiesStore.isLocked())" class="gbc-bg-primary study-btn"></gb-button>
                                <portal-ui-router-link :disabled="usePortalStore().isDemo() || usePortalStore().isModuleLocked(EModuleId.PLAYERS_EXPLORER)" :to="getPlayerExplorerRoute(study.guid)">
                                    <gb-button class="gbc-bg-primary study-btn" :icon="PortalConstants.ICON_PLAYERS" tooltip="Show in player explorer" :demo="usePortalStore().isDemo()" :disabled="usePortalStore().isModuleLocked(EModuleId.PLAYERS_EXPLORER) || study.state !== 'done'"></gb-button>
                                </portal-ui-router-link>
                                <gb-button icon="random" tooltip="Randomize results" class="gbc-bg-primary study-btn" :disabled="study.global_study !== 0" @click="studiesStore.simulateSurvey(study.guid)"></gb-button>
                                <gb-button icon="delete" tooltip="Delete study" class="gbc-bg-primary study-btn" :disabled="study.global_study !== 0 || study.state === 'done'" @click="studiesStore.deleteStudy(study.guid)"></gb-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="gb-ui-window-footer">
            <gb-button id="add_study_btn" text="Add study" icon="plus" tooltip="Add study" class="gbc-bg-primary" @click="addStudy"></gb-button>
        </div>
    </gb-window>
</template>

<style scoped>
.study-btn {
  @apply !w-[35px] !h-[25px] !min-w-[35px];
}

.study-btn svg {
  @apply h-[75%] w-auto;
}

.icon-h {
  @apply h-[80%] w-auto;
}

</style>
