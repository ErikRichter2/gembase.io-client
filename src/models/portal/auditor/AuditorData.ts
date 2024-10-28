import {ref} from "vue";
import {IQueryData} from "@/core/router/query/QueryData";

export interface AuditorQueryParams extends IQueryData, ITagsDetailsQuery {
    audienceAngle?: string;
    opportunity?: string;
    show?: "audit";
    appId?: string
    labels?: string;
    rank1?: string;
    rank2?: string;
    rank3?: string;
}

export interface ITagsDetailsQuery extends IQueryData {
    labels?: string;
    rank1?: string;
    rank2?: string;
    rank3?: string;
}

export const tunerPopupState = ref(-1);
