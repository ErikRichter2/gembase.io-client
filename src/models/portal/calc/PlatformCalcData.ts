import {
    AppStoreEnum,
    IAppIcon,
    IAppStore,
    TagDetail,
    TAppId,
    TDeveloperId,
    TTagId
} from "@/models/portal/apps/AppsData";
import {
    AdvancedFilterData,
} from "@/models/portal/competitor/PortalCompetitorData";
import {PlatformCalcRequestToken} from "@/models/portal/calc/PlatformCalcRequestToken";

export type TAudienceAngleId = string;

export enum EPlatformValuesCalcType {
    CALC_AUDIENCES_ANGLES = "audiences_angles",
    CALC_COMPETITORS_FOR_AUDIENCE_ANGLE = "competitors_for_audience_angle",
    CALC_PRODUCT_NODES_AUDIENCES_TS = "product_nodes_audiences_ts",
    CALC_GAPS_SEARCH_OPPORTUNITIES = "gaps_search_opportunities"
}

export interface IPlatformValuesCalcProgressData {
    state: string;
    progress: number;
    p?: number;
    l?: number;
    t?: number;
}

export type IPlatformCalcResponseState = "queue" | "working" | "done" | "error";

export interface IPlatformCalcResponseBase {
    metadata: {
        state: IPlatformCalcResponseState;
        error_code?: "not_found";
        hash_key: number;
        platform_id: number;
    }
    payload?: object;
}

export interface IPlatformCalcResponse<SERVICE_DATA> extends IPlatformCalcResponseBase {
    payload?: {
        progress_data?: IPlatformValuesCalcProgressData;
        result_data?: SERVICE_DATA;
    }
}

export interface IPlatformCallback<SERVICE_DATA> {
    response: IPlatformCalcResponse<SERVICE_DATA>;
    serviceRequest: IPlatformCalcServiceRequest;
}

export interface IPlatformCalcServiceRequest {
    cached: boolean;
    calcOptions: IPlatformCalcOptions<object>;
    serverHashKey: number;
    requestGuid: string;
}

export interface IResponseCallbackOptions<T> {
    done?: (response: IPlatformCallback<T>) => void,
    error?: (response: IPlatformCallback<T>) => void,
    progress?: (response: IPlatformCallback<T>) => void,
    finally?: () => void,
}

export interface IPlatformCalcOptions<T> {
    context: string,
    requestToken?: PlatformCalcRequestToken,
    responseCallback?: IResponseCallbackOptions<T>,
    input: object
}

export interface IPlatformCalcAudienceAngleStats {
    survey_loved_cnt: number;
    survey_total_cnt: number;
    survey_rejected_cnt: number;
    max_audience: number;
    loved_ratio: number;
    loved_absolute: number;
    rejected_ratio: number;
    rejected_absolute: number;
    loyal_ratio: number;
    loyal_absolute: number;
    total_audience: number;
    total_audience_ratio: number;
    no_data?: boolean;
    locked?: boolean;
    app_platforms: {
        tag_ids: TTagId[]
    }
    admin_data: {
        loved_survey_cnt: number,
        total_survey_cnt: number,
        rejected_survey_cnt: number,
        potential_downloads: number,
        loyalty_installs: number,
        loved_ratio_ext: number,
        rejected_ratio_ext: number,
        rejected_ratio_final: number,
        installs: number,
        survey_rejected_cnt_hack: number,
        min_rejected_survey_cnt: number,
        max_rejected_survey_cnt: number
    } | null;
}

export interface IPlatformCalcAudienceAngleDetail {
    row_id: number;
    audience_angle_id: TAudienceAngleId;
    audience_stats: IPlatformCalcAudienceAngleStats;
    age_interval: {
        from: number;
        to: number;
        group_name: string;
    },
    female: number;
    gender_ratio: number;
    ltv: number;
    loved_cnt: number;
    country: string;
    tam: number;
    tag_ids: TTagId[];
    top_behaviors?: {
        tag_ids: TTagId[];
    };
    locked?: boolean;
}

export interface IPlatformCalcAudienceAngle extends IPlatformCalcAudienceAngleDetail {
    platform_id: number;
}

export enum EDiscountGroup {
    Quality = "calc_qua_angle",
    Revenues = "calc_rev",
    Experience = "calc_exp"
}

export interface IPlatformCalcCompetitorsDiscount {
    gr: EDiscountGroup;
    ts_perc: number;
    ts_raw: number;
    c: TsColor;
    locked?: boolean;
}

