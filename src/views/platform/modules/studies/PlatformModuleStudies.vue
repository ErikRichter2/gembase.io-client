<template>
    <template v-if="studiesStore.initialized">
        <studies-concepts v-if="studiesStore.routerQuery.query.show === 'concepts' && studiesStore.hasStudy(studiesStore.routerQuery.query.study)"></studies-concepts>
        <template v-else>
            <studies-detail v-if="studiesStore.routerQuery.query.study !== undefined && studiesStore.hasStudy(studiesStore.routerQuery.query.study)"></studies-detail>
            <studies-list v-else></studies-list>
        </template>
        <gembase-ui-inline-loading-popup :show="inlineLoadingHandler.visible.value"></gembase-ui-inline-loading-popup>
    </template>
    <gb-window-container v-else>
        <gembase-ui-inline-loading-popup :show="true"></gembase-ui-inline-loading-popup>
    </gb-window-container>
</template>

<script setup lang="ts">
import {onMounted} from "vue";
import GembaseUiInlineLoadingPopup from "@/views/ui/GembaseUiInlineLoadingPopup.vue";
import {useStudiesStore} from "@/models/portal/studies/StudiesStore";
import GbWindowContainer from "@/views/ui/popups/GbWindowContainer.vue";
import StudiesConcepts from "@/views/platform/modules/studies/__components/StudiesConcepts.vue";
import StudiesDetail from "@/views/platform/modules/studies/__components/StudiesDetail.vue";
import StudiesList from "@/views/platform/modules/studies/__components/StudiesList.vue";
import {useInlineLoading} from "@/models/ui/InlineLoadingComposable";

const studiesStore = useStudiesStore();

const inlineLoadingHandler = useInlineLoading("portal-studies-page");

onMounted(async () => {
    inlineLoadingHandler.show();
    inlineLoadingHandler.watchValue(() => studiesStore.isAsyncOp, "store-async-op");

    await studiesStore.init();

    if (studiesStore.routerQuery.query.study !== undefined && !studiesStore.hasStudy(studiesStore.routerQuery.query.study)) {
        inlineLoadingHandler.hide();
        studiesStore.routerQuery.replace({
            study: undefined,
            show: undefined
        });
        return;
    }

    inlineLoadingHandler.hide();
});
</script>
