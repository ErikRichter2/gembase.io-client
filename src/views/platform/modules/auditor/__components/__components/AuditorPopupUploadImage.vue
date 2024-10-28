<script setup lang="ts">
import GbButton from "@/views/ui/buttons/GbButton.vue";

defineProps<{
    imageType?: string
}>();

const emits = defineEmits<{
    (event: 'change', e: Event, imageType?: string)
}>();


</script>

<template>
    <label for="file-upload">
        <gb-button text="Choose file" class="gbc-bg-primary mt-8"></gb-button>
    </label>
    <input id="file-upload" type="file" accept="image/*" @change="(x) => emits('change', x, imageType)">
</template>

<style scoped>
input[type="file"] {
  display: none;
}
</style>