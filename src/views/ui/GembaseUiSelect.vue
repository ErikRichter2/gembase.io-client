<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import {SelectOptionItem} from "@/views/ui/UiData";
import PortalUiRevealBtn from "@/views/shared/DemoRevealBtn.vue";
import GbSvg from "@/views/ui/icons/GbSvg.vue";

const optionsVisible = ref(false);
const selectedItemId = ref<string>();

const props = defineProps<{
    selected?: string,
    selectedIndex?: number,
    placeholder?: string,
    items?: SelectOptionItem[],
    readonly?: boolean,
    tooltip?: string,
    optionsWidth?: string;
    optionsIdPrefix?: string;
    showItemsSearchFilter?: boolean;
}>();

const selectedItem = computed((): SelectOptionItem | undefined => {
    if (props.items !== undefined) {
        for (let i = 0; i < props.items?.length; ++i) {
            if (props.items[i].id === selectedItemId.value) {
                return props.items[i];
            }
        }
    }

    return undefined;
});

onMounted(() => {
    if (selectedItemId.value === undefined && props.items !== undefined) {
        if (props.selected !== undefined) {
            selectedItemId.value = props.selected;
        } else if (props.selectedIndex !== undefined && props.items.length > props.selectedIndex) {
            selectedItemId.value = props.items[props.selectedIndex].id;
        }
    }
});

watch(() => props.selected, () => {
    if (props.selected !== undefined) {
        selectedItemId.value = props.selected;
    }
});

watch(() => props.selectedIndex, () => {
    if (props.items !== undefined && props.selectedIndex !== undefined && props.items.length > props.selectedIndex) {
        selectedItemId.value = props.items[props.selectedIndex].id;
    }
});
watch(() => props.items, () => {
    if (props.items !== undefined && props.selectedIndex !== undefined && props.items.length > props.selectedIndex) {
        selectedItemId.value = props.items[props.selectedIndex].id;
    }
});

function onOptionClick(item: SelectOptionItem) {
    if (item.notInteractive === true) {
        return;
    }
    selectedItemId.value = item.id;
    optionsVisible.value = false;
    emits("onChange", item);
}

const emits = defineEmits<{
    (event: 'onChange', item: SelectOptionItem): void,
}>();

const selectedText = computed(() => {
    const t = selectedItem;
    if (t.value !== undefined) {
        let prefix = "";
        if (t.value?.selectedPrefix !== undefined) {
            prefix = t.value?.selectedPrefix;
        }
        return `${prefix}${t.value?.value}`;
    }
    if (props.placeholder !== undefined) {
        return props.placeholder;
    }
    return "";
});

function getOptionId(index: number) {
    if (props.optionsIdPrefix !== undefined) {
        return `${props.optionsIdPrefix}__${index}`;
    }
    return undefined;
}

function getValueInList(item: SelectOptionItem) {
    if (item.valueInList !== undefined) {
        return item.valueInList;
    }
    return item.value;
}

const searchValue = ref("");

const finalItems = computed(() => {
    if (!props.showItemsSearchFilter) {
        return props.items;
    }

    const v = searchValue.value.toLowerCase().trim().replaceAll(" ", "");

    if (v === "") {
        return props.items;
    }

    const res: SelectOptionItem[] = [];

    props.items?.forEach((x) => {
        if (x.searchValue !== undefined) {
            if (x.searchValue.includes(v)) {
                res.push(x);
            }
        }
    });

    return res;
});

</script>

<template>
    <div class="gb-ui-select" :data-readonly="readonly" :data-tooltip="tooltip" :style="{cursor: readonly ? 'not-allowed' : 'default'}">
        <div v-if="optionsVisible" @click="optionsVisible = false" class="cursor-default z-[500] fixed inset-0">
        </div>
        <div class="gb-ui-select-selected whitespace-nowrap overflow-hidden w-full h-full rounded-inherit" tabindex="0" @click="optionsVisible = !optionsVisible && !readonly">
            <span class="w-full pl-2 pr-6" v-html="selectedText"></span>
        </div>
        <div class="gb-layout pointer-events-none absolute top-0 bottom-0 right-[10px]">
            <gb-svg class="w-[20px] h-[20px]" icon="expand_menu"></gb-svg>
        </div>
        <div v-if="optionsVisible" class="gb-ui-select-options z-[501]" :style="{width: optionsWidth !== undefined ? optionsWidth : 'inherit'}">
            <div v-if="showItemsSearchFilter" class="gb-layout-row w-full pt-1 pb-1">
                <gb-svg icon="search" class="h-[16px] w-auto"></gb-svg>
                <input placeholder="Search ..." v-model="searchValue" class="!h-[18px] !pl-2 !m-0">
            </div>
            <template v-for="(item, index) in finalItems" :key="item.id">
                <div v-if="item.showReveal !== undefined" class="gb-layout w-full pt-5 pb-2 gap-2">
                    <div class="text-xs">{{item.showReveal}}</div>
                    <portal-ui-reveal-btn></portal-ui-reveal-btn>
                </div>
                <div v-else @click="onOptionClick(item)" id="option" class="gb-layout-ml-row w-full" :data-not-interactive="item.notInteractive">
                    <span :id="getOptionId(index)" class="gb-ui-select-options-item" :data-select-item="item.cssData" v-html=getValueInList(item)></span>
                </div>
            </template>
        </div>
    </div>
</template>

<style scoped>
.gb-ui-select {
  @apply relative h-[30px] w-[var(--gb-ui-select-width)] bg-white rounded-2xl text-black cursor-pointer pl-2;
}

.gb-ui-select[data-readonly="true"] {
  @apply bg-gray-600;
}

.gb-ui-select-selected {
  @apply gb-layout-ml-row text-[0.8em];
}

.gb-ui-select-options {
  @apply absolute w-[calc(100%-15px)] max-h-[160px] leading-[14px] rounded-lg mt-[2px] gb-layout-tl z-[501] text-black text-[0.8em] overflow-auto;

  background: var(--gb-portal-ui-element-gradient-black-to-white);
}

.gb-ui-select-options #option {
  @apply cursor-pointer pl-2 pr-2 pt-1 pb-1 border-none rounded-lg;
}

.gb-ui-select-options #option[data-not-interactive="true"] {
  @apply cursor-default;
}

.gb-ui-select-options #option:hover {
  @apply bg-black/30 duration-300;
}

.gb-ui-select-options #option:hover[data-not-interactive="true"] {
  @apply bg-black/0 duration-0;
}

.gb-ui-select-options::-webkit-scrollbar {
  @apply w-[8px] rounded;
}

.gb-ui-select-options::-webkit-scrollbar-track {
  @apply bg-dark-blue bg-gradient-to-r from-white/10 to-white/0 rounded-sm;
}

.gb-ui-select-options::-webkit-scrollbar-thumb {
  @apply bg-dark-blue bg-gradient-to-r from-white/50 to-white/30 rounded-sm border border-black;
}
</style>


<style>
:root {
  --gb-ui-select-width: 300px;
}
</style>
