<script setup lang="ts">
import GbButton from '@/views/ui/buttons/GbButton.vue'
import { useSessionStore } from '@/stores/SessionStore'
import { appEnv, EnvEnum } from '@/appEnv'

defineProps<{
    text: string
    hideOnProd?: boolean
}>()
</script>

<template>
    <gb-button
        v-if="useSessionStore().isAdmin && (hideOnProd !== true || appEnv.env !== EnvEnum.PROD)"
        class="gbc-bg-admin"
        :text="text"
    ></gb-button>
</template>
