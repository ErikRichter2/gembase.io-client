<script setup lang="ts">
import {computed, ref, watch} from "vue";

const props = defineProps<{
    text: string,
    show: number,
    duration?: number
}>();

const tooltipState = ref(0);
let timer = 0;

watch(() => props.show, () => {
    tooltipState.value = 1;
    window.clearTimeout(timer);
    const d = props.duration !== undefined ? props.duration : 1000;
    timer = window.setTimeout(() => {
        tooltipState.value = 2;
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
            tooltipState.value = 0;
        }, 1000);
    }, d);
});

const isVisible = computed(() => {
    return tooltipState.value === 1 || tooltipState.value === 2;
});

</script>

<template>
    <div v-if="isVisible" class="absolute gb-layout w-full pointer-events-none bottom-[30px]">
        <div class="gbc-bg-secondary text-[14px] rounded-full p-2 pl-4 pr-4 tooltip-state whitespace-nowrap" :data-state="tooltipState">
            {{text}}
        </div>
    </div>
</template>

<style scoped>
.tooltip-state {
  opacity: 0;
}

.tooltip-state[data-state="1"] {
  opacity: 1;
}

.tooltip-state[data-state="2"] {
  opacity: 0;
  transition: 1s;
}
</style>