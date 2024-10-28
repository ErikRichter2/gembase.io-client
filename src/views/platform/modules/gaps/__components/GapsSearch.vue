<template>
    <gb-window :header="`Search for market opportunities${portalStore.titleDemo()}`">

        <div class="w-[800px]">
            <div class="gb-layout-ml gap-2">

                <!-- NODES >> -->
                <div class="gb-inner-window gb-gaps-tags">
                    <mechanics-content-tags v-model="calcProgress" app-title="selected attributes" :calc-data="mechanicsContentCalcDataViewInput" :context="platformCalcContext" @toggle-tag="toggleTag" :from-module="EBillingModuleId.IDEAS"></mechanics-content-tags>
                </div>
                <!-- << NODES -->

                <!-- COUNTRIES DEMO >> -->
                <div class="gb-inner-window w-full">
                    <div class="gb-layout-row w-full text-[0.8em] gap-2 pt-2">
                        <div v-if="false"  class="gb-layout-ml w-1/2 h-full">
                            <div class="gb-layout-row pb-1 gap-2 pl-2">
                                <gb-svg src="countries" class="w-[30px] h-[30px]"></gb-svg>
                                <div class="text-[1.1em] font-bold">Countries</div>
                            </div>
                            <div class="gb-inner-window w-full">
                                <div class="gb-layout-ml w-full gap-2 h-[80px]">
                                    <div class="gb-layout-row pointer-events-none p-3 gap-1">
                                        <img :src="UiUtils.getFlagIcon('us')" class="rounded-circle w-[20px] h-auto">
                                    </div>
                                    <div class="text-[0.8em] opacity-40">More countries coming soon</div>
                                </div>
                            </div>
                        </div>
                        <div class="gb-layout-ml w-1/2 h-full">
                            <div class="gb-layout-row pb-1 gap-2 pl-2">
                                <gb-svg src="see_more" class="w-[30px] h-auto"></gb-svg>
                                <div class="text-[1.1em] font-bold">Select markets</div>
                            </div>
                            <div class="gb-inner-window w-full">
                                <div class="gb-layout-ml w-full gap-2 h-[80px]">
                                    <div class="gb-layout-tl w-full gap-1">
                                        <div class="gb-layout-tl-row w-full gap-1">
                                            <gb-button class="gbc-bg-secondary !w-1/2" icon="target" text="Current" tooltip="Coming soon" :disabled="true"></gb-button>
                                            <gb-button class="gbc-bg-secondary !w-1/2" icon="meta" text="New" tooltip="Coming soon" :disabled="true"></gb-button>
                                        </div>
                                        <div class="gb-layout-tl-row w-full gap-1">
                                            <gb-button class="gbc-bg-secondary !w-1/2" icon="trend" text="Trending" tooltip="Coming soon" :disabled="true"></gb-button>
                                            <gb-button class="gbc-bg-secondary !w-1/2" icon="all2" text="All" tooltip="Coming soon" :disabled="true"></gb-button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- << COUNTRIES DEMO -->
                <div class="gb-layout-b-between w-full pl-2 pr-2">
                    <div>
                        <div v-if="searchWarningText !== null" class="text-[0.6em] text-orange">{{searchWarningText}}</div>
                        <portal-ui-router-link :query="routerQuery.getMerge({show: 'results'})">
                            <gb-button id="gaps_search_btn" class="gbc-bg-primary !h-[40px]" :disabled="!canSearch" icon="search" text="Search"></gb-button>
                        </portal-ui-router-link>
                    </div>
                    <gb-button class="gbc-bg-primary" :disabled="true" text="Add my labels" icon="tags" tooltip="Coming soon"></gb-button>
                </div>
            </div>
        </div>

        <!-- loading progress -->
        <div v-if="calcProgress !== undefined" class="absolute top-[13px] right-[70px] gb-layout z-50">
            <tagging-progress :product-nodes-progress="calcProgress ?? 0"></tagging-progress>
        </div>
        <!-- loading progress -->

        <gembase-ui-inline-loading-popup :show="inlineLoading.visible.value"></gembase-ui-inline-loading-popup>
    </gb-window>
