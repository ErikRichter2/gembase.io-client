<script setup lang="ts">
import {onMounted, PropType} from "vue";
import {
    AnswerGroupTypeEnum,
    SurveyServerDefaultConfigData, SurveyServerDefaultSectionData, SurveyServerSectionDefaultAnswerData,
    SurveyTranslateController,
    SurveyViewData, SurveyViewDefaultController, TextAnswerData
} from "@/models/survey/v2/SurveyDataV2";
import SurveyNextBtn from "@/views/survey/v2/pages/SurveyNextBtn.vue";
import AppSearchInput from "@/views/survey/AppSearchInput.vue";
import EndpointRequest from "@/core/requests/EndpointRequest";
import {StoreAppSearch} from "@/models/portal/PortalDataTypes";
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

function trimAppTitle(title: string): string {
    const removeAllAfter: string[] = [
        " - ",
        " ‎-",
        ": ",
        "："
    ]
    const remove: string[] = [
        "®",
        "™️",
        "™"
    ]

    for (let i = 0; i < removeAllAfter.length; ++i) {
        if (title.includes(removeAllAfter[i])) {
            const idx = title.indexOf(removeAllAfter[i]);
            title = title.substring(0, idx);
        }
    }
    for (let i = 0; i < remove.length; ++i) {
        if (title.includes(remove[i])) {
            title = title.replaceAll(remove[i], "");
        }
    }
    return title;
}

function formatAnswerText(sectionData: SurveyServerDefaultSectionData, answerData: SurveyServerSectionDefaultAnswerData): string {
    let res = "";

    if (answerData.from !== undefined && answerData.to !== undefined) {
        res = translator().translate(answerData.text, ['from', answerData.from.toString(), "to", answerData.to.toString()]);
    } else if (view().id === "genres") {
        res = translator().translate(answerData.text, ["genre", sectionData.title, "genre_or_topic", sectionData.title]);
    } else if (view().id === "topics") {
        res = translator().translate(answerData.text, ["topic", sectionData.title, "genre_or_topic", sectionData.title]);
    } else if (configData().id === "multiplayer") {
        res = translator().translate(answerData.text, ["single_multi_games", sectionData.title]);
        res = res.replace("Games", "games");
    } else {
        res = translator().translate(answerData.text);
    }

    if (configData().id === "genres" || configData().id === "topics") {
        res = res.replaceAll("<b>", "").replaceAll("<b>", "");
    }

    return res;
}

function formatTitleText(): string {
    const params: string[] = [];

    const title_genre = configData().title_genre;
    const title_topic = configData().title_topic;
    if (title_genre !== undefined || title_topic !== undefined) {
        const t: string[] = [];
        if (title_genre !== undefined) {
            t.push(translator().translate(title_genre));
        }
        if (title_topic !== undefined) {
            t.push(translator().translate(title_topic));
        }

        if (t.length === 2) {
            const p = `${t[0]} ${translator().translate('SV_210__')} ${t[1]}`
            params.push("title_genre_or_topic", p)
        } else if (t.length === 1) {
            const p = `${t[0]}`
            params.push("title_genre_or_topic", p)
        }
    }

    const page = view().sectionPage;
    const pages = view().sectionPages;
    if (pages != 0) {
        params.push("page_counter");
        params.push(`(${page}/${pages})`)
    }

    return translator().translate(configData().title, params);
}

function getSections(): SurveyServerDefaultSectionData[] {
    if (view().sectionPages !== 0) {
        const res: SurveyServerDefaultSectionData[] = [];
        const sections = configData().sections;
        const cnt = Math.ceil(sections.length / view().sectionPages);
        const ifrom = cnt * (view().sectionPage - 1);
        const ito = Math.min(ifrom + cnt, sections.length);
        for (let i = ifrom; i < ito; ++i) {
            res.push(sections[i]);
        }
        return res;
    } else {
        return configData().sections;
    }
}

