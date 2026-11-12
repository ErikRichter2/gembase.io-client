<script setup lang="ts">
import GapsSearch from '@/views/platform/modules/gaps/__components/GapsSearch.vue'
import GapsResults from '@/views/platform/modules/gaps/__components/GapsResults.vue'
import router from '@/router'
</script>

<template>
    <gaps-results v-if="router.currentRoute.value.query['show'] === 'results'"></gaps-results>
    <gaps-search v-else></gaps-search>
</template>
