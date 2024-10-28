<script setup lang="ts">

import {computed} from "vue";
import AudienceTsButtonWithBars from "@/views/platform/modules/__components/__components/AudienceTsButtonWithBars.vue";
import {TsColor} from "@/models/portal/calc/PlatformCalcData";
import {PortalConstants} from "@/models/portal/PortalConstants";

const props = defineProps<{
    threatScore?: number,
    formattedThreatScore?: string,
    unselected?: boolean,
    readonly?: boolean,
    locked?: boolean,
    showIcon?: boolean,
    noData?: boolean,
    color?: TsColor,
    singleVersion?: boolean;
    appTitle?: string;
    companyTitle?: string | null;
    strength?: boolean;
    total?: boolean;
    angle?: string;
}>();

const emits = defineEmits<{
    (event: 'click')
}>();

const finalValue = computed(() => {
    if (props.formattedThreatScore !== undefined) {
        return props.formattedThreatScore;
    }
    return `${props.threatScore}%`;
});

const finalTooltip = computed(() => {
    if (props.noData) {
        return "No competitors found for the node combination.";
    }

    if (props.appTitle !== undefined) {
        return `Competitive Index of ${props.appTitle}`;
    } else if (props.angle !== undefined) {
        return `Threat Score of ${props.angle} games`;
    } else if (props.total) {
        if (props.singleVersion) {
            return `total Competitive Index`;
        }
    } else if (props.strength) {
        if (props.singleVersion) {
            return `${finalValue.value} from total Competitive Index`;
        }
    } else {
        if (props.singleVersion) {
            return `${finalValue.value} to total Competitive Index`;
        }
    }

    return undefined;
});

</script>

<template>
    <audience-ts-button-with-bars v-if="threatScore !== undefined || formattedThreatScore !== undefined" @click="emits('click')" :icon="showIcon ? (singleVersion ? PortalConstants.ICON_COMPETITORS : PortalConstants.ICON_THREAT_SCORE) : undefined" :type="singleVersion ? 'ci' : 'ts'" :bar1-width="threatScore" :color="props.color" :text="finalValue" :data-tooltip="finalTooltip" :no-data="props.noData" :readonly="readonly" :data-selected="unselected !== true"></audience-ts-button-with-bars>
</template>
