<script setup lang="ts">

import GbButton from "@/views/ui/buttons/GbButton.vue";
import {EModuleId, PortalConstants} from "@/models/portal/PortalConstants";
import {usePortalStore} from "@/models/portal/PortalStore";
import {computed} from "vue";

const portalStore = usePortalStore();

const props = defineProps<{
    moduleId: EModuleId;
    tooltip?: string;
    icon?: string;
    moduleIcon?: boolean;
    disabled?: boolean;
}>();

const finalDisabled = computed(() => {
    return props.disabled || portalStore.isModuleLocked(props.moduleId);
});

const finalIcon = computed(() => {
    if (props.moduleIcon) {
        return PortalConstants.getModule(props.moduleId).icon;
    }
    return props.icon;
})

</script>

<template>
    <gb-button :demo="portalStore.isDemo()" :disabled="finalDisabled" :icon="finalIcon" :tooltip="tooltip"></gb-button>
</template>