function onAppsInputChange(sectionId: string, appId: string) {
    onAnswer(sectionId, appId);
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
    <div class="gb-layout-tl">
        <div v-if="configData().title !== undefined" class="gb-sv-survey-title !mb-4" v-html="formatTitleText()"></div>
        <div v-if="configData().subtitle !== undefined" class="gb-sv-survey-title" v-html="translator().translate(configData().subtitle)"></div>

        <template v-if="configData().answers_error !== undefined">
            <div class="gb-sv-survey-yellow-p gb-sv-check-max" v-html="translator().translate(configData().answers_error)"></div>
        </template>

        <div class="gb-sv-survey-question-container w-fit">
            <!-- SECTION START -->
            <div v-for="section in getSections()" :key="section.id" :id="section.id" class="gb-sv-survey-question gb-ui-section-bg-survey" data-question-fade="false">

                <!-- SECTION TITLE START -->
                <template v-if="section.title !== undefined">
                    <div v-html="translator().translate(section.title)" class="font-bold text-[1.2em] pb-4"></div>
                </template>
                <!-- SECTION TITLE END -->

                <!-- APPS EXAMPLES -->
                <template v-if="section.icon !== undefined">
                    <div class="gb-layout-tl-row flex-wrap gap-2 mb-7">
                        <div class="gb-layout-tl text-[0.6em] w-[120px]">
                            <img :key="section.icon" :src="section.icon" :alt="section.title" class="rounded-lg">
                        </div>
                    </div>
                </template>
                <div v-if="section.apps_data !== undefined">
                    <div v-html="translator().translate('SV_22__')" class="pb-3 text-[0.9em]"></div>
                    <div class="gb-layout-tl-row gap-2 mb-7 flex-wrap">
                        <template v-for="appData in section.apps_data" :key="appData.id">
                            <div class="gb-layout-tl text-[0.6em] w-[120px]">
                                <img :key="appData.icon" :src="appData.icon" :alt="appData.title" class="border border-black rounded-lg">
                                <div class="pt-2">{{trimAppTitle(appData.title)}}</div>
                            </div>
                        </template>
                    </div>
                </div>
                <!-- APPS EXAMPLES END -->

                <!-- ANSWERS START -->
                <template v-if="section.answers_group !== undefined">
                    <div class="gb-sv-buttons-container">

                        <!-- ANSWERS RADIO START -->
                        <template v-if="section.answers_group.type === AnswerGroupTypeEnum.RADIO">
                            <template v-for="answer in section.answers_group.answers" :key="answer.id">
                                <div @click="onAnswer(section.id, answer.id)" :data-answer-id="answer.id" class="gb-sv-radio-button gb-sv-options-button" data-checked="false" v-html="formatAnswerText(section, answer)">
                                </div>
                            </template>
                        </template>
                        <!-- ANSWERS RADIO END -->

                        <!-- ANSWERS CHECK START -->
                        <template v-if="section.answers_group.type === AnswerGroupTypeEnum.CHECK">
                            <template v-for="answer in section.answers_group.answers" :key="answer.id">
                                <div @click="onAnswer(section.id, answer.id)" :data-answer-id="answer.id" class="gb-sv-check-button gb-sv-options-button" data-checked="false">
                                    <div v-html="formatAnswerText(section, answer)"></div>
                                    <div class="gb-layout-bl pl-5">
                                        <div class="gb-sv-check-icon gb-sv-check-icon-border">
                                            <div class="gb-sv-check-icon-content" data-checked="false">
                                                <gb-svg icon="check_single" class="w-[20px] h-[20px]"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </template>
                        <!-- ANSWERS CHECK END -->

                        <!-- ANSWERS TEXT START -->
                        <template v-if="section.answers_group.type === AnswerGroupTypeEnum.TEXT">
                            <template v-for="answer in section.answers_group.answers" :key="answer.id">
                                <div class="gb-sv-text-input">
                                    <input :data-answer-id="answer.id" type="text" :placeholder="translator().translate('SV_54__')" @input="event => onAnswer(section.id, {id: answer.id, text: (event.target as HTMLInputElement).value} as TextAnswerData)">
                                </div>
                            </template>
                        </template>
                        <!-- ANSWERS TEXT END -->

                        <template v-if="section.answers_group.type === AnswerGroupTypeEnum.APP_SEARCH">
                            <app-search-input :search-command="searchApps" :hide-title="true" :hide-stores="true" @on-change="(appId) => {onAppsInputChange(section.id, appId)}"></app-search-input>
                        </template>

                    </div>
                </template>
                <!-- ANSWERS END -->

            </div>
            <!-- SECTION END -->
        </div>

        <!-- NEXT BUTTON START -->
        <survey-next-btn :data="props.data"></survey-next-btn>
        <!-- NEXT BUTTON END -->

    </div>


</template>
