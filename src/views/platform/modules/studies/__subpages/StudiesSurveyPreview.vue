<script setup lang="ts">
import {onMounted, ref} from "vue";
import SurveyView from "@/views/survey/v2/SurveyView.vue";
import EndpointRequest from "@/core/requests/EndpointRequest";
import {
    SurveyServerData, SurveyServerRequestController,
    SurveyTextsData, SurveyTranslateController, SurveyViewController,
    SurveyViewData
} from "@/models/survey/v2/SurveyDataV2";
import {RoutesEnum} from "@/router/RoutesEnum";
import {useUiStore} from "@/models/ui/UiStore";
import {LocalStorageModel} from "@/models/storage/LocalStorageModel";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import {useRouterStore} from "@/core/router/RouterStore";
import {useFullscreenLoading} from "@/models/ui/FullscreenLoadingComposable";

const fullscreenLoading = useFullscreenLoading();

const initialized = ref(false);
const requestId = ref(0);
const dataLoadingState = ref("");

class SurveyServerRequestController_V2 extends SurveyServerRequestController {
    async submitInternal(data: any) {
        fullscreenLoading.show({
            timeout: 500,
            transparentBg: true
        });

        const res = await EndpointRequest.process2<{
            export: SurveyServerData,
            survey_data: any
        }>("survey:study_preview:submit", {
            study_guid: surveyViewData.guid,
            submit_data: data,
            survey_data: getFromLocalStorage()
        });

        setToLocalStorage(res.survey_data);
        await setData(1, res.export);

        fullscreenLoading.hide();
    }

    async setLang(lang: string) {
        surveyViewData.translate.setLang(lang);
        requestId.value++;
    }

    async refreshPageInternal() {
        requestId.value++;
    }
}

const surveyViewData: SurveyViewData = {
    guid: "",
    translate: new SurveyTranslateController(),
    serverController: new SurveyServerRequestController_V2(dataLoadingState)
};

onMounted(async () => {

    // url example
    // http://127.0.0.1:5173/survey?id=df5d34c8-c897-490d-afc8-131e809c0e39

    let p = useRouterStore().getQueryKey("id");
    if (p === undefined) {
        await useRouterStore().to(RoutesEnum.ERROR_404);
        return;
    }

    if (useRouterStore().getQueryKey("reset") !== undefined) {
        await useRouterStore().removeQueryKey("reset");
        setToLocalStorage(undefined);
    }

    surveyViewData.guid = p;
    await requestData();
    initialized.value = true;
});

function getStorageId() {
    return `survey__${surveyViewData.guid}`;
}

function getFromLocalStorage() {
    const storageId = getStorageId();

    let surveyData: object | undefined = undefined;
    if (LocalStorageModel.hasItem(storageId)) {
        const tmp = LocalStorageModel.getItem(storageId);
        if (tmp !== undefined) {
            try {
                surveyData = JSON.parse(tmp);
            } catch (err) {
                surveyData = undefined
            }
        }
    }

    return surveyData;
}

function setToLocalStorage(data: any) {
    const storageId = getStorageId();
    LocalStorageModel.setItem(storageId, JSON.stringify(data));
}

async function requestData() {
    fullscreenLoading.show({
        transparentBg: true
    });

    const res = await EndpointRequest.process2<{
        export: SurveyServerData,
        survey_data: any
    }>("survey:study_preview:get", {
        study_guid: surveyViewData.guid,
        survey_data: getFromLocalStorage()
    });

    setToLocalStorage(res.survey_data);

    await setData(1, res.export);

    fullscreenLoading.hide();
}

async function setData(state: number, data: SurveyServerData) {

    if (state === -1 || data === undefined) {
        useUiStore().showErrorPopupDefault("Unexpected error ! Refreshing page...", "self");
        return;
    }

    if (!surveyViewData.translate.hasData) {
        const res = await EndpointRequest.process2<SurveyTextsData>("survey:study_preview:get_texts")
        surveyViewData.translate.setData(res);
        if (data.lang !== undefined && data.lang !== null) {
            surveyViewData.translate.setLang(data.lang);
        }
    }
    surveyViewData.server_data = data;
    surveyViewData.view = SurveyViewController.create(surveyViewData.serverController, data);
    requestId.value += 1;
}

async function resetSurvey() {
    fullscreenLoading.show();
    setToLocalStorage(undefined);
    await requestData();
    fullscreenLoading.hide();
}

</script>

<template>
    <div class="z-[3] w-full h-full">
        <template v-if="initialized">
            <div class="relative w-full h-full">
                <survey-view :request-id="requestId" :data="surveyViewData as SurveyViewData" :data-loading-state="dataLoadingState"></survey-view>
                <div class="absolute z-[5] top-[10px] right-[10px]">
                    <gb-button text="Reset" class="gbc-bg-alert" @click="resetSurvey"></gb-button>
                </div>
            </div>
        </template>
    </div>
</template>

<style>
@import "/src/css/gembase_survey.css";
</style>
