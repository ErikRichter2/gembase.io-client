<script setup lang="ts">

import GbSvg from "@/views/ui/icons/GbSvg.vue";
import {computed, ref, watch} from "vue";
import PortalUtils from "@/models/portal/PortalUtils";
import GbTimeout from "@/views/ui/timer/GbTimeout.vue";
import GembaseUtils from "@/utils/GembaseUtils";

const props = defineProps<{
    icon?: string;
    text?: string;
    tooltip?: string;
    demo?: boolean;
    disabled?: boolean;
    inactive?: boolean;
    iconRight?: boolean;
    tooltipDemo?: string;
    semiTransparent?: boolean;
    showExclamation?: boolean;
    hideGlow?: boolean;
    bottomMessageRequest?: number;
    bottomMessage?: string;
    blinkAnim?: number;
}>();

const pulseAnim = ref(false);

const emits = defineEmits<{
    (event: "click")
}>();

const notAllowed = computed(() => {
    if (props.demo || props.disabled || props.inactive) {
        return true;
    }
    return false;
});

watch(() => props.blinkAnim, async () => {
    pulseAnim.value = true;
    await GembaseUtils.sleep(2000);
    pulseAnim.value = false;
});

const finalTooltip = computed(() => {
    if (props.demo && props.tooltipDemo !== undefined) {
        return props.tooltipDemo;
    } else if (props.tooltip !== undefined) {
        return PortalUtils.getTitle(props.tooltip, props.demo);
    } else if (props.text !== undefined && props.demo) {
        return PortalUtils.getTitle(props.text, props.demo);
    }
    return props.tooltip;
});

function onClick() {
    if (props.demo || props.disabled) {
        return;
    }

    emits("click");
}

</script>

<template>
    <div @click="onClick" class="gb-button" :data-pulse="pulseAnim" :style="{position: bottomMessage !== undefined ? 'relative' : 'static'}" data-interactive :data-glow="hideGlow !== true" :data-semi-transparent="semiTransparent" :data-tooltip="finalTooltip" :data-inactive="inactive" :data-na="notAllowed">
        <div class="w-full h-full gb-layout-row relative gap-1">
            <template v-if="iconRight">
                <div v-if="text !== undefined">{{text}}</div>
                <gb-svg v-if="icon !== undefined" :icon="icon" class="h-full w-auto"></gb-svg>
            </template>
            <template v-else>
                <gb-svg v-if="icon !== undefined" :icon="icon" class="h-full w-auto"></gb-svg>
                <div v-if="text !== undefined">{{text}}</div>
            </template>
            <div v-if="showExclamation" class="gb-exclamation-badge gb-pulse-animation top-[-7px] right-[-22px]"></div>
        </div>
        <div v-if="bottomMessage !== undefined" class="absolute w-full left-0 bottom-[-20px] gb-layout-row">
            <gb-timeout class="text-white text-[0.65rem]" :request="bottomMessageRequest" :duration="3000">
                {{ bottomMessage }}
            </gb-timeout>
        </div>
    </div>
</template>

<style scoped>
.gb-exclamation-badge {
  @apply absolute w-[20px] h-[20px] rounded-circle bg-white gb-layout text-black font-bold text-[0.9em];
}

.gb-exclamation-badge::after {
  @apply text-black;

  content: "!";
}

.gb-ui input[data-not-allowed="true"] {
  @apply cursor-not-allowed bg-gray-300 text-white;
}
</style>
