<script setup lang="ts">

import PortalUiRevealBtn from "@/views/shared/DemoRevealBtn.vue";
import GbPopup from "@/views/ui/popups/GbPopup.vue";

const demoTooltip = defineModel<boolean>({required: true});

function onClose() {
    demoTooltip.value = false;
}
</script>

<template>
    <gb-popup v-model="demoTooltip" @close="onClose">
        <div class="gb-layout gap-3 p-5 pt-7">
            <div>
                This section is not available in DEMO
            </div>
            <portal-ui-reveal-btn></portal-ui-reveal-btn>
        </div>
    </gb-popup>
</template>
