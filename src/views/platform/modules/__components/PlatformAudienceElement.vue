<script setup lang="ts">

import {computed} from "vue";
import {PortalConstants} from "@/models/portal/PortalConstants";
import {IPlatformCalcAudienceAngleStats} from "@/models/portal/calc/PlatformCalcData";
import GembaseUtils from "@/utils/GembaseUtils";
import AudienceTsButtonWithBars from "@/views/platform/modules/__components/__components/AudienceTsButtonWithBars.vue";

const props = defineProps<{
    audience?: IPlatformCalcAudienceAngleStats,
    inactive?: boolean,
    readonly?: boolean,
    locked?: boolean,
    showIcon?: boolean,
    tooltip?: string,
    customLabel?: boolean,
    barsRatio?: number
}>();

const emits = defineEmits<{
    (event: 'click')
}>();

function onClick() {
    emits("click");
}

const finalTooltip = computed(() => {
    if (props.audience?.no_data === true) {
        return "Not enough data to calculate";
    }
    if (props.tooltip !== undefined) {
        return props.tooltip;
    }
    return "Total addressable market";
});

const tamWidth = computed(() => {
    if (props.audience !== undefined) {
        let val = Math.round(100 * props.audience.total_audience_ratio);
        val *= 1.75;
        if (val >= 100) {
            val = 100;
        }
        val = Math.round(val);
        return val * (props.barsRatio ?? 1);
    }
    return 0;
});

const lovedLeft = computed(() => {
    if (props.audience !== undefined) {
        let val = Math.round(100 * props.audience.loved_ratio);
        val *= 1.75;
        if (val >= 92) {
            val = 92;
        }
        val = Math.round(val);
        return val * (props.barsRatio ?? 1);
    }
    return 0;
});

</script>

<template>
    <audience-ts-button-with-bars v-if="audience !== undefined" @click="onClick" :custom-label="customLabel" :icon="showIcon ? PortalConstants.ICON_PLAYERS : undefined" :type="'audience'" :bar1-width="tamWidth" :bar2-left="lovedLeft" :text="GembaseUtils.formatNumber(props.audience?.total_audience)" :data-tooltip="finalTooltip" :readonly="readonly" :data-selected="inactive !== true">
        <slot></slot>
    </audience-ts-button-with-bars>
</template>
