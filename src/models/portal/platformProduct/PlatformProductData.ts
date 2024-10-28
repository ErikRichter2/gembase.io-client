import {TTagId} from "@/models/portal/apps/AppsData";
import {IPlatformProductNodeProvider} from "@/models/portal/competitor/PortalCompetitorData";
import {IPlatformCalcAudienceAngleStats} from "@/models/portal/calc/PlatformCalcData";

export interface TagsViewTagData extends IPlatformProductNodeProvider {
    readonly?: boolean;
    moduleLocked?: boolean;
    preventAudienceDetail?: boolean;
    threatsScore?: number;
    audience?: IPlatformCalcAudienceAngleStats;
    audienceElementId?: string;
    nodeElementId?: string;
    competitorsCnt?: number;
}

export interface IPlatformProductNode {
    tag_id: TTagId;
    category: string;
    subcategory: string;
    subcategory_client_name: string | null;
    subcategory_int: number;
    node: string;
    locked: number;
    wip?: number;
    can_change?: number;
    description?: string;
    hidden?: boolean;
    platform_mobile: number;
    platform_pc: number;
}

export interface PlatformProductDefData extends IPlatformProductNode {
    adj: string | null;
    is_survey: boolean;
}
