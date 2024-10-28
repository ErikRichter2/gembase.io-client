<script setup lang="ts">

import {DevDetail} from "@/models/portal/apps/AppsData";
import {DeveloperHint} from "@/models/portal/PortalDataTypes";
import GembaseUtils from "@/utils/GembaseUtils";
import EndpointRequest from "@/core/requests/EndpointRequest";
import {onMounted, ref} from "vue";
import GembaseUiInlineLoadingBarAnim from "@/views/ui/GembaseUiInlineLoadingBarAnim.vue";

const devTitle = ref("");
const hints = ref<Array<DeveloperHint>>([]);
const showLoading = ref(false);

let requestId = 0;

const props = defineProps<{
    devDetail: DevDetail,
    readonly?: boolean,
    title?: string
}>();

const emits = defineEmits<{
    (event: 'onChange', developerHint: DeveloperHint): void,
}>();

onMounted(() => {
    devTitle.value = props.devDetail.title;
});

function selectHint(hint: DeveloperHint) {
    emits("onChange", hint);
    devTitle.value = hint.title;
    hints.value.length = 0;
}

async function onChange() {
    if (props.readonly === true) {
        return;
    }
    requestId++;
    const localRequestId = requestId;
    await GembaseUtils.sleep(300);
    if (localRequestId !== requestId) {
        return;
    }

    showLoading.value = true;

    emits("onChange", {
        title: devTitle.value,
        dev_id_in_store: "",
        store: 0
    });

    const response = await EndpointRequest.process2<DeveloperHint[]>("portal:get_developers_hints", {
        title: devTitle.value
    });

    showLoading.value = false;

    if (localRequestId === requestId) {
        hints.value = response;
    }
}

</script>

<template>
    <div class="relative text-black w-full" :data-tooltip="title">
        <input class="gb-input" :data-has-hints="hints.length > 0" :data-readonly="readonly" :readonly="readonly" tabindex="0" @input="onChange" list="company-hints" v-model="devTitle">
        <div class="absolute right-[5px] top-[3px] h-[25px] w-[25px]">
            <gembase-ui-inline-loading-bar-anim :show="showLoading" :hide-bg="true"></gembase-ui-inline-loading-bar-anim>
        </div>
        <div v-if="hints.length > 0" @click="hints.length = 0" class="input-hints-fullscreen-bg"></div>
        <div v-if="hints.length > 0" class="input-hints">
            <template v-for="item in hints" :key="item.dev_id_in_store">
                <div @click="selectHint(item)">{{ item.title }}</div>
            </template>
        </div>
    </div>
</template>

<style scoped>
.gb-input {
  @apply pl-3 relative w-full;
}

.gb-input[data-has-hints="true"] {
  @apply z-[501];
}

.gb-input[data-readonly="true"] {
  @apply cursor-not-allowed bg-gray-600 text-white;
}

.input-hints {
  @apply absolute bg-gray-600 border-0 rounded-lg mt-[2px] gb-layout-tl gap-1 z-[501] text-black text-[0.8em] ml-5 w-[calc(auto-40px-10px)];
}

.input-hints div {
  @apply cursor-pointer pt-1 pb-1 pl-2 pr-2 border-0 rounded-md;
}

.input-hints div:hover {
  @apply bg-black/30;

  transition: 0.3s;
}
</style>
