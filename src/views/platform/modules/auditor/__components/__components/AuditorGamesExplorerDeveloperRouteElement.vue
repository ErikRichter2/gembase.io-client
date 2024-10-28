<script setup lang="ts">

import {computed, onMounted, ref, watch} from "vue";
import {RoutesEnum} from "@/router/RoutesEnum";
import {LocationQuery} from "vue-router";
import {useGamesExplorerStore} from "@/models/portal/gamesExplorer/GamesExplorerStore";
import {usePortalStore} from "@/models/portal/PortalStore";
import {TDeveloperId} from "@/models/portal/apps/AppsData";
import PortalUiRouterLink from "@/views/ui/router/PortalUiRouterLink.vue";
import GbButton from "@/views/ui/buttons/GbButton.vue";

const props = defineProps<{
    devId: TDeveloperId,
    myApps?: boolean
}>();

const portalStore = usePortalStore();

const title = ref("");

onMounted(refreshTitle);
watch(() => props.devId, refreshTitle);

const gamesExplorerDeveloperQuery = computed((): LocationQuery | undefined => {
    let query: LocationQuery | undefined = undefined;

    if (props.myApps !== true) {
        query = useGamesExplorerStore().generateUrlQuery({
            filters: [{
                tag_ids: [],
                dev_ids: [props.devId],
                stores: []
            }],
            initialSelectAllFilteredApps: true
        });
    } else {
        query = useGamesExplorerStore().generateUrlQuery({
            filters: [{
                tag_ids: [],
                dev_ids: [],
                stores: [],
                my_apps: true
            }],
            initialSelectAllFilteredApps: true
        });
    }

    return query;
});

async function refreshTitle() {
    if (props.myApps !== true) {
        const devDetail = await portalStore.getDevDetailAsync(props.devId);
        title.value = `Compare games by ${devDetail.title}`;
    } else {
        title.value = "Compare my games";
    }
}

</script>

<template>
    <div v-if="props.devId !== undefined" class="gb-layout-row gap-2">
        <portal-ui-router-link :to="{name: RoutesEnum.PORTAL_GAMES, query: gamesExplorerDeveloperQuery}">
            <gb-button class="gbc-bg-primary" :show-glow="true" :tooltip="title" icon="games"></gb-button>
        </portal-ui-router-link>
    </div>
</template>
