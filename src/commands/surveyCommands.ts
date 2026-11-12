import type { SurveyServerData, SurveyTextsData } from '@/models/survey/v2/SurveyDataV2'
import { BaseCommands } from './base/baseCommands'
import type { StoreAppSearch } from '@/models/portal/PortalDataTypes'

class SurveyCommands extends BaseCommands {
    constructor() {
        super('/commands/survey')
    }

    submitStudyPreview = (params: {
        study_guid: string
        submit_data: object
        survey_data?: object
    }) =>
        this.runCommand<{
            export: SurveyServerData
            survey_data: object
        }>('survey:submit_study_preview', params)

    getStudyPreview = (params: { study_guid: string; survey_data?: object }) =>
        this.runCommand<{
            export: SurveyServerData
            survey_data?: object
        }>('survey:get_study_preview', params)

    getStudyPreviewTexts = () => this.runCommand<SurveyTextsData>('admin:get_study_preview_texts')

    submit = (params: { guid: string; data: object }) =>
        this.runCommand<{ state: number; data: SurveyServerData }>('survey:submit', params)

    setLang = (params: { guid: string; lang: string }) => this.runCommand('survey:set_lang', params)

    get = (params: {
        guid: string
        cid: string
        gender?: string
        age?: string
        year_of_birth?: string
    }) => this.runCommand<{ state: number; data: SurveyServerData }>('survey:submit', params)

    getTexts = () => this.runCommand<SurveyTextsData>('survey:submit')

    getApps = (params: { guid: string; app_title: string }) =>
        this.runCommand<StoreAppSearch[]>('survey:get_apps', params)
}

export const surveyCommands = new SurveyCommands()
