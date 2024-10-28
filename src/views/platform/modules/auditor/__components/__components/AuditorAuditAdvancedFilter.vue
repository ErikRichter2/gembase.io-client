<script setup lang="ts">

import GbPopup from "@/views/ui/popups/GbPopup.vue";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import {onMounted, ref, watch} from "vue";
import {usePortalStore} from "@/models/portal/PortalStore";
import {PortalConstants} from "@/models/portal/PortalConstants";
import {AppStoreEnum} from "@/models/portal/apps/AppsData";
import {AdvancedFilterData, SearchSortEnum} from "@/models/portal/competitor/PortalCompetitorData";
import AuditorAuditInteractiveSpiderChart
    from "@/views/platform/modules/auditor/__components/__components/AuditorAuditInteractiveSpiderChart.vue";
import {InteractiveSpiderChart} from "@/models/portal/PortalDataTypes";
import GembaseUtils from "@/utils/GembaseUtils";
import PortalUtils from "@/models/portal/PortalUtils";

const portalStore = usePortalStore();
const topCompetitors = ref(20);

const emits = defineEmits<{
    (event: 'confirm', data: AdvancedFilterData),
    (event: 'reset')
}>();

interface SearchWeightView {
    id: number;
    name: string;
    w: number;
}

const sorting = ref<SearchSortEnum>();
const stores = ref<AppStoreEnum[]>([]);
const currentStore = ref(true);
const weights = ref<SearchWeightView[]>([]);

const weightsChartData = ref<InteractiveSpiderChart>({
    min: 0,
    max: 1000,
    items: []
});

const props = defineProps<{
    advancedFilterData?: AdvancedFilterData,
    myAppStore?: AppStoreEnum
}>();

onMounted(() => {
    currentStore.value = true;

    if (props.advancedFilterData !== undefined) {
        sorting.value = props.advancedFilterData.sorting;
        stores.value = [];
        //stores.value = [...props.advancedFilterData.stores];
        currentStore.value = props.advancedFilterData.current_store;
    }

    weights.value.length = 0;
    portalStore.advancedFilterWeightsDef.forEach((x) => {
        const val = props.advancedFilterData?.weights.find((z) => z.subcategory_int === x.subcategory_int);
        weights.value.push({
            id: x.subcategory_int,
            name: portalStore.getSubcategoryName(x.subcategory_int),
            w: val === undefined ? x.weight : val.weight
        });
        weightsChartData.value.items.push({
            id: x.subcategory_int,
            label: portalStore.getSubcategoryName(x.subcategory_int),
            value: val === undefined ? x.weight : val.weight
        });
    });

    topCompetitors.value = props.advancedFilterData?.top_competitors ?? 20;
});

interface SortingBtn {
    id: SearchSortEnum;
    icon: string;
    text: string;
}
/*
interface StoreBtn {
    id: AppStoreEnum;
    icon: string;
    text: string;
}
*/
const searchFiltersBtnGr1: SortingBtn[] = [
    {
        id: SearchSortEnum.ThreatScore,
        icon: PortalConstants.ICON_THREAT_SCORE,
        text: "Threat score"
    },
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
        text: "TAM Revenues"
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
/*
const searchFiltersBtnGr2: StoreBtn[] = [
    {
        id: AppStoreEnum.GOOGLE_PLAY,
        icon: PortalUtils.getStoreIcon(AppStoreEnum.GOOGLE_PLAY),
        text: "Google play"
    },
    {
        id: AppStoreEnum.STEAM,
        icon: PortalUtils.getStoreIcon(AppStoreEnum.STEAM),
        text: "Steam"
    }
]
*/
function onConfirm() {
    const advancedFilterData: AdvancedFilterData = {
        weights: [],
        stores: [],
        //stores: stores.value,
        current_store: currentStore.value,
        sorting: sorting.value,
        top_competitors: topCompetitors.value
    }

    weights.value.forEach((x) => {
        advancedFilterData.weights.push({
            subcategory_int: x.id,
            weight: x.w
        });
    });

    emits("confirm", advancedFilterData);
}
/*
function toggleStore(store: AppStoreEnum) {
    if (currentStore.value === false && stores.value.length === 1 && stores.value.includes(store)) {
        return;
    }
    GembaseUtils.toggleArr(stores.value, store);
}

function toggleCurrentStore() {
    if (currentStore.value === true && stores.value.length === 0) {
        return;
    }
    currentStore.value = !currentStore.value;
}
*/
watch(() => topCompetitors.value, () => {
    if (topCompetitors.value > 50) {
        topCompetitors.value = 50;
    } else if (topCompetitors.value < 1) {
        topCompetitors.value = 1;
    }
});

watch(weights.value, () => {
    weights.value.forEach((x) => {
        if (x.w > 1000) {
            x.w = 1000;
        } else if (x.w < 0) {
            x.w = 0;
        }
    })
});

function onWeightsValueChange(id: number, value: number) {
    const w = weights.value.find((x) => x.id === id);
    if (w === undefined) {
        return;
    }
    w.w = PortalUtils.normalizeSubcategoryWeight(value);
}

</script>

<template>
    <gb-popup class="scoped-root" header="Advanced filter settings">
        <div class="gb-inner-window p-3">
            <div class="gb-layout-tl-row gap-10">
                <div class="gb-layout-tl gap-10">
                    <div class="gb-layout-tl">
                        <div class="pl-2 pr-2 pb-1 font-bold">
                            Sort competitors by
                        </div>
                        <div class="gb-layout-tl-row flex-wrap filters-btn gap-1">
                            <gb-button v-for="btn in searchFiltersBtnGr1" :key="btn.id" @click="sorting = sorting === btn.id ? undefined : btn.id" :data-selected="sorting === btn.id" class="gbc-bg-node !w-[var(--filter-btn-w)]" :text="btn.text"></gb-button>
                        </div>
                    </div>
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
                <div class="gb-layout-tl gap-3">
                    <div class="gb-layout-tl">
                        <div class="pl-2 pr-2 pb-1 font-bold">
                            Competitors search weights
                        </div>
                        <div class="w-[300px] h-[300px]">
                            <auditor-audit-interactive-spider-chart class="w-full h-full" :data="weightsChartData" @on-value-change="onWeightsValueChange"></auditor-audit-interactive-spider-chart>
                        </div>
                        <div v-if="false" class="gb-layout-tl-row flex-wrap max-w-[500px] gap-1">
                            <div v-for="item in weights" :key="item.id" class="gb-layout-tl">
                                <div class="pl-2 pr-2 text-[12px]">{{item.name}}</div>
                                <input type="number" v-model="item.w">
                            </div>
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