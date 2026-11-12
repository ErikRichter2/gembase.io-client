<script setup lang="ts">
import router from '@/router'
import { PORTAL_ROUTES } from '@/router/routes/PortalRoutes'
import { onMounted } from 'vue'

onMounted(() => {
    if (router.currentRoute.value.path === PORTAL_ROUTES.PORTAL_ACCOUNT) {
        router.push(PORTAL_ROUTES.PORTAL_ACCOUNT_DETAILS)
    }
})
</script>

<template>
    <router-view></router-view>
</template>
