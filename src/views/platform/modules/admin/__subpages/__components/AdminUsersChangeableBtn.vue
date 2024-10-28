<script setup lang="ts">

import {ref} from "vue";
import GembaseUtils from "@/utils/GembaseUtils";

defineProps<{
    showDelete?: boolean;
}>();

const mouseDownTime = ref(0);

const emits = defineEmits<{
    (event: "click")
}>();

function onMouseUp() {
    const t = GembaseUtils.clientTimestamp();
    if (t - mouseDownTime.value <= 300) {
        emits("click");
    }
}
</script>

<template>
    <td class="relative" @mouseup="onMouseUp" @mousedown="mouseDownTime = GembaseUtils.clientTimestamp()">
        <slot></slot>
    </td>
</template>
