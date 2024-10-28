<template>
    <header-element :logo-route="RoutesEnum.HOME_INDEX"></header-element>
    <div class="gb-layout gb-layout-full">
        <router-view></router-view>
        <router-link :to="useRouterStore().getRoutePath(RoutesEnum.PORTAL_GUIDE)">
            <gb-button class="gbc-bg-primary" text="Return home"></gb-button>
        </router-link>
    </div>
</template>

<script setup lang="ts">
import {RoutesEnum} from "@/router/RoutesEnum";
import HeaderElement from "@/views/platform/__components/HeaderElement.vue";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import {useRouterStore} from "@/core/router/RouterStore";
</script>
