<template>
    <div class="gb-search-app-input gb-layout-ml-row gap-2 min-h-[35px]">
        <div v-if="props.hideTitle !== true" class="input-label">
            App:
        </div>
        <div class="relative width-[var(--gb-search-app-hint-width)]">
            <div class="gb-layout-ml-row gap-2 relative">
                <input class="h-[35px] rounded-full pl-3 pr-3" @input="onChange" :placeholder="props.inputPlaceholder" list="company-hints" :class="{'gb-color-err-anim': developerErr}" tabindex="1" v-model="inputField">
                <div v-if="loadingIcon" class="gb-app-search-loading-icon"></div>
                <div v-if="props.hideStores !== true">
                    <div class="gb-search-app-store-btn" @click="toggleStore(1)">
                        <gb-svg src="/static/media/gembase/platform/store/gp_logo.svg" class="w-[22px]"></gb-svg>
                        <div v-if="!isStore(1)" class="absolute inset-0 border-0 rounded bg-black opacity-70"></div>
                    </div>
                    <div class="gb-search-app-store-btn" @click="toggleStore(2)" >
                        <gb-svg src="/static/media/gembase/platform/store/steam_logo.svg" class="w-[22px]"></gb-svg>
                        <div v-if="!isStore(2)" class="absolute inset-0 border-0 rounded bg-black opacity-70"></div>
                    </div>
                </div>
            </div>
            <div v-if="filteredHints.length > 0" class="gb-search-app-input-hints right-0">
                <template v-for="item in filteredHints" :key="item.app_id_in_store">
                    <div class="gb-search-app-input-hints-div gb-layout-ml-row relative gap-1">
                        <div @click="selectHint(item)" class="inset-0 absolute bg-transparent"></div>
                        <img :src="item.icon" class="w-[25px] h-[25px] border-0 rounded">
                        <div>{{ item.title }}</div>
                        <div v-if="item.store != 0">
                            <gb-svg v-if="item.store === 1" :keep-colors="true" src="/static/media/gembase/ui/devices/google_play_store.com.svg" class="w-[18px] h-[18px]"></gb-svg>
                            <gb-svg v-if="item.store === 2" :keep-colors="true" src="/static/media/gembase/ui/devices/steam.svg" class="w-[18px] h-[18px]"></gb-svg>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import GembaseUtils from "@/utils/GembaseUtils";
import EndpointRequest from "@/core/requests/EndpointRequest";
import {ref} from "vue";
import {AppStoreEnum} from "@/models/portal/apps/AppsData";
import {StoreAppSearch} from "@/models/portal/PortalDataTypes";
import {usePortalStore} from "@/models/portal/PortalStore";
import GbSvg from "@/views/ui/icons/GbSvg.vue";
import {useFullscreenLoading} from "@/models/ui/FullscreenLoadingComposable";

const portalStore = usePortalStore();
const fullscreenLoading = useFullscreenLoading();

const appId = ref("");
const inputField = ref("");
const filteredHints = ref<Array<StoreAppSearch>>([]);
const developerErr = ref(false);
const loadingIcon = ref(false);

let requestId = 0;
let allHints: StoreAppSearch[] = [];

const props = defineProps({
    hideStores: Boolean,
    hideTitle: Boolean,
    inputPlaceholder: String,
    searchCommand: Function
});

const emit = defineEmits<{
    (event: 'onChange', appId: string, store: AppStoreEnum): void,
}>();

function isStore(storeId: number): boolean {
    //return portalStore.viewData.compareAppsStores?.includes(storeId);
    return true;
}

function toggleStore(storeId: number): void {
    // if (portalStore.viewData.compareAppsStores === undefined) {
    //     portalStore.viewData.compareAppsStores = [];
    // }
    // if (portalStore.viewData.compareAppsStores.includes(storeId)) {
    //     portalStore.viewData.compareAppsStores.splice(portalStore.viewData.compareAppsStores.indexOf(storeId), 1);
    // } else {
    //     portalStore.viewData.compareAppsStores.push(storeId);
    // }

    redrawHints();
}

async function selectHint(hint: StoreAppSearch) {
    fullscreenLoading.show();
    await portalStore.scrapApp(hint.app_id_in_store, hint.store);
    allHints.length = 0;
    filteredHints.value.length = 0;
    emit("onChange", hint.app_id_in_store, hint.store);
    fullscreenLoading.hide();
}

async function onChange() {
    requestId++;
    appId.value = "";
    const localRequestId = requestId;
    loadingIcon.value = true;
    await GembaseUtils.sleep(300);
    if (localRequestId !== requestId) {
        return;
    }
    if (props.searchCommand !== undefined) {
        allHints = await props.searchCommand(inputField.value);
        redrawHints();
    } else {
        const response = await EndpointRequest.process2<StoreAppSearch[]>("portal:search_google_play_apps", {
            app_title: inputField.value});
        if (localRequestId === requestId) {
            allHints = response;
            redrawHints();
        }
    }
}

function redrawHints() {
    const arr: StoreAppSearch[] = [];
    loadingIcon.value = false;

    // for (let i = 0; i < allHints.length; ++i) {
    //     if (portalStore.viewData.compareAppsStores === undefined) {
    //         arr.push(allHints[i]);
    //     } else if (portalStore.viewData.compareAppsStores.includes(allHints[i].store)) {
    //         arr.push(allHints[i]);
    //     }
    // }

    filteredHints.value = [...allHints];
}

</script>

<style>
:root {
  --gb-search-app-input-width: 350px;
  --gb-search-app-hint-width: 350px;
}

.gb-search-app-input input,
.gb-search-app-input select {
  width: var(--gb-search-app-input-width);
}

.gb-search-app-input-hints {
  @apply gb-layout-tl absolute bg-dark-blue border-0 rounded-lg mt-2 z-[5] w-full text-[0.8em];
}

.gb-search-app-input-hints-div {
  cursor: pointer;
  padding: 5px 10px;
  border: 0;
  border-radius: 8px;
  font-size: 0.7em;
  padding-right: 20px;
}

.gb-search-app-input-hints-div:hover {
  @apply bg-white/40 duration-300;
}

.gb-search-app-store-btn {
  @apply gb-layout bg-night-violet-dark rounded-md w-[35px] h-[35px] cursor-pointer relative;
}

.gb-app-search-loading-icon {
  content: "";
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  animation: 0.75s linear infinite gb-app-search-loading-icon-anim;
  border: 4px solid black;
  border-right-color: transparent;
  position: relative;
  right: 45px;
}

@keyframes gb-app-search-loading-icon-anim {
  to {
    transform: rotate(360deg);
  }
}

input::placeholder {
  font-weight: normal;
  opacity: 0.5;
  color: black;
  font-size: 0.8em;
}

</style>