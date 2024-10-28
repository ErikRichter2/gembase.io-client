<script setup lang="ts">

import {computed} from "vue";
import {TsColor} from "@/models/portal/calc/PlatformCalcData";
import GbSvg from "@/views/ui/icons/GbSvg.vue";

const props = defineProps<{
    type: "audience" | "ts" | "ci";
    color?: TsColor;
    text: string;
    bar1Width?: number;
    bar2Left?: number;
    selected?: boolean;
    readonly?: boolean;
    icon?: string;
    locked?: boolean;
    noData?: boolean;
    customLabel?: boolean;
}>();

const emits = defineEmits<{
    (event: "click")
}>();

const finalValue = computed(() => {
    if (props.locked) {
        return "?";
    }
    if (props.noData) {
        if (props.type === "ts") {
            return "0%";
        }
        return "ND";
    }
    return `${props.text}`;
});

const finalBar1Width = computed(() => {
    if (props.locked) {
        return undefined;
    }
    if (props.noData) {
        return undefined;
    }
    return props.bar1Width;
});

const finalBar2Left = computed(() => {
    if (props.locked) {
        return undefined;
    }
    if (props.noData) {
        return undefined;
    }
    return props.bar2Left;
});

function onClick() {
    if (props.readonly || props.noData) {
        return;
    }
    emits("click");
}

</script>

<template>
    <div class="gb-ts-component" @click="onClick" :data-selected="selected" :data-readonly="readonly || noData">
        <div class="relative w-full h-full gb2-mask rounded-inherit">
            <div v-if="bar1Width !== undefined" class="absolute z-[-1] left-0 h-full gbc-threat-score-fill" :data-type="type" :style="{width: `${finalBar1Width ?? 0}%`}"></div>
            <div v-if="bar2Left !== undefined" class="absolute z-[-1] w-[3px] h-full gbc-threat-score-fill" :data-type="type" :style="{left: `${finalBar2Left ?? 0}%`}"></div>
            <div v-if="customLabel" class="w-full h-full">
                <slot></slot>
            </div>
            <div v-else class="gb-layout-row w-full h-full gap-1">
                <gb-svg v-if="icon !== undefined" class="h-[70%] max-h-[20px] w-auto" :icon="icon"></gb-svg>
                <div class="gb-ts-component-txt-color" :data-color="props.color">
                    {{ finalValue }}
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.gb-ts-component {
  @apply bg-black border border-black rounded-full opacity-40 w-full h-full cursor-pointer;
}

.gb-ts-component:hover {
  @apply bg-gray-300 brightness-125;
}

.gb-ts-component[data-selected="true"] {
  @apply opacity-100;
}

.gb-ts-component[data-readonly="true"] {
  @apply cursor-default;
}

.gb-ts-component[data-readonly="true"]:hover {
  @apply bg-black brightness-100;
}

.gb-ts-component-txt-color {
  @apply data-[color="g"]:text-dim-ocean data-[color="r"]:text-dim-magenta;
}

.gbc-threat-score-fill {
  @apply data-[type="ts"]:bg-dim-magenta data-[type="audience"]:bg-dim-ocean data-[type="ci"]:bg-violet;
}
</style>