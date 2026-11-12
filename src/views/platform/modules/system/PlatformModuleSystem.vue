<template>
    <header-element :logo-route="HOME_ROUTES.HOME_INDEX"></header-element>
    <div class="gb-layout gb-layout-full">
        <router-view></router-view>
        <router-link :to="PORTAL_ROUTES.PORTAL_INDEX">
            <gb-button class="gbc-bg-primary" text="Return home"></gb-button>
        </router-link>
    </div>
</template>

<script setup lang="ts">
import HeaderElement from '@/views/platform/__components/HeaderElement.vue'
import GbButton from '@/views/ui/buttons/GbButton.vue'
import { PORTAL_ROUTES } from '@/router/routes/PortalRoutes'
import { HOME_ROUTES } from '@/router/routes/HomeRoutes'
</script>
