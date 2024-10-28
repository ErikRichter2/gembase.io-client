<script setup lang="ts">

import {AppDetailUtils} from "@/models/portal/apps/AppDetailUtils";
import {IAppDetailHelper} from "@/models/portal/apps/AppsData";
import {PropType} from "vue";
import GbSvg from "@/views/ui/icons/GbSvg.vue";
import GbPopup from "@/views/ui/popups/GbPopup.vue";

const props = defineProps({
    app: Object as PropType<IAppDetailHelper>,
    progress: Number
});
</script>

<template>
    <gb-popup :hide-close="true" :inner="true" :relative="true">
        <div class="gb-layout-tl gap-2">
            <div class="gb-layout-row gap-2 pl-2">
                <gb-svg class="gb2-loading-anim w-[30px] h-[30px]" icon="loading"></gb-svg>
                <div>Analyzing product:</div>
            </div>
            <div class="gb-layout gap-2">
                <div class="gb-inner-window">
                    <div class="gb-layout-tl-row w-full min-w-[400px] gap-3">
                        <div v-if="props.app === undefined" class="text-[0.8em] text-gray-600">
                            Loading ...
                        </div>
                        <div v-else class="gb-layout-row gap-2">
                            <img :src="AppDetailUtils.getIcon(props.app)" class="rounded-lg border border-black max-w-[30px] max-h-[30px]">
                            <div class="text-[0.8em]">{{ AppDetailUtils.getTitle(props.app) }}</div>
                        </div>
                    </div>
                </div>
                <div class="gb-layout-ml-row w-[calc(100%-20px)] h-[6px] bg-black rounded-xl">
                    <div class="h-full bg-yellow rounded-full" :style="{width: `${progress}%`}">
                    </div>
                </div>
            </div>
        </div>
    </gb-popup>
</template>
