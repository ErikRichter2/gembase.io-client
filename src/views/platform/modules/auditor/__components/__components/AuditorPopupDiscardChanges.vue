<script setup lang="ts">
import GbButton from "@/views/ui/buttons/GbButton.vue";

const emits = defineEmits<{
    (event: "confirm");
}>();
</script>

<template>
    <div class="gb-layout-tl gap-2 w-[500px]">
        <div>
            <gb-button @click="emits('confirm')" class="gbc-bg-primary" text="Confirm"></gb-button>
        </div>
    </div>
</template>

<style scoped>

</style>