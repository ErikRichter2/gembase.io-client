<script setup lang="ts">

import GembaseUiWindowCloseBtn from "@/views/ui/GembaseUiWindowCloseBtn.vue";
import PortalUiRouterLink from "@/views/ui/router/PortalUiRouterLink.vue";
import GbWindowContainer from "@/views/ui/popups/GbWindowContainer.vue";

defineProps<{
    blackBg?: boolean;
    hideBg?: boolean;
    hideClose?: boolean;
    preventRouteBack?: boolean;
    closeRoute?: string;
    header?: string;
    closeId?: string;
    overrideClass?: string;
    fixed?: boolean;
    type?: string;
}>();

const emits = defineEmits<{
    (event: "close")
}>();

</script>

<template>
    <gb-window-container :fixed="fixed" :black-bg="blackBg" :hide-bg="hideBg">
        <div class="gb-window w-fit" :data-type="type">
            <portal-ui-router-link :disabled="closeRoute === undefined" :to="closeRoute">
                <gembase-ui-window-close-btn :id="closeId" v-if="hideClose !== true" :prevent-route-back="closeRoute === undefined && preventRouteBack === true" @click="emits('close');"></gembase-ui-window-close-btn>
            </portal-ui-router-link>
            <div v-if="header !== undefined" class="gb-ui-window-header">
                {{header}}
            </div>
            <slot></slot>
        </div>
    </gb-window-container>
</template>
