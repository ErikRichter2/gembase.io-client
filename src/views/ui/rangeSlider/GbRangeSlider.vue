<template>
    <div class="gb-layout w-full relative h-[20px]">
        <label class="absolute top-[-19px] w-full text-center pl-3">{{ getLabel() }}</label>
        <div ref="slider_container" class="w-full relative top-[-1px]"></div>
    </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import noUiSlider from 'nouislider'
import {RangeSliderData} from "@/models/ui/RangeSliderData";

const slider_container = ref<HTMLElement>();

defineExpose({
  slider_container
});

const props = defineProps<{
    inputData?: RangeSliderData,
    label?: string,
    customLabel?: string
}>();

const emit = defineEmits<{
  (event: 'onChange', values: {from: number, to: number}): void,
}>();

onMounted(() => {
  if (props.inputData !== undefined) {

    const slider = noUiSlider.create(slider_container.value as HTMLElement, {
      cssPrefix: "dataset-range-slider-",
      start: [
        props.inputData.from,
        props.inputData.to
      ],
      connect: true,
      range: {
        "min": props.inputData.min,
        "max": props.inputData.max
      }
    });

    slider.on("update", (values, handle) => {
      if (props.inputData !== undefined) {

        const parseCustom = function(value: string | number): number {
          if (typeof value === "string") {
            return parseFloat(value as string);
          }
          return value as number;
        }

        let updateValues = {
          from: props.inputData.from,
          to: props.inputData.to
        };

        if (handle) {
          updateValues.to = Math.round(parseCustom(values[handle]));
        } else {
          updateValues.from = Math.round(parseCustom(values[handle]));
        }
        emit('onChange', updateValues);
      }
    });
  }
});

function getLabel(): string {
    if (props.customLabel !== undefined) {
        return props.customLabel;
    }
  if (props.inputData !== undefined && props.label !== undefined) {
    return props.label + ": " + props.inputData.from + " ... " + props.inputData.to;
  }
  return "";
}
</script>

<style>
/* Functional styling;
 * These styles are required for noUiSlider to function.
 * You don't need to change these rules to apply your design.
 */
.dataset-range-slider-target,
.dataset-range-slider-target * {
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: rgba(0 0 0 / 0%);
  user-select: none;
  touch-action: none;
  box-sizing: border-box;
}

.dataset-range-slider-target {
  @apply relative bg-violet-gray border-0 border-gray-800;
}

.dataset-range-slider-base,
.dataset-range-slider-connects {
  @apply w-full h-full relative z-[1];
}

/* Wrapper for all connect elements.
 */
.dataset-range-slider-connects {
  @apply overflow-hidden z-[0] rounded-full;
}

.dataset-range-slider-connect {
  @apply !bg-orange;
}

.dataset-range-slider-connect,
.dataset-range-slider-origin {
  @apply absolute z-[1] top-0 right-0 w-full h-full;

  will-change: transform;
  transform-origin: 0 0;
  transform-style: flat;
}

/* Give origins 0 height/width so they don't interfere with clicking the
 * connect elements.
 */
.dataset-range-slider-vertical .dataset-range-slider-origin {
  @apply top-[-100%] w-0;
}

.dataset-range-slider-horizontal .dataset-range-slider-origin {
  @apply h-0;
}

.dataset-range-slider-state-tap .dataset-range-slider-connect,
.dataset-range-slider-state-tap .dataset-range-slider-origin {
  transition: transform 0.3s;
}

/* Offset direction
 */
.dataset-range-slider-txt-dir-rtl.dataset-range-slider-horizontal .dataset-range-slider-origin {
  @apply left-0 right-auto;
}

.dataset-range-slider-handle {
  @apply absolute border-0 !bg-orange cursor-default;

  backface-visibility: hidden;
  box-shadow: inset 0 0 1px #fff, inset 0 1px 7px #ebebeb, 0 3px 6px -3px #bbb;
}

.dataset-range-slider-touch-area {
  @apply w-full h-full;
}

.dataset-range-slider-state-drag * {
  cursor: inherit !important;
}

/* Slider size and handle placement;
 */
.dataset-range-slider-horizontal {
  @apply !h-[5px];
}

.dataset-range-slider-horizontal .dataset-range-slider-handle {
  @apply !w-[18px] !h-[18px] right-[-17px] !top-[-7px] !border-0 rounded-circle outline-none;
}

.dataset-range-slider-vertical {
  width: 18px;
}

.dataset-range-slider-vertical .dataset-range-slider-handle {
  width: 28px;
  height: 34px;
  right: -6px;
  bottom: -17px;
}

