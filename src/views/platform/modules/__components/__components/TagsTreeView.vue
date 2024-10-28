<template>
    <div v-if="props.data?.categories.length > 0" class="gb-layout-tl gap-2 w-full pr-2">
        <template v-for="subcategory in props.data?.categories[0].subcategories" :key="subcategory.name">
            <div class="gb-layout-tl w-full">
                <div class="gb-layout-ml-row relative">
                    <div class="absolute top-0 bottom-0 left-0 right-0 cursor-pointer" @click="collapsed.includes(subcategory.name) ? GembaseUtils.removeFromArr(collapsed, subcategory.name) : GembaseUtils.addToArrUnique(collapsed, subcategory.name)"></div>
                    <div class="gb-layout-ml-row text-[0.8rem] font-bold gap-1" :style="{'margin-left': props.context === 'auditor' ? '18px' : '0'}">
                        <gb-svg icon="expand_menu" class="h-[20px] w-auto" :class="{'gb2-flip-y-svg': collapsed.includes(subcategory.name)}"></gb-svg>
                        <div>{{subcategory.clientName}}</div>
                    </div>
                </div>
                <div v-if="!collapsed.includes(subcategory.name)" class="gb-layout-tl gap-[2px] w-full pt-1">
                    <div v-if="subcategory.locked === true" class="gb-layout w-full mt-3 mb-3 gap-3">
                        <div class="text-[0.7rem] max-w-[70%] text-center">This category is unavailable in DEMO.</div>
                        <portal-ui-reveal-btn class="pt-2"></portal-ui-reveal-btn>
                    </div>
                    <div v-else-if="subcategory.wip === true" class="gb-layout w-full mt-3 mb-3">
                        <div class="text-[0.8rem]">Coming soon {{PortalConstants.CHAR_ELLIPSIS}}</div>
                    </div>
                    <template v-else v-for="(item, index) in subcategory.nodes" :key="item.tagDef.node">
                        <div class="gb-layout-ml-row w-full text-[0.65rem] h-[25px]" :style="{pointerEvents: item.tagDef.locked === 1 ? 'none' : 'auto'}">
                            <gb-svg v-if="props.context === 'playerExplorer'" @click="emits('heartClick', item.tagDef.tag_id)" icon="heart" class="gb-layout-tl-row w-[16px] h-[16px] cursor-pointer mr-1 text-black data-[loved='true']:text-dim-magenta" :data-loved="lovedTags?.includes(item.tagDef.tag_id)"></gb-svg>
                            <div v-else-if="props.context === 'auditor'" class="flex flex-row-reverse items-end w-[70px] h-[16px] gap-[2px] mr-1">
                                <div class="w-[16px] h-full">
                                    <img v-if="TagsHelper.hasTag(myAppTags, item.tagDef.tag_id)" :src="AppDetailUtils.getIcon(myAppData)" class="app-icon" :data-fade="!toggledTags?.includes(item.tagDef.tag_id)">
                                </div>
                                <div class="w-[16px] h-full">
                                    <img v-if="cApp !== undefined && cApp.tag_ids !== undefined && cApp.tag_ids.includes(item.tagDef.tag_id)" :src="AppDetailUtils.getIcon(cApp)" class="app-icon" :data-fade="!toggledTags?.includes(item.tagDef.tag_id)">
                                </div>
                            </div>
                            <platform-product-node-element class="!w-full mr-4" :show-opportunity="item.audience?.no_data !== true && item.competitorsCnt === 0" :id="item.nodeElementId" @click="emits('nodeClick', item.tagDef.tag_id)" :node="item" :rank="getRank(item.tagDef.tag_id)" :toggled="toggledTags?.includes(item.tagDef.tag_id)"></platform-product-node-element>
                            <div class="relative w-[150px] h-full gb-layout-row">
                                <template v-if="showTamTs">
                                    <gb-svg v-if="index === 0 && !subcategory.locked && !collapsed.includes(subcategory.name)" class="h-[25px] absolute top-[-30px]" :icon="PortalConstants.ICON_PLAYERS"></gb-svg>
                                    <portal-ui-audience class="!w-full !h-full" :id="item.audienceElementId" :audience="item.audience" @click="emits('audienceClick', item.tagDef.tag_id)" :readonly="item.preventAudienceDetail" :locked="item.tagDef.locked === 1" :inactive="!toggledTags?.includes(item.tagDef.tag_id)" :data-tooltip="getTooltip(item)"></portal-ui-audience>
                                </template>
                            </div>
                            <div class="relative w-[120px] h-full ml-1 gb-layout-row">
                                <template v-if="showTamTs">
                                    <gb-svg v-if="index === 0 && !subcategory.locked && !collapsed.includes(subcategory.name)" class="h-[16px] absolute top-[-25px]" :icon="PortalConstants.ICON_THREAT_SCORE"></gb-svg>
                                    <portal-ui-threat-score-component :angle="item.tagDef.node" class="!w-full !h-full" @click="emits('threatScoreClick', item.tagDef.tag_id)" :threat-score="item.threatsScore" :unselected="!toggledTags?.includes(item.tagDef.tag_id)" :readonly="item.preventAudienceDetail === true" :locked="item.tagDef.locked === 1" :no-data="item.audience?.no_data"></portal-ui-threat-score-component>
                                </template>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {PlatformProductTreeView} from "@/models/portal/tags/TagsModel";
