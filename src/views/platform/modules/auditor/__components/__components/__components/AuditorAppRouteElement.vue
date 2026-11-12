<script setup lang="ts">
import { type TAppId } from '@/models/portal/apps/AppsData'
import PortalUiRouterLink from '@/views/ui/router/PortalUiRouterLink.vue'
import GbButton from '@/views/ui/buttons/GbButton.vue'
import { PortalConstants } from '@/models/portal/PortalConstants'
import { PORTAL_ROUTES } from '@/router/routes/PortalRoutes'

const props = defineProps<{
    appId: TAppId
    demo?: boolean
}>()
</script>

<template>
    <div class="gb-layout-row gap-2">
        <portal-ui-router-link
            :disabled="demo"
            :path="PORTAL_ROUTES.PORTAL_MY_APPS"
            :query-records="{ appId: props.appId }"
        >
            <gb-button
                class="gbc-bg-primary"
                :show-glow="true"
                :demo="demo"
                tooltip="Show game details"
                :icon="PortalConstants.ICON_AUDITOR"
            ></gb-button>
        </portal-ui-router-link>
    </div>
</template>
