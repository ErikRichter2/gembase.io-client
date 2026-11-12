<script setup lang="ts">
import GbButton from '@/views/ui/buttons/GbButton.vue'
import { PORTAL_ROUTES } from '@/router/routes/PortalRoutes'
</script>

<template>
    <div class="gb-layout w-full h-full">
        <div class="gb-inner-window !p-7">
            <div class="gb-layout gap-5">
                <div class="text-[1.3em] font-bold">Coming soon …</div>
                <router-link :to="PORTAL_ROUTES.PORTAL_GUIDE">
                    <gb-button class="gbc-bg-primary" icon="home" text="Return home …"></gb-button>
                </router-link>
            </div>
        </div>
    </div>
</template>
