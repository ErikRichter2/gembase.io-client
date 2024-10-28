<script setup lang="ts">
import {onMounted, PropType} from "vue";
import {SurveyViewData} from "@/models/survey/v2/SurveyDataV2";
import SurveyPageDefaultView from "@/views/survey/v2/SurveyPageDefaultView.vue";
import {recaptchaModel} from "@/models/external/recaptcha/RecaptchaModel";
import {RoutesEnum} from "@/router/RoutesEnum";
import PortalUiSvg from "@/views/ui/svg/PortalUiSvg.vue";
import {useRouterStore} from "@/core/router/RouterStore";
import GbImgLocal from "@/views/ui/img/GbImgLocal.vue";

const props = defineProps({
    data: Object as PropType<SurveyViewData>,
    dataLoadingState: String,
    requestId: Number
});

onMounted(() => {
    recaptchaModel.showBadge();
});

function getProgress(): number {
    const progress = props.data?.server_data?.progress_data;
    if (progress !== undefined) {
        if (progress.total !== 0) {
            return (1 - progress.current / progress.total) * 100;
        }
    }
    return 0;
}

function getLang(): string {
    const lang = props.data?.server_data?.lang;
    if (lang === undefined || lang === null) {
        return "EN";
    }
    return lang;
}

function setLang(lang: string) {
    const server_data = props.data?.server_data;
    if (server_data !== undefined) {
        server_data.lang = lang;
    }
    props.data?.serverController.setLang(lang);
}

</script>

<template>
    <div class="gb-sv-root" :data-loading="dataLoadingState">
        <div class="max-w-[800px] mt-10 md:mt-6 mb-0 h-fit gb-layout-tl" :key="requestId">
            <survey-page-default-view :data="props.data"></survey-page-default-view>
        </div>
        <div v-if="false" class="absolute top-2 righ-1 gb-layout-tl-row gap-1">
            <gb-img-local @click="setLang('EN')" class="gb-sv-flag-icon" :class="{ active: getLang() === 'EN' }" src="gembase/survey/flags/en_2.png" alt="English"></gb-img-local>
            <gb-img-local @click="setLang('DE')" class="gb-sv-flag-icon" :class="{ active: getLang() === 'DE' }" src="gembase/survey/flags/de_2.png" alt="Deutsch"></gb-img-local>
        </div>
    </div>
    <div class="fixed top-0 left-0 right-0 h-[10px] bg-black z-[3]">
        <div class="bg-ocean h-full" :style="{width: (100 - getProgress()) + '%'}"></div>
    </div>
    <div class="gb-ui-svg-current fixed z-50 w-full h-[20px] text-[12px] bottom-0 gb-layout-row gap-3 text-gray-800 bg-black">
        <portal-ui-svg icon="gembase" class="w-auto h-[80%]"></portal-ui-svg>
        <div class="gb-layout-tl-row gap-1">
            <a :href="useRouterStore().getFullUrl(RoutesEnum.HOME_TOS_POLICY)" target="_blank">
                General Terms of Service
            </a>
            <div>|</div>
            <a :href="useRouterStore().getFullUrl(RoutesEnum.HOME_RESPONDENT_PRIVACY_POLICY)" target="_blank">
                Respondent’s Privacy Policy
            </a>
            <div>|</div>
            <a :href="useRouterStore().getFullUrl(RoutesEnum.HOME_COOKIES_POLICY)" target="_blank">
                Cookie Policy
            </a>
            <div>|</div>
            <div class="cursor-pointer" data-gt-cookie-widget-show>
                Cookie Preferences
            </div>
        </div>
    </div>
</template>

<style>
@import "/src/css/gembase_survey.css";
</style>