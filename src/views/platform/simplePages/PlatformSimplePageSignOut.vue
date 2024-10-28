<template>
    <div></div>
</template>

<script setup lang="ts">
import {onMounted} from "vue";
import {useAuthStore} from "@/models/auth/AuthStore";
import {useFullscreenLoading} from "@/models/ui/FullscreenLoadingComposable";

const fullscreenLoading = useFullscreenLoading();

onMounted(async () => {
    const authStore = useAuthStore();
    fullscreenLoading.show();
    await authStore.logout();
    fullscreenLoading.hide();
});
</script>
