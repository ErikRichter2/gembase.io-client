<script setup lang="ts">

import GbWindow from "@/views/ui/popups/GbWindow.vue";
import RegisterByEmailBody from "@/views/shared/RegisterByEmailBody.vue";

const emits = defineEmits<{
    (event: "close")
}>();

</script>

<template>
    <gb-window @close="emits('close')" :hide-bg="true" :fixed="true" header="Please provide an email which gets access">
        <div class="w-full">
            <register-by-email-body></register-by-email-body>
        </div>
    </gb-window>
</template>
