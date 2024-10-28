<script setup lang="ts">

import GbPopup from "@/views/ui/popups/GbPopup.vue";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import {onMounted, ref, watch} from "vue";
import {PortalConstants} from "@/models/portal/PortalConstants";
import {AppStoreEnum} from "@/models/portal/apps/AppsData";
import {AdvancedFilterData, SearchSortEnum} from "@/models/portal/competitor/PortalCompetitorData";

const topCompetitors = ref(100);

const emits = defineEmits<{
    (event: 'confirm', data: AdvancedFilterData),
    (event: 'reset')
}>();

const sorting = ref<SearchSortEnum>();

const props = defineProps<{
    advancedFilterData?: AdvancedFilterData,
    myAppStore?: AppStoreEnum,
    fromMap?: boolean
}>();

onMounted(() => {
    sorting.value = SearchSortEnum.Installs;
    if (props.advancedFilterData !== undefined) {
        sorting.value = props.advancedFilterData.sorting;
    }

    topCompetitors.value = props.advancedFilterData?.top_competitors ?? 100;
});

interface SortingBtn {
    id: SearchSortEnum;
    icon: string;
    text: string;
}

const searchFiltersBtnGr1: SortingBtn[] = props.fromMap === true ? [
    {
        id: SearchSortEnum.Installs,
        icon: PortalConstants.ICON_INSTALLS,
        text: "Installs"
    },
    {
        id: SearchSortEnum.Growth,
        icon: PortalConstants.ICON_THREAT_SCORE,
        text: "Growth"
    },
    {
        id: SearchSortEnum.TAM,
        icon: PortalConstants.ICON_TAM,
        text: "TAM"
    },
    {
        id: SearchSortEnum.Novelty,
        icon: PortalConstants.ICON_TAM,
        text: "Novelty"
    },
    {
        id: SearchSortEnum.Quality,
        icon: PortalConstants.ICON_TAM,
        text: "Quality"
    }
] :
    [
        {
            id: SearchSortEnum.Installs,
            icon: PortalConstants.ICON_INSTALLS,
            text: "Installs"
        },
        {
            id: SearchSortEnum.Growth,
            icon: PortalConstants.ICON_THREAT_SCORE,
            text: "Growth"
        },
        {
            id: SearchSortEnum.TAM,
            icon: PortalConstants.ICON_TAM,
            text: "TAM"
        },
        {
            id: SearchSortEnum.Similarity,
            icon: PortalConstants.ICON_SIMILARITY,
            text: "Similarity"
        },
        {
            id: SearchSortEnum.Novelty,
            icon: PortalConstants.ICON_TAM,
            text: "Novelty"
        },
        {
            id: SearchSortEnum.Quality,
            icon: PortalConstants.ICON_TAM,
            text: "Quality"
        }
    ]

function onConfirm() {
    const advancedFilterView: AdvancedFilterData = {
        weights: [],
        stores: [],
        current_store: false,
        sorting: sorting.value,
        top_competitors: topCompetitors.value
    }

    emits("confirm", advancedFilterView);
}

watch(() => topCompetitors.value, () => {
    if (topCompetitors.value > 200) {
        topCompetitors.value = 200;
    } else if (topCompetitors.value < 1) {
        topCompetitors.value = 1;
    }
});

</script>

<template>
    <gb-popup class="scoped-root">
        <div class="pl-2 pr-2 pb-1 font-bold text-lg">
            Advanced filter settings
        </div>
        <div class="gb-inner-window">
            <div class="gb-layout-tl-row gap-4 p-2">
                <div class="gb-layout-tl gap-2">
                    <div class="gb-layout-tl">
                        <div class="pl-2 pr-2 pb-1 font-bold">
                            Sort competitors by
                        </div>
                        <div class="gb-layout-tl-row flex-wrap filters-btn gap-1">
                            <gb-button v-for="btn in searchFiltersBtnGr1" :key="btn.id" @click="sorting = sorting === btn.id ? undefined : btn.id" :data-selected="sorting === btn.id" class="gbc-bg-node !w-[var(--filter-btn-w))]" :text="btn.text"></gb-button>
                        </div>
                    </div>
                </div>
                <div v-if="fromMap !== true" class="gb-layout-tl gap-3">
                    <div class="pl-2 pr-2 pb-1 font-bold gb-layout-ml-row gap-1">
                        <div>
                            Display top
                        </div>
                        <input type="number" v-model="topCompetitors">
                        <div>
                            competitors
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="gb-layout-bl-row w-full pl-2 pr-2 pt-2 gap-2">
            <gb-button @click="emits('reset')" icon="delete" text="Reset" class="gbc-bg-primary"></gb-button>
            <gb-button @click="onConfirm" icon="check_single" text="Confirm" class="gbc-bg-primary"></gb-button>
        </div>
    </gb-popup>
</template>

<style scoped>
.scoped-root {
  --filter-btn-w: 160px;
}

.filters-btn {
  width: calc(var(--filter-btn-w) * 2 + 10px);
}

input {
  @apply w-[90px] h-[28px] text-center font-bold;
}
</style>