</template>

<script setup lang="ts">

import {usePortalStore} from "@/models/portal/PortalStore";
import {computed, onMounted, ref} from "vue";
import {UiUtils} from "@/utils/UiUtils";
import GembaseUiInlineLoadingPopup from "@/views/ui/GembaseUiInlineLoadingPopup.vue";
import {TagDetail, TTagId} from "@/models/portal/apps/AppsData";
import {TAG_SUBCATEGORY_GENRE} from "@/models/portal/PortalDataTypes";
import {TagsHelper} from "@/models/portal/tags/TagsHelper";
import {EBillingModuleId} from "@/models/portal/PortalConstants";
import {QueryUtils} from "@/utils/QueryUtils";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import GbWindow from "@/views/ui/popups/GbWindow.vue";
import MechanicsContentTags from "@/views/platform/modules/__components/MechanicsContentTags.vue";
import {IPlatformCalcViewInput} from "@/models/portal/calc/PlatformCalcData";
import {useInlineLoading} from "@/models/ui/InlineLoadingComposable";
import {usePlatformCalcContext} from "@/models/portal/calc/PlatformCalcContextComposable";
import PortalUiRouterLink from "@/views/ui/router/PortalUiRouterLink.vue";
import {useRouterQuery} from "@/core/router/query/RouterQueryComposable";
import {GapsQueryParams} from "@/models/portal/gaps/GapsQueryParams";
import GbSvg from "@/views/ui/icons/GbSvg.vue";
import TaggingProgress from "@/views/platform/modules/__components/TaggingProgress.vue";

const portalStore = usePortalStore();
const routerQuery = useRouterQuery<GapsQueryParams>();

const inlineLoading = useInlineLoading("portal-competitor-page");
const platformCalcContext = usePlatformCalcContext("portal-gaps-page").contextId;

const lastTagIdChange = ref<TTagId>();
const selectedTags = ref<TagDetail[]>([]);
const calcProgress = ref<number>();

onMounted(async () => {
    inlineLoading.show();

    selectedTags.value = QueryUtils.tagsDetailsFromQuery(routerQuery.query.value);

    if (portalStore.isIdeasLocked()) {
        const allowedTags: TTagId[] = [];
        portalStore.allowedTagsPerLockedModule.forEach((x) => {
            if (x.module_id === EBillingModuleId.IDEAS) {
                allowedTags.push(x.tag_id);
            }
        });
        const selectedTagsNew: TagDetail[] = [];
        selectedTags.value.forEach((x) => {
            if (allowedTags.includes(x.tag_id)) {
                selectedTagsNew.push(x);
            }
        });
        selectedTags.value = selectedTagsNew;
    }

    inlineLoading.hide();
});

const mechanicsContentCalcDataViewInput = computed((): IPlatformCalcViewInput => {
    return {
        type: "gaps",
        tags: selectedTags.value,
    }
});

function toggleTag(tagId: TTagId) {
    if (selectedTags.value.length >= 5) {
        if (!TagsHelper.hasTag(selectedTags.value, tagId)) {
            return;
        }
    }
    lastTagIdChange.value = tagId;
    selectedTags.value = TagsHelper.toggleTag("gaps", selectedTags.value, tagId);

    routerQuery.replace(QueryUtils.tagsDetailsToQuery(selectedTags.value));
}

const searchWarningText = computed((): string | null => {
    if (!canSearch.value) {
        return "Please select minimum 3 nodes with at least one Genre.";
    }
    return null;
});

const canSearch = computed(() => {
    if (selectedTags.value.length >= 3) {
        for (let i = 0; i < selectedTags.value.length; ++i) {
            if (portalStore.getPortalDefProductItem(selectedTags.value[i].tag_id)?.subcategory === TAG_SUBCATEGORY_GENRE) {
                return true;
            }
        }
    }
    return false;
});

</script>

<style>
.gb-gaps-tags .gb-mechanics-content-height {
  max-height: calc(100vh - 540px);
  min-height: 100px;
}

.gb-gaps-tags .gb-mechanics-content-width {
  width: 380px;
}
</style>
