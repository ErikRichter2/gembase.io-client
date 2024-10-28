<script setup lang="ts">

import PortalUtils from "@/models/portal/PortalUtils";
import {NODE_CATEGORY_CONTENT, NODE_CATEGORY_MECHANICS} from "@/models/portal/PortalDataTypes";
import {EBillingModuleId, PortalConstants} from "@/models/portal/PortalConstants";
import {TagsHelper} from "@/models/portal/tags/TagsHelper";
import {computed, onMounted, ref, watch} from "vue";
import {useAllTagsList} from "@/models/portal/auditor/AllTagsListComposable";
import {AppDetail, TagDetail, TTagId} from "@/models/portal/apps/AppsData";
import {usePlatformCalcStore} from "@/models/portal/calc/PlatformCalcStore";
import {PortalCompetitorUtils} from "@/models/portal/competitor/PortalCompetitorUtils";
import {usePortalStore} from "@/models/portal/PortalStore";
import {PlatformCalcRequestToken} from "@/models/portal/calc/PlatformCalcRequestToken";
import {AudienceTooltip, TooltipDataV2} from "@/models/portal/competitor/PortalCompetitorData";
import {
    IPlatformCalcCompetitorsAppDetail, IPlatformCalcViewInput,
} from "@/models/portal/calc/PlatformCalcData";
import GbSvg from "@/views/ui/icons/GbSvg.vue";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import {PlatformProductTreeView} from "@/models/portal/tags/TagsModel";
import {TagsViewTagData} from "@/models/portal/platformProduct/PlatformProductData";
import AudienceDetailPopup from "@/views/platform/modules/__components/AudienceDetailPopup.vue";
import ThreatScoreDetailPopup from "@/views/platform/modules/__components/ThreatScoreDetailPopup.vue";
import TagsTreeView from "@/views/platform/modules/__components/__components/TagsTreeView.vue";
import {useFullscreenLoading} from "@/models/ui/FullscreenLoadingComposable";

const allTagsList = useAllTagsList();
const portalStore = usePortalStore();
const fullscreenLoading = useFullscreenLoading();

const calcProgress = defineModel<number | undefined>();

const demoTooltip = ref(false);
const threatScoreTooltip = ref<TooltipDataV2>();
const audienceTooltip = ref<AudienceTooltip>();
const __showTamTs = ref<[boolean | undefined, boolean | undefined]>([undefined, undefined]);

const calcThreatScoreClickRequestToken = new PlatformCalcRequestToken();

const props = defineProps<{
    context: string,
    appTitle?: string,
    hideTamTsByDefault?: boolean,
    myApp?: AppDetail,
    competitorApp?: IPlatformCalcCompetitorsAppDetail,
    calcData: IPlatformCalcViewInput,
    fromModule?: EBillingModuleId
}>();

const emits = defineEmits<{
    (event: 'toggleTag', tagId: TTagId),
    (event: 'toggleLovedTag', tagId: TTagId)
}>();

watch(() => props.calcData, () => {
    calc();
});

watch(() => allTagsList.progressData.value, () => {
    calcProgress.value = allTagsList.calcProgress.value;
});

onMounted(() => {
    calc();
});

function onThreatScoreClick(tagId: TTagId) {
    if (!portalStore.canShowTooltips(EBillingModuleId.AUDIT, props.calcData.tags, tagId)) {
        demoTooltip.value = true;
        return;
    }

    const tagsDetails: TagDetail[] = [{tag_id: tagId, tag_rank: 0}];
    props.calcData.tags.forEach((x) => {
        if (x.tag_id !== tagId) {
            tagsDetails.push(x);
        }
    });

    fullscreenLoading.show({
        reason: "ts"
    });

    usePlatformCalcStore().competitors({
        context: props.context,
        requestToken: calcThreatScoreClickRequestToken.recreate(),
        input: {
            dev_id: props.calcData.devId,
            app_id: props.calcData.appId,
            tag_details: tagsDetails,
            exclusive_angle: {
                audience_angle_id: tagId
            }
        },
        responseCallback: {
            finally: () => fullscreenLoading.hide("ts"),
            done: callbackData => {
                if (callbackData.response.payload?.result_data === undefined) {
                    return;
                }
                threatScoreTooltip.value = PortalCompetitorUtils.getTooltipDataForTopAppsV2({
                    competitors: callbackData.response.payload.result_data,
                    myAppTitle: props.appTitle,
                    myAppId: props.calcData.appId
                });
            }
        }
    });
}

