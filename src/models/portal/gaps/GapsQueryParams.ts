import {ITagsDetailsQuery} from "@/models/portal/auditor/AuditorData";
import {IQueryData} from "@/core/router/query/QueryData";

export interface GapsQueryParams extends IQueryData, ITagsDetailsQuery {
    show?: "results";
    labels?: string;
    rank1?: string;
    rank2?: string;
    rank3?: string;
}
