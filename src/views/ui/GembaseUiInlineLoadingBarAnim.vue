<script setup lang="ts">

import {computed} from "vue";
import GbSvg from "@/views/ui/icons/GbSvg.vue";

const props = defineProps({
    show: Boolean,
    hideBg: Boolean,
    w: Number,
    h: Number,
    color: String
})

const customStyle = computed(() => {
    let c = 'white';

    if (props.color !== undefined) {
        c = props.color;
    }

    let w = "90%";
    let h = "90%";

    if (props.w !== undefined) {
        w = `${props.w}px`
    }

    if (props.h !== undefined) {
        h = `${props.h}px`
    }

    return {
        width: w,
        height: h,
        maxWidth: "30px",
        maxHeight: "30px"
    }
});

</script>

<template>
    <!-- LOADING INLINE POPUP >> -->
    <div v-if="props.show" class="gb-layout-row absolute inset-0 rounded-inherit bg-black/50 data-[hide-bg='true']:bg-transparent" :data-hide-bg="props?.hideBg === true">
        <div class="gb-layout-row" :style="customStyle">
            <gb-svg class="gb2-loading-anim w-[90%] h-[90%]" icon="loading"></gb-svg>
        </div>
    </div>
    <!-- << LOADING INLINE POPUP -->
</template>
