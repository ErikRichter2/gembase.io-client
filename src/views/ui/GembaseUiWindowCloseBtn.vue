<script setup lang="ts">

import GbButton from "@/views/ui/buttons/GbButton.vue";
import {useRouterStore} from "@/core/router/RouterStore";

const props = defineProps({
    preventRouteBack: Boolean,
});

const emits = defineEmits<{
    (event: 'onClose'): void,
}>();

</script>

<template>
    <div class="absolute top-[17px] right-[20px] w-[40px] h-[25px]">
        <gb-button v-if="props.preventRouteBack === false" icon="close" class="gbc-bg-secondary !w-full !h-full !pt-[3px] !pb-[3px]" @click="useRouterStore().back()"></gb-button>
        <gb-button v-else class="gbc-bg-secondary !w-full !h-full" icon="close" @click="emits('onClose')"></gb-button>
    </div>
</template>
