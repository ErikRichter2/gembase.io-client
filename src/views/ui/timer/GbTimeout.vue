<script setup lang="ts">
import {ref, watch} from "vue";

const props = defineProps<{
    request?: number,
    duration?: number
}>();

let timer = 0;

const visible = ref(false);

watch(() => props.request, () => {
    visible.value = true;
    window.clearTimeout(timer);
    const d = props.duration !== undefined ? props.duration : 1000;
    timer = window.setTimeout(() => visible.value = false, d);
});

</script>

<template>
    <div v-if="visible">
        <slot></slot>
    </div>
</template>
