<script setup lang="ts">

import GembaseUtils from "@/utils/GembaseUtils";
import {UiUtils} from "@/utils/UiUtils";
import {computed, ref} from "vue";
import {filterDefPrices, useGamesExplorerStore} from "@/models/portal/gamesExplorer/GamesExplorerStore";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import {usePortalStore} from "@/models/portal/PortalStore";
import MechanicsContentTags from "@/views/platform/modules/__components/MechanicsContentTags.vue";
import GamesExplorerAdvancedFilter from "@/views/platform/modules/gamesExplorer/__components/GamesExplorerAdvancedFilter.vue";
import {usePlatformCalcContext} from "@/models/portal/calc/PlatformCalcContextComposable";
import {TagDetail, TDeveloperId, TTagId} from "@/models/portal/apps/AppsData";
import {IPlatformCalcViewInput} from "@/models/portal/calc/PlatformCalcData";
import {DeveloperHint} from "@/models/portal/PortalDataTypes";
import {GamesExplorerSelectedItem} from "@/models/portal/gamesExplorer/GamesExplorerData";
import {AdvancedFilterData} from "@/models/portal/competitor/PortalCompetitorData";
import InteractiveImage from "@/views/ui/img/InteractiveImage.vue";
import GbRangeSlider from "@/views/ui/rangeSlider/GbRangeSlider.vue";
import PlatformAppIcon from "@/views/platform/modules/__components/PlatformAppIcon.vue";
import GbCloseBtnSlot from "@/views/ui/close/GbCloseBtnSlot.vue";
import PlatformDeveloperSearch from "@/views/platform/modules/__components/PlatformDeveloperSearch.vue";
import GbExpandableHeaderText from "@/views/ui/GbExpandableHeaderText.vue";
import TaggingProgress from "@/views/platform/modules/__components/TaggingProgress.vue";
import {useFullscreenLoading} from "@/models/ui/FullscreenLoadingComposable";

const portalStore = usePortalStore();
const gamesExplorerStore = useGamesExplorerStore();
const platformCalcContext = usePlatformCalcContext("portal-games-explorer").contextId;
const fullscreenLoading = useFullscreenLoading();

const calcProgress = ref<number>();
const showAdvancedFilter = ref(false);

const props = defineProps<{
    filterId: string
}>();

const emits = defineEmits<{
    (event: 'loading', val: boolean): void,
    (event: 'toggleItem'): void,
}>();

function toggleTag(tagId: TTagId) {
    gamesExplorerStore.toggleNode(props.filterId, tagId);
    gamesExplorerStore.updateFilter(props.filterId);
}

const mechanicsContentCalcDataViewInput = computed((): IPlatformCalcViewInput => {
    const tagsDetails: TagDetail[] = [];
    filter.value?.filter.tag_ids.forEach((x) => {
        tagsDetails.push({
            tag_id: x,
            tag_rank: 0
        });
    });

    return {
        type: "auditor",
        tags: tagsDetails
    }
});

const filter = computed(() => {
    return gamesExplorerStore.getFilterView(props.filterId);
});

const filterIx = computed(() => {
    return gamesExplorerStore.getFilterIndex(props.filterId);
});

function getInstallsTierLabel() {
    const tier = filter.value?.filter.tier;
    if (tier === undefined) {
        return "";
    }

    const tierFrom = portalStore.installTiers.find((x) => x.tier === tier.from);
    const tierTo = portalStore.installTiers.find((x) => x.tier === tier.to);
    const valueTo = GembaseUtils.formatNumber(tierTo?.value_to);
    const valueFrom = GembaseUtils.formatNumber(tierFrom?.value_from);
    if (tierFrom?.tier === gamesExplorerStore.filterDef?.tier.min && tierTo?.tier === gamesExplorerStore.filterDef?.tier.max) {
        return `All`;
    }
    if (tierTo?.tier === gamesExplorerStore.filterDef?.tier.max) {
        return `At least ${valueFrom}`;
    }
    return `${valueFrom} - ${valueTo}`;
}

function getPricesLabel() {
    const prices = filter.value?.filter.prices;
    if (prices === undefined) {
        return "";
    }

    const tierFrom = filterDefPrices.find((x) => x.tier === prices.from);
    const tierTo = filterDefPrices.find((x) => x.tier === prices.to);
    const valueTo = GembaseUtils.formatNumber(tierTo?.to);
    const valueFrom = GembaseUtils.formatNumber(tierFrom?.from);
    if (tierFrom?.tier === gamesExplorerStore.filterDef?.prices.min && tierTo?.tier === gamesExplorerStore.filterDef?.prices.max) {
        return `All`;
    }
    if (tierTo?.tier === gamesExplorerStore.filterDef?.prices.max) {
        return `At least $${valueFrom}`;
    }
    return `$${valueFrom} - $${valueTo}`;
}

