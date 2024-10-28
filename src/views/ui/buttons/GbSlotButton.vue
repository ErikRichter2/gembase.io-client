<script setup lang="ts">

import {computed} from "vue";

const props = defineProps<{
    disabled?: boolean;
    tooltip?: string;
}>();

const emits = defineEmits<{
    (event: "click")
}>();

const notAllowed = computed((): boolean => {
    return props.disabled;
});

function onClick() {
    if (notAllowed.value) {
        return;
    }

    emits("click");
}

</script>

<template>
    <div @click="onClick" data-interactive :data-glow="true" :data-tooltip="tooltip" :data-na="notAllowed" class="gb-button">
        <slot></slot>
    </div>
</template>