import GembaseUtils from "@/utils/GembaseUtils";
import {TTagId, TagDetail} from "@/models/portal/apps/AppsData";
import {IAppNodeTreeView} from "@/models/portal/PortalDataTypes";
import {TagsHelper} from "@/models/portal/tags/TagsHelper";
import {AppDetailUtils} from "@/models/portal/apps/AppDetailUtils";
import {TagsViewTagData} from "@/models/portal/platformProduct/PlatformProductData";
import PortalUiThreatScoreComponent from "@/views/platform/modules/__components/PlatformThreatScoreElement.vue";
import PortalUiRevealBtn from "@/views/shared/DemoRevealBtn.vue";
import {PortalConstants} from "@/models/portal/PortalConstants";
import PortalUiAudience from "@/views/platform/modules/__components/PlatformAudienceElement.vue";
import GbSvg from "@/views/ui/icons/GbSvg.vue";
import {
    IPlatformCalcCompetitorsAppDetail,
    TPlatformCalcViewType
} from "@/models/portal/calc/PlatformCalcData";
import PlatformProductNodeElement from "@/views/platform/modules/__components/PlatformProductNodeElement.vue";

const collapsed = ref<string[]>([]);

const props = defineProps<{
    context: TPlatformCalcViewType,
    data: PlatformProductTreeView<TagsViewTagData>,
    toggledTags?: TTagId[],
    myAppData?: IAppNodeTreeView,
    myAppTags?: TagDetail[],
    cApp?: IPlatformCalcCompetitorsAppDetail,
    lovedTags?: TTagId[],
    showTamTs?: boolean
}>();

const emits = defineEmits<{
    (event: 'nodeClick', tagId: TTagId): void,
    (event: 'audienceClick', tagId: TTagId): void,
    (event: 'threatScoreClick', tagId: TTagId): void,
    (event: 'heartClick', tagId: TTagId): void
}>();

function getRank(tagId: TTagId): number {
    const tag = props.myAppTags?.find((x) => x.tag_id === tagId);
    if (tag !== undefined) {
        return tag.tag_rank;
    }
    return 0;
}

function getTooltip(item: TagsViewTagData): string | undefined {
    if (item.audience?.no_data === true) {
        return "Not enough data to calculate";
    }
    const formatted = GembaseUtils.formatNumber(item.audience?.total_audience);
    if (props.myAppData !== undefined) {
        return `${formatted} fans of ${item.tagDef.node} would like ${props.myAppData.title}`;
    }
    if (props.toggledTags !== undefined && props.toggledTags.length > 0) {
        return `${formatted} fans of ${item.tagDef.node} would like other selected attributes.`;
    }
    return `There are ${formatted} addressable fans of ${item.tagDef.node}`;
}

</script>

<style scoped>
.app-icon {
  @apply w-full h-full rounded border border-black data-[fade="true"]:opacity-50;
}

</style>
