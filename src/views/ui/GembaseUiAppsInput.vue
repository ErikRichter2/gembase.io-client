<script setup lang="ts">

import {AppDetail, AppStoreEnum} from "@/models/portal/apps/AppsData";
import {StoreAppSearch} from "@/models/portal/PortalDataTypes";
import GembaseUtils from "@/utils/GembaseUtils";
import EndpointRequest from "@/core/requests/EndpointRequest";
import {onMounted, ref} from "vue";
import {AppDetailUtils} from "@/models/portal/apps/AppDetailUtils";
import GembaseUiInlineLoadingBarAnim from "@/views/ui/GembaseUiInlineLoadingBarAnim.vue";
import GbSvg from "@/views/ui/icons/GbSvg.vue";
import PortalUtils from "@/models/portal/PortalUtils";

const appTitle = ref("");
const hints = ref<Array<StoreAppSearch>>([]);
const showLoading = ref(false);

let requestId = 0;
let ignoreNextRequest = false;

const props = defineProps<{
    appDetail?: AppDetail,
    placeholder: string,
    searchInConcepts?: boolean,
    readonly?: boolean,
    title?: string,
    focusOut?: boolean
}>();

const emits = defineEmits<{
    (event: 'onTitleChange', title: string): void,
    (event: 'onHintSelected', storeAppSearch: StoreAppSearch): void,
}>();

onMounted(() => {
    if (props.appDetail !== undefined) {
        appTitle.value = props.appDetail.title;
    }
});

function selectHint(hint: StoreAppSearch) {
    if (hint.locked) {
        return;
    }
    emits("onHintSelected", hint);
    appTitle.value = hint.title;
    hints.value.length = 0;
}

async function onChange() {
    requestId++;
    const localRequestId = requestId;
    await GembaseUtils.sleep(300);
    if (localRequestId !== requestId) {
        return;
    }

    showLoading.value = true;
    emits("onTitleChange", appTitle.value);

    const response = await EndpointRequest.process2<StoreAppSearch[]>("portal:search_google_play_apps", {
        app_title: appTitle.value,
        search_in_concepts: props.searchInConcepts
    });

    showLoading.value = false;

    if (ignoreNextRequest) {
        ignoreNextRequest = false;
        return;
    }

    if (localRequestId === requestId) {
        hints.value = response;
    }
}

function onContextLost() {
    if (props.focusOut) {
        ignoreNextRequest = true;
    }
}
</script>

<template>
    <div class="relative w-full h-full text-black">
        <input :readonly="readonly" :data-tooltip="title" tabindex="0" class="relative w-full h-full data-[readonly='true']:cursor-not-allowed data-[hints='true']:z-[501]" :data-hints="hints.length > 0" @input="onChange" list="company-hints" @focusout="onContextLost" v-model="appTitle" :placeholder="props.placeholder">
        <div class="absolute right-[5px] top-[3px] h-[25px] w-[25px]">
            <gembase-ui-inline-loading-bar-anim class="z-[502]" :show="showLoading" :hide-bg="true" :w="20" :h="20" color="black"></gembase-ui-inline-loading-bar-anim>
        </div>
        <div v-if="hints.length > 0" @click="hints.length = 0" class="fixed inset-0"></div>
        <div v-if="hints.length > 0" class="input-hints">
            <template v-for="item in hints" :key="item.title">
                <div class="input-hint gb-layout-ml-row relative w-full" :data-locked="item.locked">
                    <div @click="selectHint(item)" class="absolute inset-0 bg-transparent"></div>
                    <div class="gb-layout-ml-row gap-1">
                        <img :src="AppDetailUtils.getIcon(item)" class="w-[20px] h-[20px]">
                        <div class="pr-2">{{ AppDetailUtils.getTitle(item) }}</div>
                        <gb-svg v-if="item.store !== AppStoreEnum.CONCEPT" :icon="PortalUtils.getStoreIcon(item.store)" class="w-[18px] h-[18px] text-black/50"></gb-svg>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<style scoped>
.input-hints {
  @apply absolute max-h-[160px] border-0 rounded-lg mt-[2px] gb-layout-tl z-[501] w-[calc(100%-40px-10px)] ml-5 text-black text-[0.8em] font-normal overflow-auto;

  background: var(--gb-portal-ui-element-gradient-black-to-white);
}

.input-hint {
  @apply cursor-pointer data-[locked="true"]:cursor-not-allowed pt-1 hover:bg-black/30 hover:duration-300 pb-1 pl-2 pr-2 rounded-md;
}
</style>

<style>
:root {
  --gb-gembase-ui-company-input-width: auto;
}
</style>