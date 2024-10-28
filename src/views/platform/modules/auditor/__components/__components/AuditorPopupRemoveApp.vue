<script setup lang="ts">

import {AppDetailUtils} from "@/models/portal/apps/AppDetailUtils";
import {AppDetail} from "@/models/portal/apps/AppsData";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import GbSection from "@/views/ui/popups/GbSection.vue";

defineProps<{
    app: AppDetail
}>();

const emits = defineEmits<{
    (event: 'confirm')
}>();
</script>

<template>
    <div class="gb-layout-tl">
        <gb-section>
            <template #content>
                <div class="gb-layout-ml-row gap-2">
                    <img :src="AppDetailUtils.getIcon(app)" class="w-[70px] h-auto rounded-xl">
                    <div>{{ AppDetailUtils.getTitle(app) }}</div>
                </div>
            </template>
            <template #footer>
                <gb-button @click="emits('confirm')" text="Confirm" class="gbc-bg-primary"></gb-button>
            </template>
        </gb-section>
    </div>
</template>
