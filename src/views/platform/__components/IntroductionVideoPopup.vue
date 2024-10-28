<script setup lang="ts">
import {computed, ref} from "vue";
import GembaseUtils from "@/utils/GembaseUtils";
import GbPopup from "@/views/ui/popups/GbPopup.vue";

interface IVideoSection {
    name: string;
    file: string;
    duration: number;
}

const videoSections = ref<IVideoSection[]>([
    {name: "Intro", file: "intro", duration: 64},
    {name: "Auditor", file: "auditor", duration: 120+47},
    {name: "Tuner", file: "tuner", duration: 24},
    {name: "Games", file: "games", duration: 45},
    {name: "Players", file: "players", duration: 68},
    {name: "Gaps", file: "gaps", duration: 52},
    {name: "Studies", file: "studies", duration: 62},
    {name: "Outro", file: "outro", duration: 23},
]);

const activeSection = ref(videoSections.value[0].name);
const refVideoEl = ref<HTMLVideoElement>();

const videoSrc = computed(() => {
    const section = videoSections.value.find((x) => x.name === activeSection.value);
    const basePath = "/static/media/gembase/home/v2/videos/onboarding/";

    if (section !== undefined) {
        return `${basePath}${section.file}.mp4`;
    }

    return `${basePath}${videoSections.value[0].file}.mp4`;
});

function onSectionClick(item: IVideoSection) {
    activeSection.value = item.name;
}

function onEnded() {
    for (let i = 0; i < videoSections.value.length; ++i) {
        if (videoSections.value[i].name === activeSection.value) {
            if (i < videoSections.value.length - 1) {
                activeSection.value = videoSections.value[i + 1].name;
                return;
            }
        }
    }
}

</script>

<template>
    <gb-popup header="9 minute guide to Gembase.io">
        <div class="gb-layout-tl-row gap-10 pt-3 pl-4 pr-4">
            <div class="text-[0.8rem] gb-layout-tl gap-1">
                <div v-for="item in videoSections" :key="item.name" @click="onSectionClick(item)" class="gb-layout-ml-row gap-2">
                    <div class="w-[15px] h-[15px] section-icon rounded-[50%]" :data-active="activeSection === item.name"></div>
                    <div class="cursor-pointer gb-layout-tl-row gap-2 text-white hover:text-yellow data-[active='true']:text-ocean" :data-active="activeSection === item.name">
                        <div>
                            {{item.name}}
                        </div>
                        <div>
                            {{GembaseUtils.deltaSecondsFormat(item.duration, false, true)}}
                        </div>
                    </div>
                </div>
            </div>
            <div class="w-full max-w-[800px] max-h-[calc(100vh-300px)]" style="aspect-ratio: 1.6;">
                <video @ended="onEnded" :key="videoSrc" ref="refVideoEl" class="w-full h-auto rounded-2xl border-2 border-black"  autoplay controls>
                    <source :src="videoSrc" type="video/mp4">
                </video>
            </div>
        </div>
    </gb-popup>
</template>

<style scoped>
.section-icon {
  @apply bg-gray-600 text-white;
}

.section-icon[data-active="true"] {
  @apply bg-ocean text-black;
}
</style>