import {ITagId} from "@/models/portal/apps/AppsData";

export interface SurveyResultsTam {
    survey_guid: string;
    data: SurveyResultsTamTag[];
}

export interface SurveyResultsTamTag extends ITagId {
    tam: string;
    audience: string;
}