function onAudienceClick(tagId: TTagId) {
    if (!portalStore.canShowTooltips(EBillingModuleId.AUDIT, props.calcData.tags, tagId)) {
        demoTooltip.value = true;
        return;
    }

    const item = allTagsList.platformCalcAllTagsResult.value?.data.find(
        (x) => x.affinity.tag_id === tagId
    )

    if (item === undefined) {
        return;
    }

    audienceTooltip.value = {
        lovedTags: [tagId],
        hatedTags: TagsHelper.getTagsList(props.calcData.tags),
        audienceStats: item.audience_stats,
        audienceAngleId: item.affinity.tag_id
    }
}

function calc() {
    allTagsList.calcAllTagsAuditor({
        context: props.context,
        fromModule: props.fromModule ?? EBillingModuleId.AUDIT,
        calcInput: {
            dev_id: props.calcData.devId,
            app_id: props.calcData.appId,
            tag_details: props.calcData.tags,
            tier: props.calcData.tier,
            growth: props.calcData.growth
        },
        toggledTags: props.calcData.tags
    });
}

interface IViewData {
    title: string,
    icon: string,
    tagsView: PlatformProductTreeView<TagsViewTagData>
}

const viewData = computed(() => {
    const res: [IViewData, IViewData] = [
        {
            title: "Mechanics",
            icon: PortalUtils.getIconForNodeCategory(NODE_CATEGORY_MECHANICS),
            tagsView: allTagsList.mechanicsView.value
        },
        {
            title: "Content",
            icon: PortalUtils.getIconForNodeCategory(NODE_CATEGORY_CONTENT),
            tagsView: allTagsList.contentView.value
        }
    ];
    return res;
});

const showTamTs = computed((): [boolean, boolean] => {
    return [
        __showTamTs.value[0] ?? props.hideTamTsByDefault !== true,
        __showTamTs.value[1] ?? props.hideTamTsByDefault !== true,
    ]
});

</script>

<template>
    <div class="gb-layout-tc-row text-white gap-2 w-full">
        <div v-for="(data, ix) in viewData" :key="data.title" class="gb-layout-tl gap-2 gb-mechanics-content-width">
            <div class="gb-layout-t-between w-full pl-3 pr-5">
                <div class="gb-layout-ml-row gap-2">
                    <gb-svg class="w-[25px] aspect-square" :path="data.icon"></gb-svg>
                    <div class="font-bold">{{data.title}}</div>
                </div>
                <gb-button :semi-transparent="!showTamTs[ix]" @click="__showTamTs[ix] = !showTamTs[ix]" class="gbc-bg-secondary" :icon="PortalConstants.ICON_AUDITOR"></gb-button>
            </div>
            <div class="gb-inner-window p-2 w-full gb-mechanics-content-height">
                <div v-if="data.tagsView !== undefined" class="gb-ui-scroll-v w-full">
                    <tags-tree-view :show-tam-ts="showTamTs[ix]" @threat-score-click="onThreatScoreClick" @audience-click="onAudienceClick" @node-click="(tagId) => emits('toggleTag', tagId)" @heart-click="(tagId) => emits('toggleLovedTag', tagId)" :my-app-data="myApp" :my-app-tags="calcData.tags" :toggled-tags="TagsHelper.getTagsList(calcData.tags)" :c-app="competitorApp" :data="data.tagsView" :context="calcData.type" :loved-tags="calcData.lovedTags"></tags-tree-view>
                </div>
            </div>
        </div>
        <audience-detail-popup v-if="audienceTooltip !== undefined && allTagsList.platformCalcAllTagsResult.value !== undefined" @on-close="audienceTooltip = undefined" :tooltip-data="audienceTooltip as AudienceTooltip"></audience-detail-popup>
        <threat-score-detail-popup v-if="threatScoreTooltip !== undefined" :competitors-count="portalStore.advancedFilterData?.top_competitors" @on-close="threatScoreTooltip = undefined" :tooltip-data="threatScoreTooltip" :demo="portalStore.isDemo() || portalStore.isAuditorLocked()"></threat-score-detail-popup>
    </div>
</template>

<style>
  .gb-mechanics-content-height {}
  .gb-mechanics-content-width {}
</style>
