<script setup lang="ts">
import {onMounted} from "vue";
import {RoutesEnum} from "@/router/RoutesEnum";
import {useRouterStore} from "@/core/router/RouterStore";

onMounted(() => {
    if (useRouterStore().isCurrentRoute(RoutesEnum.PORTAL_ACCOUNT)) {
        useRouterStore().to(RoutesEnum.PORTAL_ACCOUNT_DETAILS);
    }
});
</script>

<template>
    <router-view></router-view>
</template>
