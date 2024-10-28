<script setup lang="ts">
import {PropType} from "vue";
import {SurveyTranslateController, SurveyViewData, SurveyViewDefaultController} from "@/models/survey/v2/SurveyDataV2";
import GbButton from "@/views/ui/buttons/GbButton.vue";

const props = defineProps({
    data: Object as PropType<SurveyViewData>
});

const translator = function(): SurveyTranslateController {
    return props.data?.translate as SurveyTranslateController;
}

const view = function(): SurveyViewDefaultController {
    return props.data?.view as SurveyViewDefaultController;
}

</script>

<template>
    <div v-if="view().isNextVisible" class="pl-5 pb-[100px] pt-5">
        <gb-button id="next_btn" @click="view().next()" class="gbc-bg-primary !h-[40px] !text-[25px] !pr-6 !pl-4" icon="next" :text="translator().translate('SV_23__')"></gb-button>
    </div>
</template>
