<template>
    <div class="w-full h-full">
        <div class="gb-layout-tl-row text-[0.8em] flex-wrap gap-2 bg-night-violet-dark ">
            <router-link :to="useRouterStore().getRoutePath(RoutesEnum.ACCOUNT_ADMIN_GOOGLE_SHEETS)" class="gb-nav-item" active-class="active">
                Google Sheets
            </router-link>
            <router-link :to="useRouterStore().getRoutePath(RoutesEnum.ACCOUNT_ADMIN_USERS)" class="gb-nav-item" active-class="active">
                Users
            </router-link>
            <router-link :to="useRouterStore().getRoutePath(RoutesEnum.ACCOUNT_ADMIN_EMAIL_COMPOSER)" class="gb-nav-item" active-class="active">
                Email composer
            </router-link>
            <router-link :to="useRouterStore().getRoutePath(RoutesEnum.ACCOUNT_ADMIN_CHANGE_DEVELOPER)" class="gb-nav-item" active-class="active">
                Change developer
            </router-link>
            <router-link :to="useRouterStore().getRoutePath(RoutesEnum.ACCOUNT_ADMIN_TEST_PAYMENTS)" class="gb-nav-item" active-class="active">
                Test payments
            </router-link>
            <router-link :to="useRouterStore().getRoutePath(RoutesEnum.ACCOUNT_ADMIN_REQUESTED_APP_TAGS_CHANGES)" class="gb-nav-item" active-class="active">
                App labels changes
            </router-link>
            <div @click="useTutorialStore().commandReset()" class="gb-nav-item cursor-pointer">
                Reset tutorial
            </div>
            <div @click="useAuthStore().hideAdmin()" class="gb-nav-item cursor-pointer">
                Hide admin
            </div>
            <router-link :to="useRouterStore().getRoutePath(RoutesEnum.ACCOUNT_ADMIN_REBUILD_PLATFORM_VALUES)" class="gb-nav-item" active-class="active">
                Rebuild platform values
            </router-link>
        </div>
        <router-view></router-view>
    </div>
</template>

<script setup lang="ts">
import {RoutesEnum} from "@/router/RoutesEnum";
import {useTutorialStore} from "@/models/portal/tutorial/TutorialStore";
import {useAuthStore} from "@/models/auth/AuthStore";
import {useRouterStore} from "@/core/router/RouterStore";
</script>

<style scoped>
.gb-nav-item {
  @apply bg-dark-blue pl-2 pr-2 pt-1 pb-1;
}

.gb-nav-item:hover {
  @apply rounded-md;
}

.gb-nav-item.active {
  @apply bg-violet rounded-md;
}
</style>
