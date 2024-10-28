<script setup lang="ts">

import {playerExplorerGroupsColorsCss, usePlayerExplorerStore} from "@/models/portal/playerExplorer/PlayerExplorerStore";
import {UiUtils} from "@/utils/UiUtils";
import {TagDetail, TTagId} from "@/models/portal/apps/AppsData";
import {computed, onMounted, ref} from "vue";
import GembaseUiSelect from "@/views/ui/GembaseUiSelect.vue";
import {usePortalStore} from "@/models/portal/PortalStore";
import {SelectOptionItem} from "@/views/ui/UiData";
import PortalUtils from "@/models/portal/PortalUtils";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import MechanicsContentTags from "@/views/platform/modules/__components/MechanicsContentTags.vue";
import {usePlatformCalcContext} from "@/models/portal/calc/PlatformCalcContextComposable";
import {IPlatformCalcViewInput} from "@/models/portal/calc/PlatformCalcData";
import GbRangeSlider from "@/views/ui/rangeSlider/GbRangeSlider.vue";
import GbSlider from "@/views/ui/slider/GbSlider.vue";
import GbExpandableHeaderText from "@/views/ui/GbExpandableHeaderText.vue";
import TaggingProgress from "@/views/platform/modules/__components/TaggingProgress.vue";

const playerExplorerStore = usePlayerExplorerStore();
const platformCalcContext = usePlatformCalcContext("portal-players-explorer").contextId;

const calcProgress = ref<number>();

const props = defineProps<{
    from?: string,
    filterId: string
}>();

onMounted(() => {
    if (props.from === "audit") {
        setLovedToggleState(true);
    }
});

const filterIx = computed(() => {
    return playerExplorerStore.filters.findIndex((x) => x.data.id === props.filterId);
});

const filter = computed(() => {
    return playerExplorerStore.getFilterView(props.filterId);
});

function toggleTag(tagId: TTagId) {
    playerExplorerStore.toggleNotHatedNode(props.filterId, tagId);
}

function toggleLovedTag(tagId: TTagId) {
    playerExplorerStore.toggleLovedNode(props.filterId, tagId);
}

const mechanicsContentCalcDataViewInput = computed((): IPlatformCalcViewInput => {
    const tagsDetails: TagDetail[] = [];
    filter.value?.data.not_hated?.tag_ids.forEach((x) => {
        tagsDetails.push({
            tag_id: x,
            tag_rank: 0
        });
    });

    return {
        type: "playerExplorer",
        tags: tagsDetails,
        lovedTags: filter.value?.data.loved?.tag_ids
    }
});

function genderLabelProvider(value: number): string {
    if (value < 50) {
        return "Males: " + (100 - value).toString();
    }
    return "Females: " + value.toString();
}

function toggleSpending(spendingId: string) {
    playerExplorerStore.setSpendingFilter(filter.value?.data.id, spendingId);
}

const getLovedNodesText = computed(() => {
    const res: string[] = [];

    filter.value?.data.loved?.tag_ids.forEach((x) => {
        const node = usePortalStore().getPortalDefProductItem(x)?.node;
        if (node !== undefined) {
            res.push(node);
        }
    });

    return res.join(" ");
});

const studiesSelectOptions = computed((): SelectOptionItem[] => {
    const res: SelectOptionItem[] = [];

    if (filter.value?.data.surveys !== undefined) {
        filter.value.data.surveys.items.forEach((x) => {
            x.opt.forEach((y) => {
                res.push({
                    id: y.id,
                    value: y.label
                })
            });
        });
    }

    return res;
});

const selectedStudyIndex = computed((): number => {
    if (filter.value?.data.surveys !== undefined && filter.value.data.surveys.items.length === 1) {
        for (let i = 0; i < filter.value.data.surveys.items[0].opt.length; ++i) {
            if (filter.value.data.surveys.items[0].opt[i].id === filter.value.data.surveys?.active) {
                return i;
            }
        }
    }
    return 0;
});

const lovedToggleState = ref(false);
let lovedToggleTags: TTagId[] = [];