function onRemoveDevFilter(devId: TDeveloperId) {
    gamesExplorerStore.removeDevFilter(props.filterId, devId);
}

async function onAddDev(data: DeveloperHint) {
    fullscreenLoading.show();
    const devDetail = await portalStore.scrapDev(data.dev_id_in_store, data.store);
    gamesExplorerStore.addDevFilter(props.filterId, devDetail.dev_id);
    fullscreenLoading.hide();
}

const devDetails = computed(() => {
    return gamesExplorerStore.devDetails.filter((x) => filter.value?.filter.dev_ids.includes(x.devId));
});

function onToggleItem(item: GamesExplorerSelectedItem) {
    gamesExplorerStore.toggleItem(item);
    emits("toggleItem");
}

function onAdvancedFilterConfirm(data: AdvancedFilterData) {
    showAdvancedFilter.value = false;
    gamesExplorerStore.setAdvancedFilter(props.filterId, data);
}

function onAdvancedFilterReset() {
    showAdvancedFilter.value = false;
    gamesExplorerStore.setAdvancedFilter(props.filterId, undefined);
}

</script>

<template>
    <div v-if="filter !== undefined" class="gb-layout-tl-row text-[0.75em] gb-games-explorer-filter">
        <div class="gb-inner-window">
            <div class="gb-layout-tl-row relative">
                <div class="gb-layout-tl gap-2">

                    <!-- HEADER ### --->
                    <div class="gb-layout-ml-row gap-1 pl-3 h-[30px]">
                        <div class="w-[15px] h-[15px] rounded-[50%]" :style="{backgroundColor: gamesExplorerStore.getItemColorByIndex(filterIx)}"></div>
                        <div class="font-bold" :style="{color: gamesExplorerStore.getItemColorByIndex(filterIx)}">
                            Segment {{filterIx + 1}}
                        </div>
                    </div>
                    <!-- ### HEADER --->

                    <!-- FILTERS ### --->
                    <div class="gb-inner-window p-2 pr-3 h-[var(--gb-player-explorer-filter-h)]">
                        <div class="gb-layout-ml gb-ui-svg-current relative gap-2 min-w-[230px]">
                            <div class="gb-layout-tl-row w-full gap-4">
                                <div class="gb-layout-ml gap-1">
                                    <gb-expandable-header-text :expanded="true" text="Countries"></gb-expandable-header-text>
                                    <div class="ml-6" data-tooltip="Country filter">
                                        <img :src="UiUtils.getFlagIcon('us')" class="rounded-circle w-[18px]">
                                    </div>
                                </div>
                            </div>
                            <div class="gb-layout-ml w-full gap-1">
                                <gb-expandable-header-text :expanded="true" text="Installs"></gb-expandable-header-text>
                                <div class="gb-layout-tl-row flex-wrap text-[0.5rem] max-w-[260px] gap-[5px] pt-[15px] pl-[30px] cursor-pointer">
                                    <gb-range-slider class="!w-[100px]" v-if="gamesExplorerStore.filterDef !== undefined" :input-data="filter.filter.tier" :custom-label="getInstallsTierLabel()" @onChange="(value) => { gamesExplorerStore.setTierFilter(props.filterId, value.from, value.to)}"></gb-range-slider>
                                </div>
                            </div>
                            <div class="gb-layout-ml w-full gap-1">
                                <gb-expandable-header-text :expanded="true" text="Prices"></gb-expandable-header-text>
                                <div class="gb-layout-tl-row flex-wrap text-[0.5rem] max-w-[260px] gap-[5px] pt-[15px] pl-[30px] cursor-pointer">
                                    <gb-range-slider class="!w-[100px]" v-if="gamesExplorerStore.filterDef !== undefined" :input-data="filter.filter.prices" :custom-label="getPricesLabel()" @onChange="(value) => { gamesExplorerStore.setPriceFilter(props.filterId, value.from, value.to)}"></gb-range-slider>
                                </div>
                            </div>
                            <div class="absolute bottom-0 right-0 mr-1 mb-1">
                                <gb-button tooltip="Advanced filter" :demo="portalStore.isInsightLocked()" @click="showAdvancedFilter = !showAdvancedFilter" icon="digital-transformation" class="gbc-bg-primary"></gb-button>
                            </div>
                        </div>
                    </div>

                    <!-- ### FILTERS --->

                    <!-- ### DEVELOPER SEARCH --->
                    <div class="gb-layout-ml w-full gap-1 pt-2">
                        <platform-developer-search :include-concepts="true" data-tooltip="Search developer" placeholder="Enter company name to add portfolio" @on-hint-selected="(data) => onAddDev(data)" class="w-full h-[30px]"></platform-developer-search>
                        <div v-for="dd in devDetails" :key="dd.devId">
                            <gb-close-btn-slot @close="() => onRemoveDevFilter(dd.devId)">
                                <div class="gbc-bg-secondary gb-base-shape">
                                    <div>{{dd.devDetail?.title}}</div>
                                </div>
                            </gb-close-btn-slot>
                        </div>
                    </div>
                    <!-- DEVELOPER SEARCH ### --->

                    <!-- BUTTONS ### --->
                    <div class="gb-layout-mr-row w-full gap-1 pr-2 pt-1">
                        <gb-button v-if="gamesExplorerStore.filters.length <= 2" @click="gamesExplorerStore.copyFilterGroup(filter.filter.id)" tooltip="Copy segment" icon="copy" class="gbc-bg-primary"></gb-button>
                        <gb-button @click="gamesExplorerStore.removeFilterGroup(filter.filter.id)" tooltip="Delete segment" icon="delete" class="gbc-bg-primary"></gb-button>
                    </div>
                    <!-- ### BUTTONS --->

                    <!-- loading progress -->
                    <div v-if="calcProgress !== undefined" class="gb-layout pt-2">
                        <tagging-progress :product-nodes-progress="calcProgress ?? 0"></tagging-progress>
                    </div>
                    <!-- loading progress -->

                </div>

                <div class="gb-layout-tl">
                    <mechanics-content-tags v-model="calcProgress" @toggle-tag="toggleTag" app-title="selected attributes" :calc-data="mechanicsContentCalcDataViewInput" :context="platformCalcContext"></mechanics-content-tags>
                    <div class="gb-layout-tl w-full pl-7 pb-2 pt-3 gap-2">
                        <div class="font-bold">
                            Select games from the segment to add them to comparison map
                        </div>
                        <div class="w-[690px] h-[100px] gb-ui-scroll-v">
                            <div class="gb-layout-tl-row w-full gap-[1px] flex-wrap">
                                <interactive-image v-for="(it) in gamesExplorerStore.getApps(filter.filter.id)" :key="it.item.id" @click="onToggleItem(it.item)" :data-tooltip="it.title" class="w-[30px] h-[30px] border-2 border-primary rounded" :style="{borderColor: gamesExplorerStore.getItemColor(it.item.id), borderWidth: `${gamesExplorerStore.isSelected(it.item.id) ? 2 : 0}px`, pointerEvents: it.locked ? 'none' : 'auto'}">
                                    <platform-app-icon :app-icon="it" :default-black-border="true" class="rounded"></platform-app-icon>
                                </interactive-image>
                            </div>
                        </div>
                    </div>
                </div>

                <games-explorer-advanced-filter class="z-[1001]" v-if="showAdvancedFilter" v-model="showAdvancedFilter" :filter-id="filter.filter.id" @confirm="onAdvancedFilterConfirm" @reset="onAdvancedFilterReset" :advanced-filter-data="filter.filter.advanced_filter_data"></games-explorer-advanced-filter>
            </div>
        </div>
    </div>
</template>

<style>
.slider-container {
  width: 100%;
}

.slider-container .slider {
  @apply appearance-none w-full h-[5px] bg-violet-gray outline-none opacity-70 transition-opacity duration-200;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.slider-container .slider:hover {
  opacity: 1;
}

.slider-container .slider::-webkit-slider-thumb {
  @apply appearance-none w-[18px] h-[18px] bg-orange cursor-pointer rounded-circle;
}

.slider-container .slider::-moz-range-thumb {
  @apply w-[18px] h-[18px] bg-orange cursor-pointer rounded-circle;
}

.gb-games-explorer-filter {
  --gb-player-explorer-filter-h: 230px;
}

.gb-games-explorer-filter .gb-mechanics-content-height {
  max-height: var(--gb-player-explorer-filter-h);
  min-height: var(--gb-player-explorer-filter-h);
}

.gb-games-explorer-filter .gb-mechanics-content-width {
  width: 350px;
}
</style>
