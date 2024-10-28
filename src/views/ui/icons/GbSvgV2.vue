<script setup lang="ts">

import {computed} from "vue";
import InlineSvg from "vue-inline-svg";
import {UiUtils} from "@/utils/UiUtils";

const props = defineProps<{
    icon?: string,
    path?: string,
    src?: string,
    keepColors?: boolean
}>();

const finalSrc = computed((): string | undefined => {
    if (props.icon !== undefined) {
        return UiUtils.getIcon(props.icon);
    }
    if (props.src !== undefined) {
        return props.src;
    }
    return props.path;
})
</script>

<template>
    <inline-svg v-if="finalSrc !== undefined" class="gb-svg" :class="{'gb-ui-svg-current': keepColors !== true}" :src="finalSrc"></inline-svg>
</template>