function setLovedToggleState(val: boolean) {
    if (val) {
        lovedToggleState.value = true;
        if (filter.value?.data.loved !== undefined && filter.value.data.not_hated !== undefined) {
            lovedToggleTags = [...filter.value.data.not_hated.tag_ids];
            playerExplorerStore.setNotHatedTags(filter.value.data.id, filter.value.data.loved.tag_ids);
        }
    } else {
        lovedToggleState.value = false;
        playerExplorerStore.setNotHatedTags(filter.value?.data.id, lovedToggleTags);
    }
}

</script>

<template>
    <div v-if="filter !== undefined" class="gb-inner-window relative p-2 gb-player-explorer-filter">
        <div class="gb-layout-tl">
            <div class="gb-layout-tl-row gap-2 pt-4">
                <div class="gb-layout-tl gap-2">

                    <!-- HEADER ### --->
                    <div class="gb-layout-t-between w-full pl-3 pr-3">
                        <div class="gb-layout-ml-row gap-1 h-[30px]">
                            <div class="w-[15px] h-[15px] rounded-[50%]" :style="{backgroundColor: playerExplorerGroupsColorsCss[filterIx]}"></div>
                            <div class="font-bold" :style="{color: playerExplorerGroupsColorsCss[filterIx]}">
                                Segment {{filterIx + 1}}
                            </div>
                        </div>
                        <gb-button @click="playerExplorerStore.toggleTraitsFilter(filter.data.id)" class="gbc-bg-primary" :class="{'gb2-rotate-90-svg': playerExplorerStore.toggledTraitsFilter.includes(filter.data.id), 'gb2-rotate-270-svg': !playerExplorerStore.toggledTraitsFilter.includes(filter.data.id)}" text="Interests" icon="expand_menu" :icon-right="true"></gb-button>
                    </div>
                    <!-- ### HEADER --->

                    <!-- FILTERS ### --->
                    <div class="gb-inner-window gb-ui-svg-current h-[var(--gb-player-explorer-filter-h)]">
                        <div class="gb-layout-m-between w-full">
                            <div class="gb-layout-ml gap-1">
                                <gb-expandable-header-text :expanded="true" text="Countries"></gb-expandable-header-text>
                                <div class="gbc-bg-transparent ml-6" data-tooltip="Countries filter">
                                    <img :src="UiUtils.getFlagIcon('us')" class="rounded-circle w-[18px]">
                                </div>
                            </div>
                            <div class="gb-layout-ml gap-1 min-w-[120px]">
                                <gb-expandable-header-text :expanded="true" text="Studies"></gb-expandable-header-text>
                                <gembase-ui-select :tooltip="PortalUtils.getTitle('Studies filter', playerExplorerStore.isLocked())" :readonly="playerExplorerStore.isLocked()" @on-change="(x) => playerExplorerStore.setStudy(filter?.data.id, x.id)" :selected-index="selectedStudyIndex" :items="studiesSelectOptions" class="!w-full !h-[25px]"></gembase-ui-select>
                            </div>
                        </div>
                        <div class="gb-layout-ml gap-1">
                            <gb-expandable-header-text :expanded="true" text="Demographics"></gb-expandable-header-text>
                            <div class="gb-layout-row gap-7 pt-5 pl-5 text-[0.9em]">
                                <gb-range-slider class="!w-[100px] !pl-1" v-if="filter.data.age !== undefined" v-bind:inputData="filter.data.age" v-bind:label="`Age`" @onChange="(value) => { if (filter?.data.age !== undefined && !playerExplorerStore.ignoreUpdateRequest) { playerExplorerStore.setAgeFilter(filter?.data.id, value.from, value.to)}}"></gb-range-slider>
                                <gb-slider class="!w-[100px]" v-if="filter.data.females !== undefined" :inputData="filter.data.females" :labelProvider="genderLabelProvider" @onChange="(value: number) => { if (filter?.data.females !== undefined && !playerExplorerStore.ignoreUpdateRequest) playerExplorerStore.setFemalesFilter(filter?.data.id, value) }"></gb-slider>
                            </div>
                        </div>
                        <div class="gb-layout-ml w-full gap-2">
                            <gb-expandable-header-text :expanded="true" text="Yearly spend"></gb-expandable-header-text>
                            <div class="gb-layout-tl-row w-full gap-2 pl-4">
                                <gb-button v-for="item in filter.data.spending?.items" :key="item.id" :text="item.label" @click="toggleSpending(item.id)" class="gbc-bg-node !text-[0.8em] !h-[25px]" :data-selected="filter.data.spending?.active.includes(item.id)" data-tooltip="Spending filter"></gb-button>
                            </div>
                        </div>
                    </div>
                    <!-- ### FILTERS --->

                </div>

                <div v-if="playerExplorerStore.isToggledTraitsFilter(filter.data.id)">
                    <mechanics-content-tags v-model="calcProgress" @toggle-tag="toggleTag" @toggle-loved-tag="toggleLovedTag" :calc-data="mechanicsContentCalcDataViewInput" :context="platformCalcContext"></mechanics-content-tags>
                </div>

            </div>
            <!-- BUTTONS ### --->
            <div class="gb-layout-ml-row w-full h-full gap-1 pl-4 pb-2 pt-2">
                <gb-button v-if="playerExplorerStore.canAddSegment()" @click="playerExplorerStore.copyFilterGroup(filter.data.id)" class="gbc-bg-primary" icon="copy" tooltip="Copy segment"></gb-button>
                <gb-button @click="playerExplorerStore.removeFilterGroup(filter.data.id)" class="gbc-bg-primary" icon="delete" tooltip="Delete segment"></gb-button>
                <div v-if="playerExplorerStore.isToggledTraitsFilter(filter.data.id)" class="gb-layout-m-between w-full pr-2">
                    <div class="bg-black rounded-2xl pl-3 pr-3 pt-1 pb-1 gap-1 gb-layout-tc text-[0.8em]">
                        <div v-if="filter.data.loved !== undefined && filter.data.loved.tag_ids.length > 0">
                            <span class="font-bold" :style="{color: playerExplorerGroupsColorsCss[filterIx]}">Segment {{filterIx + 1}}</span> are players who love {{getLovedNodesText}} (<span class="text-dim-magenta">❤</span> icon) and don’t hate other selected labels.
                        </div>
                        <div v-else-if="filter.data.not_hated !== undefined && filter.data.not_hated.tag_ids.length > 0">
                            <span class="font-bold" :style="{color: playerExplorerGroupsColorsCss[filterIx]}">Segment {{filterIx + 1}}</span> are players who don’t hate selected labels.
                        </div>
                        <div v-else>
                            Use settings above to define <span class="font-bold" :style="{color: playerExplorerGroupsColorsCss[filterIx]}">Segment {{filterIx + 1}}</span> in detail.
                        </div>
                    </div>
                    <div v-if="filter.data.loved !== undefined && filter.data.loved.tag_ids.length > 0" :data-tooltip="lovedToggleState ? `Select all preferences of ${getLovedNodesText} fans` : `Select the 2 most beloved preferences of ${getLovedNodesText} fans`">
                        <gb-button @click="setLovedToggleState(!lovedToggleState)" class="gbc-bg-secondary" icon="heart-half-stroke"></gb-button>
                    </div>
                </div>
            </div>
            <!-- ### BUTTONS --->
        </div><!-- loading progress -->
        <div v-if="calcProgress !== undefined" class="absolute bottom-[5px] right-[80px] gb-layout">
            <tagging-progress class="!p-2" :product-nodes-progress="calcProgress ?? 0"></tagging-progress>
        </div>
        <!-- loading progress -->
    </div>
</template>

<style>
  .gb-player-explorer-filter {
    --gb-player-explorer-filter-h: 230px;
  }

  .gb-player-explorer-filter .gb-mechanics-content-height {
    max-height: var(--gb-player-explorer-filter-h);
    min-height: var(--gb-player-explorer-filter-h);
  }

  .gb-player-explorer-filter .gb-mechanics-content-width {
    width: 350px;
  }
</style>
