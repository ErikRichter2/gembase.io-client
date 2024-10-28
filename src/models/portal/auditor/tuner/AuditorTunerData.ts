import {TagDetail, TTagId} from "@/models/portal/apps/AppsData";
import {IPlatformCalcCompetitors} from "@/models/portal/calc/PlatformCalcData";

export interface AuditorTunerHistory {
    items: AuditorTunerHistoryItem[];
    audienceDiff?: number;
    audienceTitle?: string;
    tsDiff?: number;
    tsTitle?: string;
}

export interface AuditorTunerHistoryItem {
    tagId: TTagId | undefined;
    tags: TagDetail[];
    competitors?: IPlatformCalcCompetitors;
    ts?: number;
    audienceTitle?: string;
    tsTitle?: string;
    diff_audience?: number;
    diff_ts?: number;
    calcRequestGuid: string;
}
