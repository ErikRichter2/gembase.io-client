<script setup lang="ts">

import GembaseUiAppsInput from "@/views/ui/GembaseUiAppsInput.vue";
import {StoreAppSearch} from "@/models/portal/PortalDataTypes";

const emits = defineEmits<{
    (event: "confirm", value: StoreAppSearch)
}>();
</script>

<template>
    <div class="gb-layout-tl-row w-[400px] h-[30px]">
        <gembase-ui-apps-input class="w-full" @on-hint-selected="(x) => emits('confirm', x)" :placeholder="'Enter title ...'" :search-in-concepts="false"></gembase-ui-apps-input>
    </div>
</template>
