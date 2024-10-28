<script setup lang="ts">
import RegisterByEmailBody from "@/views/shared/RegisterByEmailBody.vue";
import GbPopup from "@/views/ui/popups/GbPopup.vue";
</script>

<template>
    <gb-popup header="Thank you for adding new account!">
        <register-by-email-body class="w-[700px]"></register-by-email-body>
    </gb-popup>
</template>
