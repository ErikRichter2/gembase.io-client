<template>
    <div class="absolute inset-0">
        <div v-if="portalStore.initialized" class="gb-view" :data-sidebar-maximized="portalStore.isSidebarOn()">
            <router-view></router-view>
        </div>
        <platform-layout-header></platform-layout-header>
        <invite-friend-popup v-model="portalStore.inviteFriendPopup"></invite-friend-popup>
        <introduction-video-popup v-model="tutorialStore.isIntroductionVideo"></introduction-video-popup>
        <tos-popup v-if="authStore.data.user.tos_agree_t === null"></tos-popup>
    </div>
</template>

<script setup lang="ts">
import {usePortalStore} from "@/models/portal/PortalStore";
import {onMounted} from "vue";
import InviteFriendPopup from "@/views/platform/__components/InviteFriendPopup.vue";
import IntroductionVideoPopup from "@/views/platform/__components/IntroductionVideoPopup.vue";
import {useTutorialStore} from "@/models/portal/tutorial/TutorialStore";
import TosPopup from "@/views/platform/__components/PlatformTosPopup.vue";
import {useAuthStore} from "@/models/auth/AuthStore";
import PlatformLayoutHeader from "@/views/platform/__components/PlatformLayoutHeader.vue";
import {initSmartsupp} from "@/models/external/smartsupp/Smartsupp";
import {initHeap} from "@/models/external/heap/Heap";
import {useFullscreenLoading} from "@/models/ui/FullscreenLoadingComposable";

const authStore = useAuthStore();
const portalStore = usePortalStore();
const tutorialStore = useTutorialStore();
const fullscreenLoading = useFullscreenLoading();

onMounted(async () => {
    fullscreenLoading.show();
    initSmartsupp();
    initHeap();
    await portalStore.init();
    fullscreenLoading.hide();
});
</script>

<style scoped>
  .gb-view {
    @apply absolute top-[var(--gb-ui-portal-header-h)] bottom-0 left-0 right-0;
  }

  .gb-view[data-sidebar-maximized="false"] {
    @apply left-0 duration-500;
  }

  .gb-view[data-sidebar-maximized="true"] {
    @apply left-[var(--gb-ui-portal-sidebar-w)] duration-500;
  }
</style>

<style>
body::before {
  background-image: var(--gb-background);
}
</style>
