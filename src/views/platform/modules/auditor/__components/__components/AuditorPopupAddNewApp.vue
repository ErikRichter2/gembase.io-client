<script setup lang="ts">

import GbButton from "@/views/ui/buttons/GbButton.vue";
import {usePortalStore} from "@/models/portal/PortalStore";
import {computed} from "vue";

const portalStore = usePortalStore();

const props = defineProps<{
    title?: string
}>();

const emits = defineEmits<{
    (event: "confirm", concept: boolean)
}>();

</script>

<template>
    <div class="gb-layout-row gap-2">
        <div class="gb-layout-tc gap-1">
            <gb-button :show-glow="true" :demo="portalStore.isAuditorLocked() && portalStore.remainingConceptsToCreate() <= 0" @click="emits('confirm', true)" icon="generate_pool" text="Concept" class="gbc-bg-primary"></gb-button>
            <div v-if="portalStore.isAuditorLocked()" class="text-[0.6rem]" :class="portalStore.remainingConceptsToCreate() > 0 ? 'text-ocean': 'text-gray-600'">
                Remaining: {{portalStore.remainingConceptsToCreate()}}
            </div>
        </div>
        <div class="gb-layout-tc gap-1">
            <gb-button :show-glow="true" @click="emits('confirm', false)" icon="games" text="Live game" class="gbc-bg-primary"></gb-button>
        </div>
    </div>
</template>
