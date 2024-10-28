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
import GembaseUtils from "@/utils/GembaseUtils";
import {recaptchaModel} from "@/models/external/recaptcha/RecaptchaModel";
import {showRecaptchaV2} from "@/views/survey/v2/RecaptchaV2";
import {useRouterStore} from "@/core/router/RouterStore";
import {useFullscreenLoading} from "@/models/ui/FullscreenLoadingComposable";

const fullscreenLoading = useFullscreenLoading();

const initialized = ref(false);
const requestId = ref(0);
const dataLoadingState = ref("");
const recaptchaVisible = ref(false);

let clientPendingData: any;

class SurveyServerRequestController_V2 extends SurveyServerRequestController {
    async submitInternal(data: any) {
        clientPendingData = data;
        const recaptchaToken = await recaptchaModel.execute("survey");
        fullscreenLoading.show({
            timeout: 500,
            transparentBg: true
        });
        await EndpointRequest.process2<{state: number, data: SurveyServerData}>("survey:v2:public:submit", {
            guid: surveyViewData.guid,
            data: data,
            recaptcha_token: recaptchaToken
        }).then(async response => {
            await setData(response.state, response.data);
            fullscreenLoading.hide();
        });
    }

    async setLang(lang: string) {
        await EndpointRequest.process2("survey:v2:set_lang", {
            guid: surveyViewData.guid,
            lang: lang,
        });
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

let cid = "";
let paramGender: string | undefined = "";
let paramAge: string | undefined = "";
let paramYob: string | undefined = "";

onMounted(async () => {

    // url example
    // http://127.0.0.1:5173/survey?gid=df5d34c8-c897-490d-afc8-131e809c0e39&cid=a4171182-8f51-416f-9aa4-e671e57fcacf&s=m&a=25&y=1983

    let p = useRouterStore().getQueryKey("gid");
    if (p === undefined) {
        await useRouterStore().to(RoutesEnum.ERROR_404);
        return;
    }
    surveyViewData.guid = p;
    p = useRouterStore().getQueryKey("cid");
    if (p === undefined) {
        await useRouterStore().to(RoutesEnum.ERROR_404);
        return;
    }
    cid = p;

    paramGender = useRouterStore().getQueryKey("s");
    paramAge= useRouterStore().getQueryKey("a");
    paramYob = useRouterStore().getQueryKey("y");

    await requestData();
    initialized.value = true;
});

async function requestData() {
    fullscreenLoading.show({
        transparentBg: true
    });
    await EndpointRequest.process2<{state: number, data: SurveyServerData}>("survey:v2:public:get", {
        guid: surveyViewData.guid,
        cid: cid,
        s: paramGender,
        a: paramAge,
        y: paramYob
    }).then(async response => {
        await setData(response.state, response.data);
    });
    fullscreenLoading.hide();
}

async function setData(state: number, data: SurveyServerData) {

    if (data === undefined) {
        useUiStore().showErrorPopupDefault("Unexpected error ! Refreshing page...", "self");
    }

    if (state === -1) {
        if (data.recaptcha !== undefined) {
            // show recaptcha v2
            showRecaptchaV2(verifyRecaptchaV2);
            recaptchaVisible.value = true;
        } else {
            useUiStore().showErrorPopupDefault("Unexpected survey error ! Refreshing page...", "self");
        }
        return;
    }

    if (!surveyViewData.translate.hasData) {
        await EndpointRequest.process2<SurveyTextsData>("survey:v2:get_texts")
            .then(response => {
                surveyViewData.translate.setData(response);
                if (data.lang !== undefined && data.lang !== null) {
                    surveyViewData.translate.setLang(data.lang);
                }
            });
    }
    surveyViewData.server_data = data;
    surveyViewData.view = SurveyViewController.create(surveyViewData.serverController, data);
    requestId.value += 1;

    const redirect = surveyViewData.server_data.config_data.redirect;
    if (redirect !== undefined && redirect !== null) {
        GembaseUtils.sleep(3000).then(() => {
            location.replace(redirect);
        });
    }
}

async function verifyRecaptchaV2(response) {
    recaptchaVisible.value = false;
    const recaptchaToken = response;
    fullscreenLoading.show({
        transparentBg: true
    });
    await EndpointRequest.process2<{state: number, data: SurveyServerData}>("survey:v2:public:submit_recaptcha_v2", {
        guid: surveyViewData.guid,
        data: clientPendingData,
        recaptcha_token: recaptchaToken
    }).then(async response => {
        await setData(response.state, response.data);
        fullscreenLoading.hide();
    });
}

</script>

<template>
    <div class="z-[3] w-full h-full">
        <div v-if="initialized" class="w-full h-full">
            <survey-view :request-id="requestId" :data="surveyViewData as SurveyViewData" :data-loading-state="dataLoadingState"></survey-view>
        </div>
    </div>
    <div v-show="recaptchaVisible" class="gb-modal">
        <div class="gb-modal-content">
            <div id="recaptcha_element"></div>
        </div>
    </div>
</template>

<style>
@import "/src/css/gembase_survey.css";

.gb-modal {
  @apply fixed inset-0 z-[1000] bg-black/50;
}

.gb-modal-content {
  @apply gb-layout gb-layout-full bg-transparent m-auto relative;
}
</style>