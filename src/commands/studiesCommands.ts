import type { PortalStudiesDef, PortalStudiesStudy } from '@/models/portal/studies/StudiesData'
import { BaseCommands } from './base/baseCommands'

export interface ICreateStudyResponse {
    state: string
    study_guid: string
    studies: PortalStudiesStudy[]
}

export interface ISaveStudyInput {
    study_guid: string
    data: PortalStudiesStudy
}

export interface ICopyStudyResponse {
    state: string
    study_guid: string
    studies: PortalStudiesStudy[]
}

class StudiesCommands extends BaseCommands {
    constructor() {
        super('/commands/studies')
    }

    getStudiesDef = () => this.runCommand<PortalStudiesDef>('studies:get_studies_def')

    getStudies = () => this.runCommand<PortalStudiesStudy[]>('studies:get_studies')

    createStudy = () => this.runCommand<ICreateStudyResponse>('studies:create_study')

    saveStudy = (params: ISaveStudyInput) => this.runCommand('studies:save_study', params)

    launchStudy = (params: { study_guid: string }) =>
        this.runCommand('studies:launch_study', params)

    copyStudy = (params: { study_guid: string }) =>
        this.runCommand<ICopyStudyResponse>('studies:copy_study', params)

    generateCsvForInternalLaunch = (params: { study_guid: string }) =>
        this.runCommand<string>('studies:generate_csv_for_internal_launch', params)

    simulateSurvey = (params: { study_guid: string }) =>
        this.runCommand<PortalStudiesStudy[]>('studies:simulate_survey', params)

    deleteStudy = (params: { study_guid: string }) =>
        this.runCommand('studies:delete_study', params)
}

export const studiesCommands = new StudiesCommands()
