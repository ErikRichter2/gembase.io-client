<script setup lang="ts">
import {PropType} from "vue";
import {
    SurveyServerDefaultConfigData,
    SurveyTranslateController,
    SurveyViewData,
    SurveyViewDefaultController
} from "@/models/survey/v2/SurveyDataV2";
import PortalUiRevealBtn from "@/views/shared/DemoRevealBtn.vue";

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

</script>

<template>
    <div v-if="configData().end_type === 'demo'" class="gb-layout gap-2">
        <div>This section is not available in DEMO</div>
        <portal-ui-reveal-btn></portal-ui-reveal-btn>
    </div>
    <template v-else>
        <div class="gb-sv-survey-subtitle" v-html="translator().translate(configData().title)"></div>
        <div class="gb-sv-survey-yellow-p" v-html="translator().translate(configData().subtitle)"></div>
    </template>
</template>
