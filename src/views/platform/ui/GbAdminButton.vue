<script setup lang="ts">

import {useAuthStore} from "@/models/auth/AuthStore";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import AppConfig, {EnvEnum} from "@/config/AppConfig";

const authStore = useAuthStore();

defineProps<{
    text: string,
    hideOnProd?: boolean
}>();
</script>

<template>
    <gb-button v-if="authStore.isAdmin() && (hideOnProd !== true || AppConfig.env !== EnvEnum.PROD)" class="gbc-bg-admin" :text="text"></gb-button>
</template>
