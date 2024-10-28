<script setup lang="ts">
import {computed} from "vue";

const props = defineProps<{
    src: string
}>();

const srcFinal = computed(() => {
    return `/static/media/${props.src}`;
});
</script>

<template>
    <img :src="srcFinal">
</template>
