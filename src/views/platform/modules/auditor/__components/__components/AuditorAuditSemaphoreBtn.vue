<script setup lang="ts">
const props = defineProps<{
    color?: string;
    name: string;
    selected?: boolean;
    interactive?: boolean;
    hideSemaphore?: boolean;
}>();

</script>

<template>
    <div :data-interactive="interactive === true ? true : null" :data-selected="selected" class="bg-dark-violet data-[selected='true']:bg-light-violet data-[selected='true']:gb-glow-magenta data-[selected='true']:gb-glow-size-lg rounded-full cursor-pointer p-2 pt-1 pb-1 gb-layout-row gap-1">
        <div class="whitespace-nowrap">{{name}}</div>
        <div v-if="hideSemaphore !== true" class="gbc-semaphore-icon" :data-color="color"></div>
    </div>
</template>
