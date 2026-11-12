import type {
    AppDetail,
    DevDetail,
    TAppId,
    TDeveloperId,
    TTagId,
} from '@/models/portal/apps/AppsData'
import { BaseCommands } from './base/baseCommands'
import type {
    EPlatformValuesCalcType,
    IPlatformCalcOptions,
    IPlatformCalcResponseBase,
    IPlatformValuesCalcProgressData,
} from '@/models/portal/calc/PlatformCalcData'

export interface IPlatformCalcResponse<SERVICE_DATA> extends IPlatformCalcResponseBase {
    payload?: {
        progress_data?: IPlatformValuesCalcProgressData
        result_data?: SERVICE_DATA
    }
}

export interface IInitCalcInput<T> {
    calcType: EPlatformValuesCalcType
    calcOptions: IPlatformCalcOptions<T>
}

export interface ICheckCalcInput {
    calc: EPlatformValuesCalcType
    hash_key: number
    generate_client_data: boolean
}

export interface IGetMostHatedTagsInput {
    audience_angle_id: string
    loved_tags: {
        tag_ids: TTagId[]
    }
    hated_tags: {
        tag_ids: TTagId[]
    }
}

export interface IGetMostHatedTagsResponse {
    top_loved: string[]
    most_hated: {
        tag_ids: TTagId[]
    }
}

class CalcCommands extends BaseCommands {
    constructor() {
        super('/commands/calc')
    }

    initCalc = <T>(params: IInitCalcInput<T>) =>
        this.runCommand<IPlatformCalcResponse<T>>('calc:init_calc', params)

    checkCalc = <T>(params: ICheckCalcInput) =>
        this.runCommand<IPlatformCalcResponse<T>>('calc:check_calc', params)

    getAppDetails = (params: { app_id: TAppId; includeGallery?: boolean }) =>
        this.runCommand<
            IPlatformCalcResponse<{
                state: number
                app_details: AppDetail[]
            }>
        >('platform_values:get_app_details', params)

    getDeveloperDetails = (params: { dev_ids: TDeveloperId[] }) =>
        this.runCommand<DevDetail[]>('calc:get_developers_details', params)

    getMostHatedTags = (params: IGetMostHatedTagsInput) =>
        this.runCommand<IGetMostHatedTagsResponse>('calc:get_most_hated_tags', params)

    getTsSimilarityLog = (params: {
        platform_id: number
        competitor: {
            app_id: TAppId
        }
    }) => this.runCommand<any>('admin:get_ts_similarity_log', params)
}

export const calcCommands = new CalcCommands()
