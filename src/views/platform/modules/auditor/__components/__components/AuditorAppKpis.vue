<script setup lang="ts">
import {AppDetail, AppTypeEnum} from "@/models/portal/apps/AppsData";
import {computed} from "vue";
import GembaseUtils from "@/utils/GembaseUtils";
import {AppDetailUtils} from "@/models/portal/apps/AppDetailUtils";

const props = defineProps<{
    appDetail?: AppDetail
}>();

const kpis = computed(() => {
    const res: string[] = [];

    if (props.appDetail === undefined) {
        return [];
    }

    const installs = AppDetailUtils.getInstallsName(props.appDetail).toLowerCase();
    res.push(`${GembaseUtils.formatNumber(props.appDetail.installs)} ${installs}`);
    res.push(`${GembaseUtils.formatNumber(props.appDetail.growth)} ${installs} / year`);
    res.push(`${GembaseUtils.formatRating(props.appDetail.rating)}`);
    res.push(`Released ${props.appDetail.released_year}`);
    res.push(`$${GembaseUtils.formatNumber(props.appDetail.tam)} TAM Revenues`);

    return res;
})
</script>

<template>
    <div v-if="appDetail !== undefined && appDetail.app_type === AppTypeEnum.STORE" class="gb-layout-tl-row gap-1">
        <div v-for="kpi in kpis" class="gb-base-shape gbc-bg-node text-[0.55em] font-normal">
            {{kpi}}
        </div>
    </div>
</template>
