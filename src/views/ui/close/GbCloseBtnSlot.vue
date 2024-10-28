<script setup lang="ts">

import {ref} from "vue";
import GbCloseElement from "@/views/ui/close/GbCloseElement.vue";

const isMouseOver = ref(false);
const isRemoveMouseOver = ref(false);

const emits = defineEmits<{
    (event: 'close')
}>();

</script>

<template>
    <div @mouseenter="isMouseOver = true" @mouseleave="() => {if (isRemoveMouseOver === false) isMouseOver = false}" class="relative cursor-default">
        <slot></slot>
        <div @click="emits('close')" class="absolute w-[15px] h-[15px] top-[3px] right-[5px]">
            <gb-close-element v-if="isMouseOver" @mouseenter="isRemoveMouseOver = true" @mouseleave="isRemoveMouseOver = false"></gb-close-element>
        </div>
    </div>
</template>

<style scoped>

</style>