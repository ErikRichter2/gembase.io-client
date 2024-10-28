<script setup lang="ts">

import {AppDetailUtils} from "@/models/portal/apps/AppDetailUtils";
import {IAppIcon} from "@/models/portal/apps/AppsData";
import InlineSvg from "vue-inline-svg";
import {UiUtils} from "@/utils/UiUtils";
import {computed} from "vue";

const props = defineProps<{
    appIcon?: IAppIcon | null,
    selected?: boolean,
    defaultBlackBorder?: boolean,
    forceConceptIcon?: boolean
}>();

const borderType = computed(() => {
    if (props.selected === true) {
        return "selected";
    } else if (props.selected === false) {
        return props.defaultBlackBorder ? "default" : "unselected";
    }
    else {
        return props.defaultBlackBorder ? "default" : "";
    }
});

</script>

<template>
    <div class="w-full h-full relative rounded-inherit gb-ui-svg-current gb-icon-border" :data-border-type="borderType">
        <img :src="forceConceptIcon ? AppDetailUtils.getConceptIcon() : AppDetailUtils.getIcon(appIcon)" class="w-full h-full rounded-inherit data-[removed='true']:grayscale" :data-removed="appIcon?.removed_from_store === 1">
        <div v-if="appIcon?.locked" class="absolute inset-0 rounded-inherit gb-layout">
            <div class="absolute w-full h-full rounded-inherit bg-black bg-opacity-70 data-[selected='true']:bg-opacity-50" :data-selected="selected"></div>
            <inline-svg :src="UiUtils.getIcon('locked')" class="w-[80%] h-[80%]"></inline-svg>
        </div>
    </div>
</template>

<style scoped>
.gb-icon-border {
  @apply border-0 data-[border-type="default"]:border data-[border-type="default"]:border-black data-[border-type="unselected"]:border-2 data-[border-type="unselected"]:border-transparent data-[border-type="selected"]:border-2 data-[border-type="selected"]:border-orange;
}
</style>
