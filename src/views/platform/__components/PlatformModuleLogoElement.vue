<script setup lang="ts">

import {EBillingModuleId, EModuleId, PortalConstants} from "@/models/portal/PortalConstants";
import {computed} from "vue";
import PortalUiSvg from "@/views/ui/svg/PortalUiSvg.vue";

const props = defineProps<{
    moduleId?: EModuleId;
    billingModuleId?: EBillingModuleId;
    icon?: string;
    label?: string;
    hideGembase?: boolean;
}>();

const finalIcon = computed(() => {
    if (props.moduleId !== undefined) {
        return PortalConstants.getModule(props.moduleId).icon;
    }
    if (props.billingModuleId !== undefined) {
        return PortalConstants.getBillingModule(props.billingModuleId).icon;
    }
    return props.icon;
});

const finalLabel = computed(() => {
    if (props.moduleId !== undefined) {
        return PortalConstants.getModule(props.moduleId).label.toUpperCase();
    }
    if (props.billingModuleId !== undefined) {
        return PortalConstants.getBillingModule(props.billingModuleId).title.toUpperCase();
    }
    return props.label;
});

</script>

<template>
    <div class="gb-ui-module-logo gb-layout-ml-row">
        <portal-ui-svg :icon="finalIcon" class="w-[30px] h-[30px]"></portal-ui-svg>
        <div class="gb-layout-tl leading-[0.6rem]">
            <portal-ui-svg v-if="hideGembase !== true" icon="gembase" class="pl-[2px] h-[11px]"></portal-ui-svg>
            <div class="font-bold text-[18px]">{{finalLabel}}</div>
        </div>
    </div>

</template>

<style>
.gb-ui-module-logo .gb-svg-icon {
  @apply gb-layout-tl;
}
</style>
