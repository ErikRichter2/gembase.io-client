<script setup lang="ts">

import GbButton from "@/views/ui/buttons/GbButton.vue";

const emits = defineEmits<{
    (event: 'onClose'): void,
}>();

</script>

<template>
    <div class="absolute w-[15px] h-[15px] top-0 right-0">
        <gb-button class="gbc-bg-secondary !w-full !h-full !p-[2px]" icon="close" @click="emits('onClose')"></gb-button>
    </div>
</template>
