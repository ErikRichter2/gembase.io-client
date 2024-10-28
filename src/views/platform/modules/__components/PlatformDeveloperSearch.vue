<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import {DeveloperHint} from "@/models/portal/PortalDataTypes";
import GembaseUtils from "@/utils/GembaseUtils";
import EndpointRequest from "@/core/requests/EndpointRequest";
import GbSvg from "@/views/ui/icons/GbSvg.vue";
import PortalUtils from "@/models/portal/PortalUtils";

const titleContent = ref("");
const hints = ref<DeveloperHint[]>([]);
const showLoading = ref(false);

const developerSearchInput = ref<HTMLInputElement>();

let requestId = 0;

const props = defineProps<{
    placeholder?: string;
    readonly?: boolean;
    title?: string;
    includeConcepts?: boolean;
    initialDev?: DeveloperHint;
    focus?: number;
}>();

const emits = defineEmits<{
    (event: 'onHintSelected', data: DeveloperHint): void,
}>();

watch(() => props.initialDev, () => {
    if (props.initialDev !== undefined) {
        titleContent.value = props.initialDev.title;
    }
});

watch(() => props.focus, () => {
   __focus();
});

onMounted(() => {
    if (props.initialDev !== undefined) {
        titleContent.value = props.initialDev.title;
    }
    __focus();
});

function selectHint(hint: DeveloperHint) {
    emits("onHintSelected", hint);
    titleContent.value = hint.title;
    hints.value.length = 0;
}

async function __focus() {
    if (props.focus !== undefined) {
        await GembaseUtils.sleep(300);
        developerSearchInput.value?.focus();
    }
}

async function onChange() {
    requestId++;
    const localRequestId = requestId;
    await GembaseUtils.sleep(300);
    if (localRequestId !== requestId) {
        return;
    }

    showLoading.value = true;

    const response = await EndpointRequest.process2<DeveloperHint[]>("portal:get_developers_hints", {
        title: titleContent.value,
        include_concepts: props.includeConcepts
    });

    showLoading.value = false;

    if (localRequestId === requestId) {
        hints.value = response;
    }
}
</script>

<template>
    <div class="relative text-black w-full h-full">
        <input ref="developerSearchInput" :placeholder="placeholder" :data-tooltip="title" :readonly="readonly" tabindex="0" class="h-full pl-3 relative w-full" :style="{cursor: readonly ? 'not-allowed' : 'default', zIndex: hints.length > 0 ? '501' : 'auto'}" @input="onChange" list="company-hints" v-model="titleContent">
        <div v-if="showLoading" class="absolute right-[5px] top-[3px] h-[25px] w-[25px]">
            <gb-svg class="gb2-loading-anim h-[80%]" icon="loading"></gb-svg>
        </div>
        <div v-if="hints.length > 0" @click="hints.length = 0" class="input-hints-fullscreen-bg"></div>
        <div v-if="hints.length > 0" class="input-hints">
            <div class="input-hint gb-layout-ml-row gap-2" v-for="item in hints" :key="item.dev_id_in_store">
                <gb-svg class="w-[15px] h-[15px]" :icon="PortalUtils.getStoreIcon(item.store)"></gb-svg>
                <div @click="selectHint(item)">{{ item.title }}</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.input-hints {
  @apply gb-layout-tl;

  position: absolute;
  background: var(--gb-portal-ui-element-gradient-black-to-white);
  border: 0;
  border-radius: 8px;
  margin-top: 2px;
  gap: 5px;
  z-index: 501;
  width: calc(var(--gb-gembase-ui-company-input-width) - 40px - 10px);
  color: black;
  font-size: 0.8em;
  margin-left: 20px;
}

.input-hints .input-hint {
  cursor: pointer;
  padding: 5px 10px;
  border: 0;
  border-radius: 8px;
}

.input-hints .input-hint:hover {
  @apply bg-black/30 duration-300;
}
</style>