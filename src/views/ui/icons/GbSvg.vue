<script setup lang="ts">

import {computed} from "vue";
import InlineSvg from "vue-inline-svg";
import {UiUtils} from "@/utils/UiUtils";

const props = defineProps<{
    icon?: string,
    path?: string,
    src?: string,
    keepColors?: boolean
}>();

const relativeHeight: Map<string, string> = new Map<string, string>(
    [
        ["privacy-policy", "80%"],
        ["receipt", "80%"],
        ["red-carpet", "80%"],
        ["cookies", "85%"],
        ["threat_score", "calc(100% + 7px)"],
        ["check_single", "calc(100% + 5px)"],
        ["currency_dollar", "calc(100% + 5px)"],
        ["play", "90%"],
    ]
);

const height = computed(() => {
    if (props.icon !== undefined) {
        if (relativeHeight.has(props.icon)) {
            return relativeHeight.get(props.icon);
        }
    }
    if (props.path !== undefined) {
        for (const [key, value] of relativeHeight) {
            if (props.path.includes(key)) {
                return value;
            }
        }
    }
    return "100%";
});

const finalSrc = computed((): string | undefined => {
    if (props.icon !== undefined) {
        return UiUtils.getIcon(props.icon);
    }
    if (props.src !== undefined) {
        return props.src;
    }
    return props.path;
})
</script>

<template>
    <div class="gb-svg gb-layout-ml" :class="{'gb-ui-svg-current': keepColors !== true}">
        <inline-svg v-if="finalSrc !== undefined" class="w-auto" :style="{
            height: height,
            minHeight: height,
            maxHeight: height
        }" :src="finalSrc"></inline-svg>
    </div>
</template>
