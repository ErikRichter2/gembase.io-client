<script setup lang="ts">
import {computed, PropType} from "vue";
import {
    SurveyServerDefaultConfigData,
    SurveyViewData
} from "@/models/survey/v2/SurveyDataV2";
import SurveyIntroPage from "@/views/survey/v2/pages/SurveyIntroPage.vue";
import SurveyDefaultPage from "@/views/survey/v2/pages/SurveyDefaultPage.vue";
import SurveyGenresDcmPage from "@/views/survey/v2/pages/SurveyGenresDcmPage.vue";
import SurveyTopicsDcmPage from "@/views/survey/v2/pages/SurveyTopicsDcmPage.vue";
import SurveyEndPage from "@/views/survey/v2/pages/SurveyEndPage.vue";
import SurveyFavoriteGamePage from "@/views/survey/v2/pages/SurveyFavoriteGamePage.vue";
import SurveyDevicesPage from "@/views/survey/v2/pages/SurveyDevicesPage.vue";
import SurveyConceptsDcmPage from "@/views/survey/v2/pages/SurveyConceptsDcmPage.vue";
import SurveySpendingV2Page from "@/views/survey/v2/pages/SurveySpendingV2Page.vue";

const props = defineProps({
    data: Object as PropType<SurveyViewData>
});

const configData = computed((): SurveyServerDefaultConfigData => {
    return props.data?.server_data?.config_data as SurveyServerDefaultConfigData;
});
</script>

<template>
    <template v-if="configData.template === 'intro'">
        <survey-intro-page :data="props.data"></survey-intro-page>
    </template>
    <template v-else-if="configData.template === 'end'">
        <survey-end-page :data="props.data"></survey-end-page>
    </template>
    <template v-else-if="configData.template === 'favorite_game'">
        <survey-favorite-game-page :data="props.data"></survey-favorite-game-page>
    </template>
    <template v-else-if="configData.template === 'genres_dcm'">
        <survey-genres-dcm-page :data="props.data"></survey-genres-dcm-page>
    </template>
    <template v-else-if="configData.template === 'topics_dcm'">
        <survey-topics-dcm-page :data="props.data"></survey-topics-dcm-page>
    </template>
    <template v-else-if="configData.id === 'devices'">
        <survey-devices-page :data="props.data"></survey-devices-page>
    </template>
    <template v-else-if="configData.id === 'concepts_dcm'">
        <survey-concepts-dcm-page :data="props.data"></survey-concepts-dcm-page>
    </template>
    <template v-else-if="configData.id === 'spending_v2'">
        <survey-spending-v2-page :data="props.data"></survey-spending-v2-page>
    </template>
    <template v-else>
        <survey-default-page :data="props.data"></survey-default-page>
    </template>
</template>
