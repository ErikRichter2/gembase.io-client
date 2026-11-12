<script setup lang="ts">
import { PORTAL_ROUTES } from '@/router/routes/PortalRoutes'
import GbButton from '@/views/ui/buttons/GbButton.vue'
</script>

<template>
    <router-link :to="PORTAL_ROUTES.PORTAL_BILLING">
        <gb-button class="gbc-bg-primary" text="Reveal" icon="unlocked"></gb-button>
    </router-link>
</template>
