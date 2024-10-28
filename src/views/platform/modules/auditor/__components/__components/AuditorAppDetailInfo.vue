<script setup lang="ts">

import {AppDetailUtils} from "@/models/portal/apps/AppDetailUtils";
import {AppDetail, IAppImageSrc, TAppId} from "@/models/portal/apps/AppsData";
import {computed, ref} from "vue";
import PortalUiRevealBtn from "@/views/shared/DemoRevealBtn.vue";

export interface SelectedImage {
    appId: TAppId;
    src: IAppImageSrc;
}

const userSelectedImage = ref<SelectedImage>();
const mouseOverImage = ref<number>();

const props = defineProps<{
    appDetail?: AppDetail
}>();

const selectedImage = computed((): IAppImageSrc | undefined => {
    if (userSelectedImage.value !== undefined && userSelectedImage.value?.appId === props.appDetail?.app_id) {
        return userSelectedImage.value.src;
    }
    if (props.appDetail?.gallery !== undefined) {
        if (props.appDetail.gallery.length > 0) {
            return props.appDetail.gallery[0];
        }
    }
    return undefined;
});

function onSelectImage() {
    if (props.appDetail?.gallery !== undefined) {
        for (let i = 0; i < props.appDetail?.gallery.length; ++i) {
            if (props.appDetail?.gallery[i].id === mouseOverImage.value) {
                userSelectedImage.value = {
                    appId: props.appDetail.app_id,
                    src: props.appDetail?.gallery[i]
                }
                return;
            }
        }
    }
}
</script>

<template>
    <div v-if="appDetail?.locked" class="gb-layout-tc">
        <div>This section is not available in DEMO</div>
        <portal-ui-reveal-btn></portal-ui-reveal-btn>
    </div>
    <div v-else class="scoped-root gb-layout-tl-row w-full h-full gap-4 pr-4">
        <img v-if="selectedImage !== undefined" :src="AppDetailUtils.getAppImageSrc(selectedImage)" class="object-cover rounded-2xl min-w-[--selected-img-width] h-full border border-black">
        <div class="gb-layout-tl gap-2 h-full desc-content" :data-no-gallery="selectedImage === undefined">
            <div class="overflow-auto h-full desc-text pr-2" v-html="appDetail?.description"></div>
            <div v-if="appDetail?.gallery !== undefined" class="overflow-auto w-full h-[--gallery-size] min-h-[--gallery-size] max-h-[--gallery-size] pb-1">
                <div class="gb-layout-tl-row h-full gap-1">
                    <div v-for="image in appDetail?.gallery" :key="image.id" class="cursor-pointer h-full w-[--gallery-size] min-w-[--gallery-size] max-w-[--gallery-size]" @click="onSelectImage" @mouseenter="mouseOverImage = image.id" @mouseleave="mouseOverImage = undefined">
                        <img :src="AppDetailUtils.getAppImageSrc(image)" class="object-cover rounded-lg border border-black w-full h-full">
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.scoped-root {
  --selected-img-width: 350px;
  --gallery-size: 70px;
}

.desc-content {
  width: calc(100% - var(--selected-img-width));
}

.desc-content[data-no-gallery="true"] {
  width: 100%;
}

.desc-text {
  font-size: 13px;
  line-height: 20px;
  white-space: pre-wrap;
}
</style>
