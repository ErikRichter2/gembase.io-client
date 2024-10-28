<script setup lang="ts">

import GbWindow from "@/views/ui/popups/GbWindow.vue";

const visibility = defineModel<boolean | undefined>({default: undefined});

defineProps<{
    transparentBg?: boolean;
    hideClose?: boolean;
    header?: string;
    closeId?: string;
    relative?: boolean;
    inner?: boolean;
    type?: string;
}>();

const emits = defineEmits<{
    (event: "close")
}>();

function onClose() {
    if (visibility.value !== undefined) {
        visibility.value = false;
    }
    emits("close");
}
</script>

<template>
    <template v-if="visibility === undefined || visibility">
        <gb-window @close="onClose" :type="type" :inner="inner" :fixed="relative !== true" :prevent-route-back="true" :close-id="closeId" :header="header" :hide-close="hideClose" :hide-bg="transparentBg" :black-bg="transparentBg !== true">
            <slot></slot>
        </gb-window>
    </template>
</template>
