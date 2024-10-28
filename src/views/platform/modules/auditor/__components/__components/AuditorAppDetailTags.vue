<script setup lang="ts">

import {TagsHelper} from "@/models/portal/tags/TagsHelper";
import {PortalConstants} from "@/models/portal/PortalConstants";
import {PlatformProductTreeView} from "@/models/portal/tags/TagsModel";
import {TagsViewTagData} from "@/models/portal/platformProduct/PlatformProductData";
import {AppDetail, TTagId, TagDetail} from "@/models/portal/apps/AppsData";
import PortalUiRevealBtn from "@/views/shared/DemoRevealBtn.vue";
import PortalUiSvg from "@/views/ui/svg/PortalUiSvg.vue";
import AnalyzingProductDialog
    from "@/views/platform/modules/auditor/__components/__components/__components/AnalyzingProductDialog.vue";
import PlatformProductNodeElement from "@/views/platform/modules/__components/PlatformProductNodeElement.vue";

defineProps<{
    readonly: boolean,
    taggingProgressWidth?: number,
    appDetail: AppDetail,
    tags?: TagDetail[],
    originalTags?: TagDetail[],
    tagsDef?: PlatformProductTreeView<TagsViewTagData>,
    showDiff?: boolean
}>();

const emits = defineEmits<{
    (event: "toggleTag", tagId: TTagId)
}>();

</script>

<template>
    <div class="relative w-full h-full">
        <div class="text-[0.8rem] gb-layout-tl-row overflow-scroll overflow-x-hidden overflow-y-auto h-full w-full relative">
            <div class="gb-layout-tl-row pr-2 w-full gap-1">
                <template v-for="category in tagsDef?.categories" :key="category.name">
                    <template v-if="category.name === 'Mechanics' || category.name === 'Content'">
                        <div class="gb-layout-tl w-1/2">
                            <div class="gb-layout-ml-row gap-2 pl-3 pb-2">
                                <portal-ui-svg v-if="category.name === 'Mechanics'" icon="mechanics" class="w-auto h-[30px]"></portal-ui-svg>
                                <portal-ui-svg v-if="category.name === 'Content'" icon="content" class="w-auto h-[30px]"></portal-ui-svg>
                                <div class="text-sm font-bold">{{category.name}}</div>
                            </div>
                            <div class="gb-layout-tl gap-1 w-full">
                                <div v-for="subcategory in category.subcategories" :key="subcategory.clientName" class="gb-bg-inner-window p-2 w-full">
                                    <div class="gb-layout-tl">
                                        <div class="font-bold pl-3 pb-1">{{subcategory.clientName}}</div>
                                        <div v-if="appDetail.locked || subcategory.locked || subcategory.wip === true" class="gb-layout-tc gap-5 mt-5 mb-5 w-full h-full">
                                            <div v-if="subcategory.wip === true" class="gb-layout w-full h-full">
                                                <div class="text-xs">Coming soon {{PortalConstants.CHAR_ELLIPSIS}}</div>
                                            </div>
                                            <div v-else class="gb-layout-tc gap-3">
                                                <div class="text-xs">This category is locked in DEMO</div>
                                                <portal-ui-reveal-btn></portal-ui-reveal-btn>
                                            </div>
                                        </div>
                                        <div v-else class="gb-layout-tl-row flex-wrap pl-2 gap-[2px]">
                                            <div v-for="node in subcategory.nodes" :key="node.tagDef.tag_id" class="w-[120px] text-[0.8em]">
                                                <platform-product-node-element @click="emits('toggleTag', node.tagDef.tag_id)" :show-diff="showDiff" :rank-original="originalTags !== undefined ? TagsHelper.getTagRank(originalTags, node.tagDef.tag_id) : undefined" :toggled-original="originalTags !== undefined ? TagsHelper.hasTag(originalTags, node.tagDef.tag_id) : undefined" :toggled="TagsHelper.hasTag(tags, node.tagDef.tag_id)" :node="node" :readonly="readonly" :rank="TagsHelper.getTagRank(tags, node.tagDef.tag_id)"></platform-product-node-element>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </template>
            </div>
        </div>
        <!-- TAGGING POPUP >> -->
        <analyzing-product-dialog v-if="taggingProgressWidth !== undefined" class="h-full" :app="appDetail" :progress="taggingProgressWidth"></analyzing-product-dialog>
        <!-- << TAGGING POPUP -->
    </div>
</template>
