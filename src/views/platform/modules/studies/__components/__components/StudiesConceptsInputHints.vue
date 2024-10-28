<script setup lang="ts">

import {onMounted, ref} from "vue";
import GembaseUtils from "@/utils/GembaseUtils";
import GbButton from "@/views/ui/buttons/GbButton.vue";

const __selected = ref("");
const __hints = ref<string[]>([]);
const isMouseOverInput = ref(false);
const isMouseOverDelete = ref(false);

const props = defineProps<{
    selected: string,
    hints?: string[],
    placeholder?: string,
    readonly?: boolean,
    hideDelete?: boolean
}>();

const emits = defineEmits<{
    (event: 'onLabelChange', label: string): void,
    (event: 'onHintSelected', hint: string): void,
    (event: 'onDelete'): void,
}>();

onMounted(() => {
    if (props.selected !== undefined) {
        __selected.value = props.selected;
    }
});

function selectHint(hint: string) {
    __selected.value = hint;
    __hints.value.length = 0;
    emits("onHintSelected", hint);
}

async function onChange() {
    const arr: string[] = [];
    props.hints?.forEach((x) => {
        if (__selected.value === "" || x.toLowerCase().includes(__selected.value.toLocaleLowerCase())) {
            arr.push(x);
        }
    });
    __hints.value = arr;
}

async function onFocusOut() {
    await GembaseUtils.sleep(100);
    __hints.value.length = 0;
    if (props.selected !== __selected.value) {
        emits('onLabelChange', __selected.value);
    }
}

async function onInputKeyEnter() {
    __hints.value.length = 0;
    if (props.selected !== __selected.value) {
        emits('onLabelChange', __selected.value);
    }
}
</script>

<template>
    <div class="relative w-full text-black">
        <input :readonly="readonly" @mouseleave="isMouseOverInput = false" @mouseover="isMouseOverInput = true" @focusout="onFocusOut" v-on:keyup.enter="onInputKeyEnter" tabindex="0" class="relative w-full" :style="{zIndex: __hints.length > 0 ? '501' : 'auto'}" @input="onChange" list="company-hints" v-model="__selected" :placeholder="props.placeholder">
        <div v-if="!readonly && !hideDelete" @mouseover="isMouseOverDelete = true" @mouseleave="isMouseOverDelete = false" class="cursor-pointer absolute right-[5px] top-[3px] h-[25px] w-[30px]">
            <gb-button @click="emits('onDelete')" v-if="isMouseOverInput || isMouseOverDelete" class="gbc-bg-primary !w-full !h-full" icon="delete"></gb-button>
        </div>
        <div v-if="__hints.length > 0" @click="__hints.length = 0" class="input-hints-fullscreen-bg"></div>
        <div v-if="__hints.length > 0" class="input-hints">
            <template v-for="item in __hints" :key="item">
                <div class="gb-layout-ml-row relative">
                    <div @click="selectHint(item)" class="inset-0 absolute bg-transparent"></div>
                    <div>{{ item }}</div>
                </div>
            </template>
        </div>
    </div>
</template>

<style scoped>
.input-hints {
  @apply fixed border-0 rounded-lg mt-[2px] z-[501] max-h-[160px] w-auto ml-5 text-black text-[0.8em] font-normal overflow-auto;

  background: var(--gb-portal-ui-element-gradient-black-to-white);
}

.input-hints div {
  cursor: pointer;
  padding: 2px 10px;
  border: 0;
  border-radius: 8px;
}

.input-hints div:hover {
  @apply bg-black/30 duration-300;
}

.input-hints-fullscreen-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>

<style>
:root {
  --gb-gembase-ui-company-input-width: auto;
}
</style>