import {Option, Question, SurveyData} from "@/models/survey/SurveyData";
import GembaseUtils from "@/utils/GembaseUtils";
import SurveyTranslator from "@/models/survey/SurveyTranslator";

export default class SurveyModel {

    static createSurveyData(response: any, translator: SurveyTranslator) {

        const surveyData: SurveyData = response;
        const q = response['questions'];
        const o = response['options'];

        surveyData.questions = [];
        if (surveyData.title !== undefined) {
            surveyData.title = translator.translate(surveyData.title);
        }

        if (surveyData.concept_data !== undefined) {
            surveyData.concept_data.desc = translator.translate(surveyData.concept_data.desc);
        }

        for (let i = 0; i < q.length; ++i) {
            for (const qid in q[i]['items']) {
                const question: Question = q[i]['items'][qid];
                surveyData.questions.push(question);
                question.id = qid;
                question.options = [];
                question.text = translator.translate(question.text, question.text_params);

                if ('show_only_when_answer' in q[i]) {
                    question.show_only_when_answer = q[i]['show_only_when_answer']
                }

                if ('apps' in q[i] && qid in q[i]['apps']) {
                    const apps = q[i]['apps'][qid];
                    if (apps !== undefined) {
                        question.apps = apps;
                        if (question.apps !== undefined) {
                            question.apps = GembaseUtils.shuffle(question.apps);
                        }
                    }
                }

                for (let j = 0; j < o.length; ++j) {
                    if (o[j]['id'] === q[i]['options']) {
                        question.options_id = q[i]['options'];
                        question.validation = o[j]['validation'];
                        const optionItems: Option[] = o[j]['items'];
                        let lastOption: Option | undefined = undefined;

                        if (optionItems !== undefined) {
                            for (let k = 0; k < optionItems.length; k++) {
                                optionItems[k].text = translator.translate(optionItems[k].text)
                                if (optionItems[k].dcm_title !== undefined) {
                                    optionItems[k].dcm_title = translator.translate(optionItems[k].dcm_title);
                                }
                                if (optionItems[k].dcm_features !== undefined) {
                                    const arr = optionItems[k].dcm_features as string[];
                                    for (let f = 0; f < arr.length; f++) {
                                        arr[f] = translator.translate(arr[f]);
                                    }
                                }
                                if (optionItems[k]['last'] === true) {
                                    lastOption = optionItems[k];
                                }
                                question.options.push(optionItems[k]);
                            }
                        }
                        if (o[j]['randomized'] === true) {
                            question.options = GembaseUtils.shuffle(question.options);
                            if (lastOption !== undefined) {
                                question.options.splice(question.options.indexOf(lastOption), 1);
                                question.options.push(lastOption);
                            }
                        }
                        break;
                    }
                }

                if (surveyData.randomized) {
                    surveyData.questions = GembaseUtils.shuffle(surveyData.questions);
                }
            }
        }

        return surveyData;
    }
}