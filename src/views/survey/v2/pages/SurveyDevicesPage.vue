<script setup lang="ts">
import {onMounted, PropType} from "vue";
import {
    AnswerGroupTypeEnum,
    SurveyServerDefaultConfigData,
    SurveyTranslateController,
    SurveyViewData, SurveyViewDefaultController
} from "@/models/survey/v2/SurveyDataV2";
import SurveyNextBtn from "@/views/survey/v2/pages/SurveyNextBtn.vue";
import GbSvg from "@/views/ui/icons/GbSvg.vue";

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

function onAnswer(sectionId: string, value: any) {
    view().getAnswerGroup(sectionId).answer(value);
}

</script>

<template>
    <template v-if="configData().title !== undefined">
        <div class="gb-sv-survey-title" v-html="translator().translate(configData().title)"></div>
    </template>
    <template v-if="configData().subtitle !== undefined">
        <div class="gb-sv-survey-title" v-html="translator().translate(configData().subtitle)"></div>
    </template>
    <div class="gb-sv-survey-question-container">
        <!-- SECTION START -->
        <div v-for="section in configData().sections" :key="section.id" :id="section.id" class="gb-sv-survey-question" data-question-fade="false">

            <!-- SECTION TITLE START -->
            <template v-if="section.title !== undefined">
                <div v-html="translator().translate(section.title)" class="font-bold text-[1.2em] pb-4"></div>
            </template>
            <!-- SECTION TITLE END -->

            <template v-if="configData().answers_error !== undefined">
                <div class="gb-sv-survey-yellow-p gb-sv-check-max" v-html="translator().translate(configData().answers_error)"></div>
            </template>

            <!-- ANSWERS START -->
            <template v-if="section.answers_group !== undefined">
                <div class="gb-sv-buttons-container gb-ui-section-bg-survey">
                    <!-- ANSWERS CHECK START -->
                    <template v-if="section.answers_group.type === AnswerGroupTypeEnum.CHECK">
                        <template v-for="answer in section.answers_group.answers" :key="answer.id">
                            <div @click="onAnswer(section.id, answer.id)" :data-answer-id="answer.id" class="gb-sv-check-button gb-sv-options-button" data-checked="false">
                                <div class="gb-layout-ml-row gap-1">
                                    <div class="w-[18px] h-[18px] gb-ui-svg-current text-white">
                                        <gb-svg v-if="answer.id === 'platforms__pc'" class="w-full h-full" src="/static/media/gembase/ui/devices/computer_4.svg"></gb-svg>
                                        <gb-svg v-if="answer.id === 'platforms__playstation'" class="w-full h-full" src="/static/media/gembase/ui/devices/playstation_2.svg"></gb-svg>
                                        <gb-svg v-if="answer.id === 'platforms__xbox'" class="w-full h-full" src="/static/media/gembase/ui/devices/xbox_3.svg"></gb-svg>
                                        <gb-svg v-if="answer.id === 'platforms__switch'" class="w-full h-full" src="/static/media/gembase/ui/devices/nintendo_switch_3.svg"></gb-svg>
                                        <gb-svg v-if="answer.id === 'platforms__mobile'" class="w-full h-full" src="/static/media/gembase/ui/devices/mobile_phone.svg"></gb-svg>
                                    </div>
                                    <div class="pl-2" v-html="translator().translate(answer.text)"></div>
                                </div>
                                <div class="gb-layout-br w-[60px]">
                                    <div class="gb-sv-check-icon gb-sv-check-icon-border">
                                        <div class="gb-sv-check-icon-content gb-layout-tl" :data-checked="false">
                                            <gb-svg icon="check_single" class="w-[25px] h-[25px]"></gb-svg>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </template>
                    </template>
                    <!-- ANSWERS CHECK END -->

                </div>
            </template>
            <!-- ANSWERS END -->

        </div>
        <!-- SECTION END -->
    </div>

    <!-- NEXT BUTTON START -->
    <survey-next-btn :data="props.data"></survey-next-btn>
    <!-- NEXT BUTTON END -->

</template>

<style scoped>
svg {
  width: 23px;
  height: 23px;
  border-radius: 4px;
}
</style>
