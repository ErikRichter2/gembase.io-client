<script setup lang="ts">

import GbSvg from "@/views/ui/icons/GbSvg.vue";

const props = defineProps({
    show: Boolean
})

</script>

<template>
    <!-- LOADING INLINE POPUP >> -->
    <div v-if="props.show" class="absolute inset-0 gb-layout bg-black bg-opacity-50 rounded-inherit">
        <div class="gb-loading-dialog">
            <div class="gb-loading-dialog-message">
                <gb-svg class="gb2-loading-anim w-[30px] h-[30px]" icon="loading"></gb-svg>
                <div class="whitespace-nowrap">Loading ...</div>
            </div>
        </div>
    </div>
    <!-- << LOADING INLINE POPUP -->
</template>
