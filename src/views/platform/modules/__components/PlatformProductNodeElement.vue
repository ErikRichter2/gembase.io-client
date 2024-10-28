<script setup lang="ts">
import {TagsViewTagData} from "@/models/portal/platformProduct/PlatformProductData";
import {TTagId} from "@/models/portal/apps/AppsData";
import {computed} from "vue";
import {TagsHelper} from "@/models/portal/tags/TagsHelper";
import GbSvg from "@/views/ui/icons/GbSvg.vue";
import {PortalConstants} from "@/models/portal/PortalConstants";

const props = defineProps<{
    node: TagsViewTagData,
    showDiff?: boolean | undefined,
    toggled?: boolean | undefined,
    toggledOriginal?: boolean | undefined,
    rank?: number | undefined,
    rankOriginal?: number | undefined,
    readonly?: boolean | undefined,
    hideText?: boolean | undefined,
    showOpportunity?: boolean
}>();

const emits = defineEmits<{
    (event: 'click', tagId: TTagId): void
}>();

const isReadOnly = computed(() => {
    return props.readonly || props.node.readonly === true || props.node.tagDef.locked === 1;
})

function onClick() {
    if (isReadOnly.value) {
        return;
    }
    emits("click", props.node.tagDef.tag_id);
}

const nodeDiffState = computed((): string | undefined => {
    if (props.showDiff && props.toggledOriginal !== undefined && props.toggled !== undefined) {
        if (props.toggled && !props.toggledOriginal) {
            return "added";
        }
        if (!props.toggled && props.toggledOriginal) {
            return "removed";
        }
    }
    return undefined;
});

const rankDiffState = computed((): string | undefined => {
    if (props.rank !== undefined && props.rankOriginal !== undefined) {
        if (props.rank !== TagsHelper.TAG_RANK_NONE && props.rankOriginal === TagsHelper.TAG_RANK_NONE) {
            return "added";
        }
        if (props.rank === TagsHelper.TAG_RANK_NONE && props.rankOriginal !== TagsHelper.TAG_RANK_NONE) {
            return "removed";
        }
    }
    return undefined;
});

const canShowRankBadge = computed(() => {
    if (props.rankOriginal !== undefined && props.rank !== undefined) {
        return props.rank !== TagsHelper.TAG_RANK_NONE || props.rankOriginal !== TagsHelper.TAG_RANK_NONE;
    }
    return props.rank !== undefined && props.rank !== TagsHelper.TAG_RANK_NONE;
});

</script>

<template>
    <div @click="onClick" class="gb-product-node-shape gbc-bg-node" data-interactive :data-glow="toggled" :data-tooltip="node.tagDef.description" :data-na="node.tagDef.locked === 1" :data-readonly="isReadOnly" :data-selected="toggled">
        <div class="relative gb-layout-row data-[na='true']:gb-layout-m-between w-full h-full">
            <div v-if="node.tagDef.locked" class="gb-layout-row w-full h-full">
                <gb-svg v-if="node.tagDef.locked" icon="locked" class="h-[80%] w-auto"></gb-svg>
                <div>Locked</div>
            </div>
            <span v-else-if="hideText !== true" class="gb-text-ellipsis data-[diff-state='added']:text-ocean data-[diff-state='removed']:text-magenta w-full h-full" :data-diff-state="nodeDiffState">
                <div v-if="showOpportunity" class="gb-layout-m-between h-full w-full">
                    <div class="gb-layout-ml-row h-full">
                        {{node.tagDef.node}}
                    </div>
                    <gb-svg class="h-[90%] aspect-square" :icon="PortalConstants.ICON_GAPS"></gb-svg>
                </div>
                <div v-else class="gb-layout-ml-row h-full leading-none">
                    {{node.tagDef.node}}
                </div>
            </span>
            <div v-if="canShowRankBadge" class="gb-product-node-rank-badge" :data-diff-state="rankDiffState">
                {{ node.tagDef.locked ? '?' : rank }}
            </div>
            <gb-svg v-if="toggled" class="h-[60%] w-auto" icon="check_single"></gb-svg>
        </div>
    </div>
</template>

<style scoped>
.gb-product-node-rank-badge {
  @apply bg-white absolute top-[-7px] right-[-20px] w-[20px] h-[20px] rounded-circle gb-layout-row text-[0.9em] font-bold text-black data-[diff-state="added"]:text-dim-ocean data-[diff-state="removed"]:text-dim-magenta;
}

.gb-product-node-shape {
  @apply hover:brightness-125 h-[25px] text-[1.1em] pl-3 pr-3 rounded-full cursor-pointer gb-layout-row w-full;
}
</style>