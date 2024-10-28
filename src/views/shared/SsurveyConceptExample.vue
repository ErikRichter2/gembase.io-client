<script setup lang="ts">

import {UiUtils} from "@/utils/UiUtils";
import {PortalConstants} from "@/models/portal/PortalConstants";
import {IConceptExample} from "@/models/portal/studies/StudiesData";
import GbSvg from "@/views/ui/icons/GbSvg.vue";

defineProps<{
    concept: IConceptExample,
    hideReload?: boolean,
    interactive?: boolean
}>();

const emits = defineEmits<{
    (event: "reload", data: IConceptExample)
}>();
</script>

<template>
    <div class="gb-bg-window gb-layout-row !p-2 !pl-3 !pr-3 !gap-2 rounded-xl h-[150px] w-[400px] relative data-[interactive]:cursor-pointer data-[interactive]:hover:brightness-125" :data-interactive="interactive">
        <div v-if="hideReload !== true" @click="emits('reload', concept)" class="absolute top-[5px] right-[10px] text-violet-gray cursor-pointer">
            <gb-svg :icon="PortalConstants.ICON_CARD_RELOAD" class="w-[30px] h-[30px]"></gb-svg>
        </div>
        <img :src="UiUtils.WipImage" class="border border-black h-[calc(100%-20px)] w-auto rounded">
        <div class="gb-layout-tl text-[0.8em]">
            <div class="font-bold text-[1.2em] pb-2">
                {{concept.title}}
            </div>
            <div class="text-[0.8em]">
                <div>
                    {{concept.desc}}
                </div>
                <div>
                    {{concept.f1}} {{concept.f2}}
                </div>
            </div>
        </div>
    </div>
</template>
