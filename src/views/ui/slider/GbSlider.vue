<template>
  <div class="gb-slider-container relative h-[20px]">
    <label class="absolute top-[-20px] w-full text-center">{{ getLabel(inputData.value) }}</label>
    <input type="range" class="gb-slider gb-slider-input absolute top-[7px]"
           :min="inputData.min"
           :max="inputData.max"
           :value="inputData.value" @input="onInput($event)">
  </div>
</template>

<script setup lang="ts">

import {SliderData} from "@/models/ui/SliderData";

const props = defineProps<{
    inputData: SliderData,
    label?: string,
    labelProvider?: (value: number) => string
}>();

const emit = defineEmits<{
  (event: 'onChange', id: number): void,
}>();

function onInput(event) {
  emit('onChange', parseInt(event.target.value))
}

function getLabel(value: number): string {
  if (props.labelProvider !== undefined && props.labelProvider !== null) {
    return props.labelProvider(value);
  }
  if (props.label !== undefined) {
    return props.label;
  }
  return value.toString();
}
</script>

<style scoped>
.slider-input {
  opacity: 1 !important;
}

.gb-slider-container {
  width: 100%;
  padding-left: 0 !important;
}

.gb-slider-container .gb-slider {
  @apply appearance-none w-full h-[5px] bg-violet-gray outline-none opacity-100 !pl-0;
}

.gb-slider-container .gb-slider:hover {
  opacity: 1;
}

.gb-slider-container .gb-slider::-webkit-slider-thumb {
  @apply appearance-none w-[18px] h-[18px] bg-orange cursor-pointer rounded-circle;
}

.gb-slider-container .gb-slider::-moz-range-thumb {
  @apply appearance-none w-[18px] h-[18px] bg-orange cursor-pointer rounded-circle;
}
</style>