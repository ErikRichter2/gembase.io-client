<script setup lang="ts">
import {PropType, ref} from "vue";
import {
    SurveyServerDefaultConfigData,
    SurveyTranslateController,
    SurveyViewData,
    SurveyViewDefaultController
} from "@/models/survey/v2/SurveyDataV2";
import {UiUtils} from "@/utils/UiUtils";
import {RoutesEnum} from "@/router/RoutesEnum";
import {useRouterStore} from "@/core/router/RouterStore";
import GbButton from "@/views/ui/buttons/GbButton.vue";
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

const checked = ref(false);
const errorMsg = ref(false);

function onNext() {
    if (!checked.value) {
        errorMsg.value = true;
        setTimeout(() => {
            errorMsg.value = false;
        }, 2000);
        return;
    }
    view().next();
}
</script>

<template>
    <div class="gb-ui-section-bg-survey leading-6 !pr-[75px]">
        <div class="intro-text-2 text-[30px]" v-html="translator().translate('SV_52__')"></div>
        <div class="intro-text-1 text-[26px]" v-html="'Could you please help us understand your gaming preferences?'"></div>
        <div class="intro-text-2 text-[26px]">
            <span>Your responses will help game developers make amazing games and </span>
            <span class="text-orange mb-4 text-[26px]">your data is completely anonymous.</span>
        </div>
        <div class="intro-text-2 text-[26px]" v-html="'Thank you!'"></div>
        <div class="gb-layout-row gap-2 cursor-pointer">
            <div @click="checked = !checked" class="checkbox">
                <gb-svg v-if="checked" icon="check_single" class="w-[18px] h-[18px]"></gb-svg>
            </div>
            <div @click="checked = !checked" :data-text-error="errorMsg" class="font-bold text-[20px] text-dim-ocean">
                I have read and agree to the
                <a :href="useRouterStore().getFullUrl(RoutesEnum.HOME_TOS_POLICY)" target="_blank">
                    <span class="underline">General Terms of Service</span>
                </a>
                and
                <a :href="useRouterStore().getFullUrl(RoutesEnum.HOME_RESPONDENT_PRIVACY_POLICY)" target="_blank">
                    <span class="underline">Respondent’s Privacy Policy.</span>
                </a>
            </div>
        </div>
        <div class="gb-layout-tl-row pt-4">
            <gb-button id="next_btn" class="gbc-bg-primary !h-[40px] !text-[0.8em]" icon="next" :text="translator().translate('SV_191__')" :inactive="!checked" @click="onNext"></gb-button>
        </div>
    </div>
</template>

<style scoped>
.intro-text-1 {
  font-weight: bold;
  margin-bottom: 30px;
}

.intro-text-2 {
  margin-bottom: 30px;
}

</style>
