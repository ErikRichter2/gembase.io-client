<script setup lang="ts">
import {onMounted, PropType} from "vue";
import {
    SurveyServerDefaultConfigData, SurveyServerGenreDcmChoiceConfigData, SurveyServerGenreDcmConfigData,
    SurveyTranslateController,
    SurveyViewData, SurveyViewDefaultController
} from "@/models/survey/v2/SurveyDataV2";

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

function onAnswer(sectionId: string, answerId: string) {
    view().getAnswerGroup(sectionId).answer(answerId);
}

function getDcmTitle(): string {
    return configData().sections[0].answers_group?.genres_dcm?.genres.join(" ") as string;
}

function getChoices(): SurveyServerGenreDcmChoiceConfigData[] {
    const res: SurveyServerGenreDcmChoiceConfigData[] = [];

    const genresDcm = configData().sections[0].answers_group?.genres_dcm as SurveyServerGenreDcmConfigData;
    for (let i = 0; i < genresDcm.choices.length; ++i) {
        res.push(genresDcm.choices[i]);
    }

    res.push({
        id: "none",
        text: "SV_127__"
    });

    return res;
}

</script>

<template>
    <div class="gb-sv-survey-title !max-w-[550px]" v-html="translator().translate('SV_126__')"></div>
    <div class="gb-ui-section-bg-survey gb-layout-tl w-fit relative">
        <div class="dcm-page-counter">{{ configData().sections[0].answers_group?.genres_dcm?.index}} of 5</div>
        <div class="gb-layout-t-between pt-3 pl-2">
            <div>
                <span class="font-bold" v-html="getDcmTitle()"></span>
                <span class="pl-2 text-[0.7em]">{{translator().translate("SV_212__")}}</span>
            </div>
        </div>
        <div class="pt-4 pb-4">
            <div class="gb-sv-buttons-container">
                <template v-for="(data, index) in getChoices()" :key="data.id">
                    <div v-if="index !== 0" class="text-[0.8em] pl-4 pt-1 pb-1">or</div>
                    <div @click="onAnswer(configData().sections[0].id, data.id)" :data-answer-id="data.id" class="gb-sv-radio-button gb-sv-options-button !pl-6 !min-w-[300px]" data-checked="false">
                        <div v-html="translator().translate(data.text)" class="font-bold text-[0.9em]"></div>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>
