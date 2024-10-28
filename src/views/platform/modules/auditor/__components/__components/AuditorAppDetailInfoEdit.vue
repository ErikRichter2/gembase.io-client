<script setup lang="ts">

import {AppDetailUtils} from "@/models/portal/apps/AppDetailUtils";
import {
    AppDetailChanges,
    AppGalleryChanges,
} from "@/models/portal/PortalDataTypes";
import {ref} from "vue";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import GembaseUiWindowCloseBtn from "@/views/ui/GembaseUiWindowCloseBtn.vue";

const mouseOverImage = ref<number>();
const isRemoveMouseOver = ref(false);

const props = defineProps<{
    gallery?: AppGalleryChanges
}>();

const currentAppChanges = defineModel<AppDetailChanges>({required: true});

const emits = defineEmits<{
    (event: "onAddImage"),
    (event: "onRemoveImage", imageId: number)
}>();
</script>

<template>
    <div class="scoped-root gb-layout-tl h-full w-full gap-2">
        <textarea v-model="currentAppChanges.description" @input="currentAppChanges.wasChange = true" class="rounded p-2 h-full w-full" placeholder="Please enter as detailed description as possible so our AI can properly label your concept ..."></textarea>
        <div class="gb-layout-ml-row h-[--gallery-size] min-h-[--gallery-size] max-h-[--gallery-size]">
            <div v-if="gallery !== undefined" class="gb-layout-tl-row h-full gap-1 overflow-auto">
                <div v-for="image in gallery?.gallery" :key="image.id" @mouseenter="mouseOverImage = image.id" @mouseleave="() => {if (isRemoveMouseOver === false) mouseOverImage = undefined}">
                    <div class="relative h-full">
                        <img :src="AppDetailUtils.getAppImageSrc(image)" class="object-cover h-full cursor-pointer">
                        <gembase-ui-icon-close-btn class="!top-[calc(50%-33px)] !right-[3px]" v-if="mouseOverImage === image.id" @mouseenter="isRemoveMouseOver = true" @mouseleave="isRemoveMouseOver = false" @click="emits('onRemoveImage', mouseOverImage)"></gembase-ui-icon-close-btn>
                    </div>
                </div>
            </div>
            <gb-button @click="emits('onAddImage')" class="gbc-bg-primary !ml-[10px] !w-[50px]" icon="plus"></gb-button>
        </div>
    </div>
</template>

<style scoped>
.scoped-root {
  --gallery-size: 70px;
}
</style>
