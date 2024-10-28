<script setup lang="ts">
import AppConfig from "@/config/AppConfig";
import {onMounted} from "vue";
import GembaseUtils from "@/utils/GembaseUtils";

const isActive = AppConfig.isProd || true;

const props = defineProps({
    height: Number
});

onMounted(() => {
    if (isActive) {
        GembaseUtils.loadScript("https://assets.calendly.com/assets/external/widget.js");
    }
});

</script>

<template>
    <div v-if="isActive" data-url="https://calendly.com/gembase/30min?primary_color=00f199" class="relative w-full h-full calendly-inline-widget">
    </div>
</template>
