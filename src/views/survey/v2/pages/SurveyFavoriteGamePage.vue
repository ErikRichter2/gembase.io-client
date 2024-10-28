<script setup lang="ts">
import {onMounted, PropType} from "vue";
import {
    AnswerGroupTypeEnum,
    SurveyServerDefaultConfigData,
    SurveyTranslateController,
    SurveyViewData, SurveyViewDefaultController
} from "@/models/survey/v2/SurveyDataV2";
import AppSearchInput from "@/views/survey/AppSearchInput.vue";
import EndpointRequest from "@/core/requests/EndpointRequest";
import {AppStoreEnum} from "@/models/portal/apps/AppsData";
import {StoreAppSearch} from "@/models/portal/PortalDataTypes";

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

function onAppsInputChange(sectionId: string, appId: string, store: AppStoreEnum) {
    onAnswer(sectionId, `${store}___${appId}`);
}

async function searchApps(appTitle: string): Promise<StoreAppSearch[]> {
    let res: StoreAppSearch[] = [];
    await EndpointRequest.process2<StoreAppSearch[]>(`survey:v2:public:get_apps`, {
        guid: props.data?.guid as string,
        app_title: appTitle})
        .then(async response => {
            res = response;
        });
    return res;
}

</script>

<template>
    <template v-if="configData().title !== undefined">
        <div class="gb-sv-survey-title" v-html="translator().translate(configData().title)"></div>
    </template>
    <div class="gb-sv-survey-question-container">
        <!-- SECTION START -->
        <div v-for="section in configData().sections" :key="section.id" :id="section.id" class="gb-sv-survey-question" data-question-fade="false">
            <div class="gb-sv-survey-yellow-p" v-html="translator().translate('SV_211__')"></div>

            <!-- ANSWERS START -->
            <template v-if="section.answers_group !== undefined">
                <div class="gb-sv-buttons-container rounded-2xl bg-white/5 p-5">

                    <template v-if="section.answers_group.type === AnswerGroupTypeEnum.APP_SEARCH">
                        <app-search-input :input-placeholder="translator().translate('SV_214__')" :search-command="searchApps" :hide-title="true" :hide-stores="true" @on-change="(appId, store) => {onAppsInputChange(section.id, appId, store)}"></app-search-input>
                    </template>

                </div>
            </template>
            <!-- ANSWERS END -->

        </div>
        <!-- SECTION END -->
    </div>

</template>
