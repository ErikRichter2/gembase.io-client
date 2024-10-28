<template>
    <auditor-audit v-if="useRouterStore().currentRoute.value.query.show === 'audit'"></auditor-audit>
    <auditor-apps v-else></auditor-apps>
</template>

<script setup lang="ts">
import AuditorApps from "@/views/platform/modules/auditor/__components/AuditorApps.vue";
import AuditorAudit from "@/views/platform/modules/auditor/__components/AuditorAudit.vue";
import {useRouterStore} from "@/core/router/RouterStore";
</script>
