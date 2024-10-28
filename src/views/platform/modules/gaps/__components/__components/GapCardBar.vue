<script setup lang="ts">

import GbSvg from "@/views/ui/icons/GbSvg.vue";
import {TsColor} from "@/models/portal/calc/PlatformCalcData";

defineProps<{
    icon: string;
    color: TsColor;
    text: string;
    ratio: number;
}>();
</script>

<template>
    <div class="w-[35px] h-full bg-black rounded-2xl border-black border-2">
        <div class="gbc-bg-ts-bar gb2-mask w-full h-full rounded-2xl gb-layout relative" :data-color="color">
            <div class="w-full bg-black absolute top-0" :style="{height: `${100 - ratio}%`}" ></div>
            <div class="relative z-50 rotate-[270deg]">{{text}}</div>
        </div>
    </div>
    <gb-svg class="h-[16px] w-auto" :icon="icon"></gb-svg>
</template>