export interface IPlatformCalcCompetitorsAppDetail extends IAppIcon, IAppStore {
    app_id: TAppId;
    app_id_in_store: string;
    app_store_url: string;
    title: string;
    platform: number;
    tag_ids?: TTagId[];
    locked: boolean;
}

export enum ETsGroup {
    Similar = "similar",
    Size = "size",
    Growth = "growth",
    Trend = "trend",
    Quality = "quality",
    TAM = "tam"
}

export enum TsColor {
    Red = "r",
    Green = "g",
    Neutral = ""
}

export interface IPlatformCalcCompetitorsTsGroup {
    gr: ETsGroup;
    ts_raw: number;
    ts_perc: number;
    ts_name?: string;
    c: TsColor;
    released?: number;
    rating?: number;
    installs?: number;
    growth?: number;
    tam?: number;
    raw_val: number;
}

export interface IPlatformCalcCompetitorsTs {
    app_id: TAppId;
    ts: number;
    ts_groups?: IPlatformCalcCompetitorsTsGroup[];
    locked?: boolean;
    quality?: number;
    growth?: number;
    novelty?: number;
}

export interface IPlatformCalcCompetitorsMedianPerTsGroup {
    gr: ETsGroup;
    m: number;
    n: string;
}

export interface IPlatformCalcCompetitors {
    platform_id: number;
    discounts?: IPlatformCalcCompetitorsDiscount[];
    company_title?: string;
    qua_full?: number;
    quality_portfolio?: number;
    competitor_apps_details?: IPlatformCalcCompetitorsAppDetail[];
    audience_detail?: IPlatformCalcAudienceAngleDetail;
    competitors_count: number;
    ts_items?: IPlatformCalcCompetitorsTs[];
    median_per_ts_group?: IPlatformCalcCompetitorsMedianPerTsGroup[];
    competitors_pool_cnt: number;
    ts: number;
}

export interface IPlatformCalcAffinity {
    uuid: string,
    locked?: boolean,
    affinity: {
        tag_id: TTagId
    },
    input_tags?: TagDetail[],
    audience_angle_id: string,
    ts?: number,
    tam: number,
    audience_stats: IPlatformCalcAudienceAngleStats,
    cnt?: number
}

export interface IPlatformCalcAffinities {
    platform_id: number;
    data: IPlatformCalcAffinity[];
}

export interface IAudienceAnglesInputOptions {
    dev_id?: TDeveloperId,
    tag_details?: TagDetail[],
    include_angle?: {
        audience_angle_id?: TAudienceAngleId
    },
    exclusive_angle?: {
        audience_angle_id?: TAudienceAngleId
    },
}

export interface IAudienceAnglesOptions extends IPlatformCalcOptions<IPlatformCalcAudienceAngle[]> {
    appId?: TAppId,
    opportunity?: string,
    input: IAudienceAnglesInputOptions
}

export interface ICompetitorsInputDataOptions {
    dev_id?: TDeveloperId,
    app_id?: TAppId,
    tag_details?: TagDetail[],
    tier?: number,
    growth?: number,
    audience_angle_row_id?: number,
    advanced_filter?: AdvancedFilterData,
    exclude_apps_from_competitors?: {
        app_ids: TAppId[]
    },
    store?: AppStoreEnum
}

export interface ICompetitorsForAngleOptions extends IPlatformCalcOptions<IPlatformCalcCompetitors> {
    input: ICompetitorsInputDataOptions
}

export interface ICompetitorsOptions extends IPlatformCalcOptions<IPlatformCalcCompetitors> {
    opportunity?: string,
    input: ICompetitorsInputDataOptions & IAudienceAnglesInputOptions
}

export interface IProductNodesAudiencesTsOptionsInput {
    dev_id?: TDeveloperId,
    app_id?: TAppId,
    tag_details?: TagDetail[],
    tier?: number,
    growth?: number,
    store?: number;
    exclude_apps_from_competitors?: {
        app_ids: TAppId[]
    }
}

export interface IProductNodesAudiencesTsOptions extends IPlatformCalcOptions<IPlatformCalcAffinities> {
    input: IProductNodesAudiencesTsOptionsInput
}

export interface ISearchOpportunitiesOptions extends IPlatformCalcOptions<IPlatformCalcAffinities> {
    input: {
        tag_details?: TagDetail[],
    }
}

export type TPlatformCalcViewType = "auditor" | "gaps" | "gamesExplorer" | "playerExplorer";

export interface IPlatformCalcViewInput {
    type: TPlatformCalcViewType,
    devId?: TDeveloperId,
    appId?: TAppId,
    tags: TagDetail[],
    lovedTags?: TTagId[],
    tier?: number,
    growth?: number
}