.dataset-range-slider-target .dataset-range-slider-handle {
  box-shadow: none;
}

[disabled].dataset-range-slider-target,
[disabled].dataset-range-slider-handle,
[disabled] .dataset-range-slider-handle {
  cursor: not-allowed;
}

.dataset-range-slider-txt-dir-rtl.dataset-range-slider-horizontal .dataset-range-slider-handle {
  left: -17px;
  right: auto;
}

/* Handles and cursors;
 */
.dataset-range-slider-draggable {
  cursor: ew-resize;
}

.dataset-range-slider-vertical .dataset-range-slider-draggable {
  cursor: ns-resize;
}

.dataset-range-slider-active {
  box-shadow: inset 0 0 1px #fff, inset 0 1px 7px #ddd, 0 3px 6px -3px #bbb;
}

.dataset-range-slider-vertical .dataset-range-slider-handle::before,
.dataset-range-slider-vertical .dataset-range-slider-handle::after {
  width: 14px;
  height: 1px;
  left: 6px;
  top: 14px;
}

.dataset-range-slider-vertical .dataset-range-slider-handle::after {
  top: 17px;
}

/* Disabled state;
 */
[disabled] .dataset-range-slider-connect {
  background: #b8b8b8;
}

/* Base;
 *
 */
.dataset-range-slider-pips,
.dataset-range-slider-pips * {
  box-sizing: border-box;
}

.dataset-range-slider-pips {
  position: absolute;
  color: #999;
}

/* Values;
 *
 */
.dataset-range-slider-value {
  position: absolute;
  white-space: nowrap;
  text-align: center;
}

.dataset-range-slider-value-sub {
  color: #ccc;
  font-size: 10px;
}

/* Markings;
 *
 */
.dataset-range-slider-marker {
  position: absolute;
  background: #ccc;
}

.dataset-range-slider-marker-sub {
  background: #aaa;
}

.dataset-range-slider-marker-large {
  background: #aaa;
}

/* Horizontal layout;
 *
 */
.dataset-range-slider-pips-horizontal {
  padding: 10px 0;
  height: 80px;
  top: 100%;
  left: 0;
  width: 100%;
}

.dataset-range-slider-value-horizontal {
  transform: translate(-50%, 50%);
}

.dataset-range-slider-rtl .dataset-range-slider-value-horizontal {
  transform: translate(50%, 50%);
}

.dataset-range-slider-marker-horizontal.dataset-range-slider-marker {
  margin-left: -1px;
  width: 2px;
  height: 5px;
}

.dataset-range-slider-marker-horizontal.dataset-range-slider-marker-sub {
  height: 10px;
}

.dataset-range-slider-marker-horizontal.dataset-range-slider-marker-large {
  height: 15px;
}

/* Vertical layout;
 *
 */
.dataset-range-slider-pips-vertical {
  padding: 0 10px;
  height: 100%;
  top: 0;
  left: 100%;
}

.dataset-range-slider-value-vertical {
  transform: translate(0, -50%);
  padding-left: 25px;
}

.dataset-range-slider-rtl .dataset-range-slider-value-vertical {
  transform: translate(0, 50%);
}

.dataset-range-slider-marker-vertical.dataset-range-slider-marker {
  width: 5px;
  height: 2px;
  margin-top: -1px;
}

.dataset-range-slider-marker-vertical.dataset-range-slider-marker-sub {
  width: 10px;
}

.dataset-range-slider-marker-vertical.dataset-range-slider-marker-large {
  width: 15px;
}

.dataset-range-slider-tooltip {
  display: block;
  position: absolute;
  border: 1px solid #d9d9d9;
  border-radius: 3px;
  background: #fff;
  color: #000;
  padding: 5px;
  text-align: center;
  white-space: nowrap;
}

.dataset-range-slider-horizontal .dataset-range-slider-tooltip {
  transform: translate(-50%, 0);
  left: 50%;
  bottom: 120%;
}

.dataset-range-slider-vertical .dataset-range-slider-tooltip {
  transform: translate(0, -50%);
  top: 50%;
  right: 120%;
}

.dataset-range-slider-horizontal .dataset-range-slider-origin > .dataset-range-slider-tooltip {
  transform: translate(50%, 0);
  left: auto;
  bottom: 10px;
}

.dataset-range-slider-vertical .dataset-range-slider-origin > .dataset-range-slider-tooltip {
  transform: translate(0, -18px);
  top: auto;
  right: 28px;
}
</style>
