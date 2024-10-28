<script setup lang="ts">

import {RoutesEnum} from "@/router/RoutesEnum";
import {LocationQueryRaw} from "vue-router";
import PortalUiRouterLink from "@/views/ui/router/PortalUiRouterLink.vue";
import GbButton from "@/views/ui/buttons/GbButton.vue";

defineProps<{
    query: LocationQueryRaw,
    demo?: boolean
}>();

</script>

<template>
    <portal-ui-router-link :to="{name: RoutesEnum.PORTAL_GAMES, query: query}">
        <gb-button class="gbc-bg-primary" :show-glow="true" tooltip="Compare games" icon="games"></gb-button>
    </portal-ui-router-link>
</template>
