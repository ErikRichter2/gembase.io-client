<script setup lang="ts">

import {usePlayerExplorerStore} from "@/models/portal/playerExplorer/PlayerExplorerStore";
import {computed} from "vue";
import PlayerExplorerChart from "@/views/platform/modules/playerExplorer/__components/PlayerExplorerChart.vue";
import PlayerExplorerMarketReachChart
    from "@/views/platform/modules/playerExplorer/__components/PlayerExplorerMarketReachChart.vue";

const playerExplorerStore = usePlayerExplorerStore();

function getChart(chartId: string) {
    if (playerExplorerStore.currentChartData.charts.length > 0) {
        return playerExplorerStore.currentChartData.charts[0].find((x) => x.id === chartId);
    }

    return undefined;
}

const bestFeaturesData = computed(() => {
    if (playerExplorerStore.currentChartData.charts.length === 0) {
        return undefined;
    }
    return playerExplorerStore.currentChartData.charts[0]
        .find((x) => x.id === "best_features" && x.group === playerExplorerStore.selectedDcmConceptsHeader);
});

const topicsOverlapData = computed(() => {
    if (playerExplorerStore.currentChartData.charts.length === 0) {
        return undefined;
    }
    return playerExplorerStore.currentChartData.charts[0]
        .find((x) => x.id === "topics_overlap" && x.group === playerExplorerStore.selectedDcmConceptsHeader);
});

const marketReachData = computed(() => {
    if (playerExplorerStore.currentChartData.charts.length === 0) {
        return undefined;
    }
    return playerExplorerStore.currentChartData.charts[0].find((x) => x.id === "market_reach");
});

</script>

<template>
    <div class="gb-layout w-full h-full gap-2">
        <div class="gb-inner-window w-full">
            <div class="gb-layout w-full h-[500px]">
                <div class="gb-layout-m-between w-full pl-3 pr-3">
                    <div class="gb-chart-card-title">{{getChart('market_reach')?.name}}</div>
                </div>
                <player-explorer-market-reach-chart class="w-full h-full relative" v-if="marketReachData !== undefined" :update-filters-request="playerExplorerStore.updateFiltersRequest" :chart-data="marketReachData" :filters="playerExplorerStore.filters"></player-explorer-market-reach-chart>
            </div>
        </div>

        <div class="gb-layout-tc-row w-full h-full gap-2">
            <div class="gb-inner-window w-[60%]">
                <div class="gb-layout w-full h-full">
                    <div class="gb-layout-m-between w-full pl-3 pr-3">
                        <div class="gb-chart-card-title-2 gb-layout-ml">
                            <div>{{getChart('best_features')?.name}}</div>
                            <div class="font-normal text-[0.7em] text-gray-700">to go with {{marketReachData?.name}}</div>
                        </div>
                    </div>
                    <player-explorer-chart class="w-full h-[calc(100%-60px)]" v-if="bestFeaturesData !== undefined" :update-filters-request="playerExplorerStore.updateFiltersRequest" :columns-count="-1" :chart-data="bestFeaturesData" :filters="playerExplorerStore.filters"></player-explorer-chart>
                </div>
            </div>
            <div class="gb-inner-window w-[40%]">
                <div class="gb-layout w-full">
                    <div class="gb-layout-m-between w-full pl-3 pr-3">
                        <div class="gb-chart-card-title-2 gb-layout-ml">
                            <div>{{getChart('topics_overlap')?.name}}</div>
                            <div class="font-normal text-[0.7em] text-gray-700">with {{marketReachData?.name}}</div>
                        </div>
                    </div>
                    <player-explorer-chart class="w-full h-[calc(100%-60px)]" v-if="topicsOverlapData !== undefined" :update-filters-request="playerExplorerStore.updateFiltersRequest" :columns-count="-1" :chart-data="topicsOverlapData" :filters="playerExplorerStore.filters"></player-explorer-chart>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.gb-chart-card-title-2 {
  @apply text-[1em] font-bold pt-4 pb-2 pl-2;
}
</style>
