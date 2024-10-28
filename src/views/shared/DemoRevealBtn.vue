<script setup lang="ts">

import {RoutesEnum} from "@/router/RoutesEnum";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import {useRouterStore} from "@/core/router/RouterStore";
</script>

<template>
    <router-link :to="useRouterStore().getRoutePath(RoutesEnum.PORTAL_BILLING)">
        <gb-button class="gbc-bg-primary" text="Reveal" icon="unlocked"></gb-button>
    </router-link>
</template>
