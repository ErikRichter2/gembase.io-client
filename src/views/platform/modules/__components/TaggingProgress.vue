<script setup lang="ts">

import GbSvg from "@/views/ui/icons/GbSvg.vue";

defineProps<{
    productNodesProgress?: number
}>();
</script>

<template>
    <div v-if="productNodesProgress !== undefined" class="gb-inner-window">
        <div class="gb-layout-ml-row gap-2 w-[150px]">
            <gb-svg class="w-[20px] h-[20px] gb2-loading-anim" icon="loading"></gb-svg>
            <div class="gb-layout-tl gap-1 w-full">
                <div class="text-[0.5rem]">Processing threats ...</div>
                <div class="w-full h-[6px]">
                    <div class="bg-black w-full h-full rounded gb2-mask">
                        <div class="h-full gbc-bg-primary rounded" :style="{width: `${productNodesProgress}%`}"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>