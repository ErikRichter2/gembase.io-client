import {IPlatformProductNode} from "@/models/portal/platformProduct/PlatformProductData";
import {AppDetail, AppStoreEnum, TAppId, TTagId, TagDetail} from "@/models/portal/apps/AppsData";
import {
    IPlatformCalcAudienceAngleStats,
    IPlatformCalcCompetitors
} from "@/models/portal/calc/PlatformCalcData";

export interface IPlatformProductNodeProvider {
    tagDef: IPlatformProductNode;
}

export interface AudienceTooltip {
    lovedTags: TTagId[];
    hatedTags: TTagId[];
    audienceAngleId: string;
    audienceStats: IPlatformCalcAudienceAngleStats;
}

export interface TooltipDataV2 {
    competitors?: IPlatformCalcCompetitors,
    appDetail?: AppDetail,
    appTags?: TagDetail[],
    singleAppCompetitor?: TAppId
}

export enum SearchSortEnum {
    ThreatScore = "THREAT_SCORE",
    Similarity = "SIMILARITY",
    Installs = "INSTALLS",
    TAM = "TAM",
    Growth = "GROWTH",
    Novelty = "NOVELTY",
    Quality = "QUALITY"
}

export interface SearchWeight {
    subcategory_int: number;
    weight: number;
}

export interface InstallTier {
    store_id: number;
    tier: number;
    value_from: number;
    value_to: number;
}

export interface AdvancedFilterData {
    stores: AppStoreEnum[];
    current_store: boolean;
    weights: SearchWeight[];
    sorting?: SearchSortEnum;
    top_competitors: number;
}
