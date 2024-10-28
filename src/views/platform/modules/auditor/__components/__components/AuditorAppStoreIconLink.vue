<script setup lang="ts">

import {AppDetailUtils} from "@/models/portal/apps/AppDetailUtils";
import {PropType} from "vue";
import {AppTypeEnum} from "@/models/portal/apps/AppsData";
import {IAppStoreButton} from "@/models/portal/PortalDataTypes";
import PortalUtils from "@/models/portal/PortalUtils";
import GbButton from "@/views/ui/buttons/GbButton.vue";

const props = defineProps({
    app: Object as PropType<IAppStoreButton>
});
</script>

<template>
    <div v-if="props.app !== undefined && props.app.app_type !== AppTypeEnum.CONCEPT && !props.app.locked" class="gb-layout-row gap-2">
        <a :href="AppDetailUtils.getAppStoreUrl(props.app)" target="_blank">
            <gb-button class="gbc-bg-primary" :show-glow="true" tooltip="Open in store" :icon="PortalUtils.getStoreIcon(props.app.store)"></gb-button>
        </a>
    </div>
</template>
