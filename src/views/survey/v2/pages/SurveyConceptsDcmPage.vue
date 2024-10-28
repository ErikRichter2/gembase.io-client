<script setup lang="ts">
import {computed, onMounted, PropType} from "vue";
import {
    SurveyServerConceptsDcmConfigData,
    SurveyServerDefaultConfigData, SurveyTranslateController,
    SurveyViewData, SurveyViewDefaultController
} from "@/models/survey/v2/SurveyDataV2";
import StudyConceptExample from "@/views/shared/SsurveyConceptExample.vue";
import {IConceptExample} from "@/models/portal/studies/StudiesData";

const props = defineProps({
    data: Object as PropType<SurveyViewData>
});

const configData = function(): SurveyServerDefaultConfigData {
    return props.data?.server_data?.config_data as SurveyServerDefaultConfigData;
};

const translator = function(): SurveyTranslateController {
    return props.data?.translate as SurveyTranslateController;
}

const view = function(): SurveyViewDefaultController {
    return props.data?.view as SurveyViewDefaultController;
}

onMounted(() => {
    view().refreshState();
});

function onAnswer(sectionId: string, answerId: number) {
    view().getAnswerGroup(sectionId).answer(answerId);
}

const pageTitle = computed(() => {
    return `${translator().translate('SV_126__')}`;
});

function getConceptExampleFromDcmData(data: SurveyServerConceptsDcmConfigData): IConceptExample {
    return {
        title: data.title,
        desc: data.description,
        f1: data.feature_1,
        f2: data.feature_2
    }
}

</script>

<template>
    <div class="gb-sv-survey-title" v-html="pageTitle"></div>
    <div class="gb-layout gb-ui-section-bg-survey gap-2 w-fit relative">
        <div class="dcm-page-counter">{{ configData().sections[0].answers_group?.concepts_dcm?.index}} of 5</div>
        <template v-for="data in configData().sections[0].answers_group?.concepts_dcm?.choices" :key="data.id">
            <study-concept-example class="text-[0.75em] leading-[0.75em]" @click="onAnswer(configData().sections[0].id, data.id)" :hide-reload="true" :interactive="true" :concept="getConceptExampleFromDcmData(data)"></study-concept-example>
        </template>
        <div @click="onAnswer(configData().sections[0].id, -1)" class="gb-sv-check-button gb-sv-options-button !w-[400px] text-[0.8em]">
            <div v-html="translator().translate('SV_127__')"></div>
        </div>
    </div>
</template>

