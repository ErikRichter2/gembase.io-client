<script setup lang="ts">

import {RoutesEnum} from "@/router/RoutesEnum";
import {TAppId} from "@/models/portal/apps/AppsData";
import PortalUiRouterLink from "@/views/ui/router/PortalUiRouterLink.vue";
import {AuditorQueryParams} from "@/models/portal/auditor/AuditorData";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import {PortalConstants} from "@/models/portal/PortalConstants";

const props = defineProps<{
    appId: TAppId,
    demo?: boolean
}>();
</script>

<template>
    <div class="gb-layout-row gap-2">
        <portal-ui-router-link :disabled="demo" :name="RoutesEnum.PORTAL_MY_APPS" :query="{appId: props.appId} as AuditorQueryParams">
            <gb-button class="gbc-bg-primary" :show-glow="true" :demo="demo" tooltip="Show game details" :icon="PortalConstants.ICON_AUDITOR"></gb-button>
        </portal-ui-router-link>
    </div>
</template>
