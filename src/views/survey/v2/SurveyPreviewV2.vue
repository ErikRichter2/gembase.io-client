<script setup lang="ts">
import { onMounted, ref } from 'vue'
import SurveyView from '@/views/survey/v2/SurveyView.vue'
import {
    type SurveyServerData,
    SurveyServerRequestController,
    SurveyTranslateController,
    SurveyViewController,
    type SurveyViewData,
} from '@/models/survey/v2/SurveyDataV2'
import { useFullscreenLoading } from '@/models/ui/FullscreenLoadingComposable'
import { surveyCommands } from '@/commands/surveyCommands'
import router from '@/router'
import { QueryUtils } from '@/utils/QueryUtils'
import { HOME_ROUTES } from '@/router/routes/HomeRoutes'

const fullscreenLoading = useFullscreenLoading()

const initialized = ref(false)
const requestId = ref(0)
const dataLoadingState = ref('')

class SurveyServerRequestController_V2 extends SurveyServerRequestController {
    async submitInternal(data: any) {
        fullscreenLoading.show({
            timeout: 500,
            transparentBg: true,
        })

        const res = await surveyCommands.submit({
            guid: surveyViewData.guid,
            data: data,
        })

        await setData(res.state, res.data)
        fullscreenLoading.hide('admin-surveys')
    }

    async setLang(lang: string) {
        await surveyCommands.setLang({
            guid: surveyViewData.guid,
            lang: lang,
        })
        surveyViewData.translate.setLang(lang)
        requestId.value++
    }

    async refreshPageInternal() {
        requestId.value++
    }
}

const surveyViewData: SurveyViewData = {
    guid: '',
    translate: new SurveyTranslateController(),
    serverController: new SurveyServerRequestController_V2(dataLoadingState),
}

let cid = ''
let paramGender: string | undefined = ''
let paramAge: string | undefined = ''
let paramYob: string | undefined = ''

onMounted(async () => {
    // url example
    // http://127.0.0.1:5173/survey?gid=df5d34c8-c897-490d-afc8-131e809c0e39&cid=a4171182-8f51-416f-9aa4-e671e57fcacf&s=m&a=25&y=1983

    let p = QueryUtils.getStringOrUndefined('gid')
    if (p === undefined) {
        await router.push(HOME_ROUTES.PAGE_404)
        return
    }
    surveyViewData.guid = p
    p = QueryUtils.getStringOrUndefined('cid')
    if (p === undefined) {
        await router.push(HOME_ROUTES.PAGE_500)
        return
    }
    cid = p

    paramGender = QueryUtils.getStringOrUndefined('s')
    paramAge = QueryUtils.getStringOrUndefined('a')
    paramYob = QueryUtils.getStringOrUndefined('y')

    await requestData()
    initialized.value = true
})

async function requestData() {
    fullscreenLoading.show({
        transparentBg: true,
    })
    await surveyCommands
        .get({
            guid: surveyViewData.guid,
            cid: cid,
            gender: paramGender,
            age: paramAge,
            year_of_birth: paramYob,
        })
        .then(async (response) => {
            await setData(response.state, response.data)
        })
    fullscreenLoading.hide()
}

async function setData(state: number, data: SurveyServerData) {
    if (state === -1 || data === undefined) {
        // todo error popup
        //useUiStore().showErrorPopupDefault('Unexpected error ! Refreshing page...', 'self')
        return
    }

    if (!surveyViewData.translate.hasData) {
        const res = await surveyCommands.getTexts()
        surveyViewData.translate.setData(res)
        if (data.lang !== undefined && data.lang !== null) {
            surveyViewData.translate.setLang(data.lang)
        }
    }
    surveyViewData.server_data = data
    surveyViewData.view = SurveyViewController.create(surveyViewData.serverController, data)
    requestId.value += 1
}
</script>

<template>
    <div class="z-[3] w-full h-full">
        <div v-if="initialized" class="w-full h-full">
            <survey-view
                :request-id="requestId"
                :data="surveyViewData as SurveyViewData"
                :data-loading-state="dataLoadingState"
            ></survey-view>
        </div>
    </div>
</template>

<style>
@import '/src/css/gembase_survey.css';
</style>
