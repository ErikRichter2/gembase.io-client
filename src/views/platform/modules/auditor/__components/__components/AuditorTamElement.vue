<script setup lang="ts">

import PortalUiAudience from "@/views/platform/modules/__components/PlatformAudienceElement.vue";
import GbSvg from "@/views/ui/icons/GbSvg.vue";
import {PortalConstants} from "@/models/portal/PortalConstants";
import GembaseUtils from "../../../../../../utils/GembaseUtils";
import {IPlatformCalcAudienceAngleStats} from "@/models/portal/calc/PlatformCalcData";
import PortalUiSvg from "@/views/ui/svg/PortalUiSvg.vue";

defineProps<{
    tam?: number,
    audience?: IPlatformCalcAudienceAngleStats,
    inactive?: boolean,
    readonly?: boolean,
    locked?: boolean,
    showIcon?: boolean,
    tooltip?: string
}>();

const emits = defineEmits<{
    (event: 'audience')
}>();

function onClick() {
    emits("audience");
}


</script>

<template>
    <div class="gb-layout-row gap-[2px] w-full h-full">
        <portal-ui-audience v-if="tam !== undefined" @click="onClick" :bars-ratio="0.6" :custom-label="true" :readonly="readonly" :audience="audience" :inactive="inactive" :locked="locked" data-tooltip="Total addressable market">
            <div class="gb-layout-m-between w-full h-full pr-3 pl-3 text-[0.9em]">
                <div class="gb-layout-ml-row h-full gap-1">
                    <portal-ui-svg class="h-[80%] w-auto" :icon="PortalConstants.ICON_PLAYERS"></portal-ui-svg>
                    <div class="gb-ts-component-txt-color">
                        {{GembaseUtils.formatNumber(audience?.total_audience)}}
                    </div>
                </div>
            </div>
        </portal-ui-audience>
        <div class="gb-layout-ml-row h-full text-[0.8em]">
            <gb-svg class="h-[50%] w-auto" :icon="PortalConstants.ICON_DOLLAR"></gb-svg>
            <div>{{ GembaseUtils.formatNumber(tam) }}</div>
        </div>
    </div>
</template>
