<template>
    <gb-window
        header="You will be whitelisted soon …"
        :hide-bg="true"
        :fixed="true"
        :close-route="HOME_ROUTES.HOME_SIGN_IN"
    >
        <div class="gb-layout-ml gap-2">
            <div class="gb-inner-window">
                <div class="w-full max-w-[600px]">
                    Thank you for your interest in Gembase.io. We are starting up, so it takes us a
                    bit more time to complete a request. We will do our best to let you in ASAP.
                    Thank you for understanding.
                </div>
            </div>
        </div>
    </gb-window>
</template>

<script setup lang="ts">
import { HOME_ROUTES } from '@/router/routes/HomeRoutes'
import GbWindow from '@/views/ui/popups/GbWindow.vue'
</script>
