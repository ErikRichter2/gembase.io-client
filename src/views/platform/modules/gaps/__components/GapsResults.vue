<template>
    <gb-window>

        <div v-if="opportunities.length > 0" class="gb-layout-tl">

            <!-- SORT >> -->
            <div class="gb-layout-row gap-1 absolute top-[50px] right-[50px]">
                <gb-slot-button @click="onSort('ts')" class="gbc-bg-secondary gap-1" :data-semi-transparent="portalStore.searchGapsSortType !== 'ts'">
                    <gb-svg class="!h-[70%]" icon="threat_score"></gb-svg>
                    <gb-svg class="!h-[60%]" :class="{'gb2-flip-y-svg': portalStore.searchGapsSortAsc.includes('ts')}" icon="expand_menu"></gb-svg>
                </gb-slot-button>
                <gb-slot-button @click="onSort('tam')" class="gbc-bg-secondary gap-1" :data-semi-transparent="portalStore.searchGapsSortType !== 'tam'">
                    <gb-svg class="!h-[70%]" icon="currency_dollar"></gb-svg>
                    <gb-svg class="!h-[60%]" :class="{'gb2-flip-y-svg': portalStore.searchGapsSortAsc.includes('tam')}" icon="expand_menu"></gb-svg>
                </gb-slot-button>
            </div>
            <!-- << SORT -->

            <!-- TITLE >> -->
            <div class="gb-ui-window-header !gb-layout-tl">
                <div>Opportunities found</div>
                <div class="text-[0.7em] font-normal">among people who love {{ loveTagsText }}</div>
            </div>
            <!-- << TITLE -->

            <!-- CARDS >> -->
            <div v-if="searchResult !== undefined" class="gb-ui-scroll-v gb-layout-tl gap-2 h-[calc(100vh-250px) max-h-[calc(100vh-250px)]" @scroll="(x) => onResultsScroll(x)">
                <div v-for="(arr, arrIndex) in opportunitiesToColumns" :key="arrIndex" class="gb-layout-tl-row gap-2 pr-3">
                    <gap-card v-for="(opportunity, index) in arr" :id="`gaps_card__${arrIndex}__${index}`" :key="opportunity.affinity.tag_id" :max-tam="maxTam" :opportunity="opportunity"></gap-card>
                </div>
            </div>
            <!-- << CARDS -->
        </div>
        <div v-else class="pt-7">
            <div class="gb-inner-window">
                <div class="gb-layout-tl gap-2">
                    <div class="gb-layout-tl-row gap-2">
                        <gb-svg class="gb2-loading-anim w-[30px] h-[30px]" icon="loading"></gb-svg>
                        <div class="whitespace-nowrap">Processing affinities ...</div>
                    </div>
                    <div v-if="productNodesProgress !== undefined" class="w-full h-[6px] ">
                        <div class="bg-black w-full h-full rounded gb2-mask">
                            <div class="h-full gbc-bg-primary rounded" :style="{width: `${productNodesProgress}%`}"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </gb-window>
</template>

<script setup lang="ts">

import {computed, onMounted, ref} from "vue";
import {TGapsSortBy, usePortalStore} from "@/models/portal/PortalStore";
import {TagDetail} from "@/models/portal/apps/AppsData";
import {QueryUtils} from "@/utils/QueryUtils";
import GapCard from "@/views/platform/modules/gaps/__components/__components/GapCard.vue";
import GbSvg from "@/views/ui/icons/GbSvg.vue";
import GbSlotButton from "@/views/ui/buttons/GbSlotButton.vue";
import GembaseUtils from "@/utils/GembaseUtils";
import {usePlatformCalcStore} from "@/models/portal/calc/PlatformCalcStore";
import {
    IPlatformCalcAffinities, IPlatformCalcAffinity,
    IPlatformValuesCalcProgressData
} from "@/models/portal/calc/PlatformCalcData";
import GbWindow from "@/views/ui/popups/GbWindow.vue";
import {useRouterQuery} from "@/core/router/query/RouterQueryComposable";
import {GapsQueryParams} from "@/models/portal/gaps/GapsQueryParams";

const selectedTags = ref<TagDetail[]>([]);
const opportunities = ref<IPlatformCalcAffinity[]>([]);
const opportunitiesTotalCount = ref(0);
const productNodesProgressData = ref<IPlatformValuesCalcProgressData>();
const portalStore = usePortalStore();
const routerQuery = useRouterQuery<GapsQueryParams>();

let searchResult: IPlatformCalcAffinities | undefined = undefined;
const serviceContext = "portal-gaps-search-opportunities-results-page";
let currentBatch = 0;
const itemsPerBatch = 20;

