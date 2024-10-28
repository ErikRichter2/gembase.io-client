<template>
    <gb-window header="Choose a solution" :hide-close="true">
        <div v-if="!tutorialStore.isTutorial" class="absolute top-[35px] right-[25px]">
            <gb-button @click="tutorialStore.onIntroduction()" text="Introduction" icon="play" class="gbc-bg-primary !w-full"></gb-button>
        </div>
        <div class="gb-layout-tl-row gap-1">
            <div v-for="(gr, index) in getModules()" :key="index" class="gb-layout gap-1">
                <div v-for="module in gr" :key="module.id" @click="toggleModule(module.id)" class="gb-layout-row">
                    <div v-if="selectedModules.includes(module.id)" class="gb-layout module-btn p-2" :data-wip="module.wip">
                        <div class="gb-inner-window relative">
                            <gb-svg class="absolute top-[10px] right-[20px] w-[18px] h-[18px] rotate-180" icon="expand_menu"></gb-svg>
                            <div class="gb-layout ml-2 mr-5 mt-2 mb-1 gap-2">
                                <div class="text-[0.7rem] leading-3">
                                    <platform-module-logo-element class="pb-1" :module-id="module.id"></platform-module-logo-element>
                                    <span>{{module.desc}}</span>
                                </div>
                                <div class="gb-layout-ml w-full">
                                    <gb-button @click="startTutorial(module.id)" class="gbc-bg-primary" :text="module.callToAction" :disabled="module.wip" icon="point"></gb-button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="module-btn module-gr gbc-bg-secondary" data-interactive :data-glow="true" :data-tooltip="module.desc" :data-wip="module.wip">
                        <div class="gb-layout-row gap-2">
                            <gb-svg :icon="module.icon" class="w-[25px] h-[25px]"></gb-svg>
                            <div class="text-[0.7rem]">{{module.shortDesc}}</div>
                        </div>
                        <gb-svg v-if="tutorialStore.tutorialData.modules_seen?.includes(module.id)" icon="check_single" class="w-[20px] h-[20px] opacity-40"></gb-svg>
                    </div>
                </div>
            </div>
        </div>
    </gb-window>
</template>

<script setup lang="ts">
import {EModuleId, PortalConstants, PortalModuleDef} from "@/models/portal/PortalConstants";
import {ref} from "vue";
import GembaseUtils from "@/utils/GembaseUtils";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import {useTutorialStore} from "@/models/portal/tutorial/TutorialStore";
import GbSvg from "@/views/ui/icons/GbSvg.vue";
import GbWindow from "@/views/ui/popups/GbWindow.vue";
import PlatformModuleLogoElement from "@/views/platform/__components/PlatformModuleLogoElement.vue";

const tutorialStore = useTutorialStore();

const selectedModules = ref<EModuleId[]>([]);

function toggleModule(moduleId: EModuleId) {
    GembaseUtils.toggleArr(selectedModules.value, moduleId);
}

function startTutorial(moduleId: EModuleId) {
    tutorialStore.commandModuleSeen(moduleId);
    tutorialStore.startTutorial(`module__${moduleId}`);
}

function getModules() {
    const res: PortalModuleDef[][] = [[], []];

    res[0].push(PortalConstants.getModule(EModuleId.AUDITOR));
    res[0].push(PortalConstants.getModule(EModuleId.GAMES_EXPLORER));
    res[0].push(PortalConstants.getModule(EModuleId.GAPS));
    res[0].push(PortalConstants.getModule(EModuleId.LENSES));

    res[1].push(PortalConstants.getModule(EModuleId.TUNER));
    res[1].push(PortalConstants.getModule(EModuleId.PLAYERS_EXPLORER));
    res[1].push(PortalConstants.getModule(EModuleId.STUDIES));
    res[1].push(PortalConstants.getModule(EModuleId.CREATOR));

    return res;
}
</script>

<style scoped>
.module-gr {
  @apply pt-2 pb-2 pl-5 pr-5 gb-layout-m-between bg-violet rounded-2xl border-0;
}

.module-btn {
  @apply rounded-2xl cursor-pointer w-[370px];
}

.module-btn[data-wip="true"] {
  @apply cursor-default opacity-50;
}

.module-btn svg {
  @apply h-[20px] w-auto;
}

</style>
