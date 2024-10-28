<script setup lang="ts">

import {ITooltipThreatScoreData} from "@/models/portal/PortalDataTypes";
import GbSlotButton from "@/views/ui/buttons/GbSlotButton.vue";

const props = defineProps<{
    selected?: boolean;
    tsName: string;
    data?: ITooltipThreatScoreData;
}>();

</script>


<template>
    <gb-slot-button :data-selected="selected" class="gbc-bg-node relative gap-2">
        <div class="whitespace-nowrap text-[0.7em]">{{tsName}}</div>
        <div class="gb-layout-tl-row w-[25px] h-[9px] rounded-full gb2-mask relative">
            <div class="gb-layout-tl-row w-full h-full ml-[3px] mr-[3px]">
                <div v-for="item in data?.colors" :key="item.color" class="gb-ts-bar-bg gbc-bg-ts-bar h-full " :data-color="item.color" :style="{width: `${item.width}%`}"></div>
            </div>
            <div class="absolute w-full h-full rounded-full border-black border-[2px]"></div>
        </div>
    </gb-slot-button>
</template>

<style scoped>
.gb-ts-bar-bg {
  color: white;
  font-weight: normal;
}
</style>