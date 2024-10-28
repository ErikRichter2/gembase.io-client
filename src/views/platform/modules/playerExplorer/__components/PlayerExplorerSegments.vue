<template>
    <div class="gb-layout-tl gap-2">
        <div class="gb-layout-tl-row gap-2 flex-wrap">
            <div class="gb-layout-tl-row flex-wrap text-[0.75em]">
                <div v-for="filter in playerExplorerStore.filters" :key="filter.data.id">
                    <player-explorer-filter-component :from="from" :filter-id="filter.data.id"></player-explorer-filter-component>
                </div>
            </div>
            <!-- STATS -->
            <div class="gb-visible-desktop w-[250px] h-[320px]">
                <player-explorer-dataset-stats-chart :stats="playerExplorerStore.currentChartData.stats" :update-filters-request="playerExplorerStore.updateFiltersRequest"></player-explorer-dataset-stats-chart>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

import {
    usePlayerExplorerStore
} from "@/models/portal/playerExplorer/PlayerExplorerStore";
import PlayerExplorerFilterComponent from "@/views/platform/modules/playerExplorer/__components/PlayerExplorerFilterComponent.vue";
import PlayerExplorerDatasetStatsChart
    from "@/views/platform/modules/playerExplorer/__components/PlayerExplorerDatasetStatsChart.vue";

const playerExplorerStore = usePlayerExplorerStore();

defineProps<{
    from?: string;
}>();

</script>
