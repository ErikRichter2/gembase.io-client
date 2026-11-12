<template>
    <div></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useFullscreenLoading } from '@/models/ui/FullscreenLoadingComposable'
import { useSessionStore } from '@/stores/SessionStore'

const fullscreenLoading = useFullscreenLoading()

onMounted(async () => {
    fullscreenLoading.show()
    await useSessionStore().logout()
    fullscreenLoading.hide()
})
</script>