onMounted(async () => {
    selectedTags.value = QueryUtils.tagsDetailsFromQuery(routerQuery.query.value);
    refreshSort();
    await calcSearchOpportunities();
});

function onResultsScroll(event: Event) {
    const el: HTMLElement = event.target as HTMLElement;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
        addBatchResults();
    }
}

function addBatchResults() {
    if (searchResult?.data !== undefined) {
        const arr = searchResult.data.slice(
            currentBatch * itemsPerBatch,
            (currentBatch + 1) * itemsPerBatch
        );
        if (arr.length > 0) {
            opportunities.value.push(...arr);
            currentBatch += 1;
        }
    }
}

const opportunitiesToColumns = computed(() => {
    const res: IPlatformCalcAffinity[][] = [];

    if (opportunities.value.length === 1) {
        res.push([opportunities.value[0]]);
    } else {
        let isFirst = true;
        const arr: IPlatformCalcAffinity[] = [];
        opportunities.value.forEach((x) => {
            arr.push(x);
            if (!isFirst) {
                res.push([...arr]);
                arr.length = 0;
            }
            isFirst = !isFirst;
        });
    }

    return res;
});

async function calcSearchOpportunities() {
    await usePlatformCalcStore().searchOpportunities({
        context: serviceContext,
        input: {
            tag_details: selectedTags.value
        },
        responseCallback: {
            progress: callbackData => {
                productNodesProgressData.value = callbackData.response.payload?.progress_data;
            },
            done: callbackData => {
                productNodesProgressData.value = undefined;
                setData(callbackData.response.payload?.result_data);
            }
        }
    });
}

const productNodesProgress = computed((): number | undefined => {
    if (productNodesProgressData.value !== undefined) {
        const p = productNodesProgressData.value?.p;
        const t = productNodesProgressData.value?.t;
        if (p !== undefined && t !== undefined && t > 0) {
            return Math.round((p / t) * 100);
        }
    }

    return undefined;
});

const maxTam = ref<number>();

function setData(data: IPlatformCalcAffinities | undefined = undefined) {
    if (data?.data !== undefined) {
        searchResult = data;
        let maxTamRaw = 0;
        searchResult.data.forEach((x) => {
            if (maxTamRaw < x.tam) {
                maxTamRaw = x.tam;
            }
        });
        maxTam.value = maxTamRaw;
        opportunitiesTotalCount.value = data.data.length;
        refreshSort();
    } else {
        maxTam.value = 0;
        searchResult = {
            platform_id: 0,
            data: []
        }
    }
}

function onSort(sortType: TGapsSortBy) {
    if (portalStore.searchGapsSortType === sortType) {
        GembaseUtils.toggleArr(portalStore.searchGapsSortAsc, sortType);
    } else {
        portalStore.searchGapsSortType = sortType;
    }

    refreshSort();
}

function refreshSort() {
    if (searchResult?.data !== undefined) {
        searchResult.data.sort((a, b) => {

            if (a.locked === true && b.locked !== true) {
                return 1;
            } else if (b.locked === true && a.locked !== true) {
                return -1;
            }

            let valA = 0;
            let valB = 0
            if (portalStore.searchGapsSortType === "ts") {
                valA = a.ts ?? 0;
                valB = b.ts ?? 0;
            } else if (portalStore.searchGapsSortType === "tam") {
                valA = a.tam;
                valB = b.tam;
            }

            if (portalStore.searchGapsSortAsc.includes(portalStore.searchGapsSortType)) {
                if (valA > valB) {
                    return 1;
                } else if (valA < valB) {
                    return -1;
                }
            } else {
                if (valA < valB) {
                    return 1;
                } else if (valA > valB) {
                    return -1;
                }
            }

            // second sort

            if (portalStore.searchGapsSortType === "ts") {
                valA = a.tam;
                valB = b.tam;

                if (valA < valB) {
                    return 1;
                } else if (valA > valB) {
                    return -1;
                }
            } else if (portalStore.searchGapsSortType === "tam") {
                valA = a.ts ?? 0;
                valB = b.ts ?? 0;

                if (valA < valB) {
                    return -1;
                } else if (valA > valB) {
                    return 1;
                }
            }

            return 0;
        });

        currentBatch = 0;
        opportunities.value.length = 0;
        addBatchResults();
    }
}

const loveTagsText = computed(() => {
    const arr: string[] = [];
    selectedTags.value.forEach((x) => {
        arr.push(portalStore.getTagName(x.tag_id));
    });
    if (arr.length > 0) {
        return arr.join(" + ");
    }
    return "";
});
</script>
