<script setup lang="ts">

import {computed} from "vue";
import InlineSvg from "vue-inline-svg";
import {UiUtils} from "@/utils/UiUtils";

const props = defineProps<{
    icon?: string,
    path?: string
}>();

const relativeHeight: Map<string, number> = new Map<string, number>(
    [
        ["privacy-policy", 80],
        ["receipt", 80],
        ["red-carpet", 80],
        ["cookies", 85]
    ]
);

const height = computed(() => {
    if (props.icon !== undefined) {
        if (relativeHeight.has(props.icon)) {
            return `${relativeHeight.get(props.icon)}%`;
        }
    }
    if (props.path !== undefined) {
        for (const [key, value] of relativeHeight) {
            if (props.path.includes(key)) {
                return `${value}%`;
            }
        }
    }
    return "100%";
});

const src = computed((): string | undefined => {
    if (props.icon !== undefined) {
        return UiUtils.getIcon(props.icon);
    }
    return props.path;
})
</script>

<template>
    <div class="gb-layout-ml gb-svg-icon">
        <inline-svg v-if="src !== undefined" class="w-auto" :style="{height: height}" :src="src"></inline-svg>
    </div>
</template>

<style>
.gb-svg-icon {
}
</style>

<style scoped>

</style>