<script setup lang="ts">

import GbSvg from "@/views/ui/icons/GbSvg.vue";

const props = defineProps({
    expanded: {
        required: true,
        type: Boolean
    },
    text: String
});
</script>

<template>
    <div class="gb-layout-ml-row w-full">
        <gb-svg class="rotate-180 w-[30px] h-[20px]" v-if="!props.expanded" icon="expand_menu"></gb-svg>
        <gb-svg v-else icon="expand_menu" class="w-[30px] h-[20px]"></gb-svg>
        <span class="font-bUiUtils">{{props.text}}</span>
    </div>
</template>
