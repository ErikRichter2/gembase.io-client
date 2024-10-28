import {IQueryData} from "@/core/router/query/QueryData";

export interface PortalStudiesDef {
    age: {
        id: string;
        from: number;
        to: number;
        label: string;
    }[];
    countries: {
        country_id: number;
        country: string;
        survey_cpi: number;
        name: string;
    }[];
    traits: {
        id: number;
        trait_id: string;
        name: string;
        study_default: number;
    }[];
}

export interface PortalStudiesStudy {
    guid: string;
    name: string;
    t: number;
    progress_perc: number;
    state: "edit" | "preparing" | "working" | "paused" | "done" | "error";
    audiences: PortalStudiesStudyAudience[];
    internal_respondents: number;
    dcm_concepts: PortalStudiesStudyDcmConcepts | null;
    global_study: number;
}

export interface PortalStudiesStudyDcmConcepts {
    headers: PortalStudiesStudyConceptHeader[];
    features: PortalStudiesStudyConceptFeaturePool[];
}

export interface PortalStudiesStudyConceptFeaturePool {
    pool_id: string;
    text: string;
}

export interface PortalStudiesStudyConceptHeader {
    title: string;
    description: string;
}

export interface PortalStudiesStudyAudience {
    guid: string;
    country_id: number;
    people: number;
    males: number;
    ages: {
        id: string;
        value: number;
    }[];
    traits: number[];
}

export interface PortalStudiesQuery extends IQueryData {
    study?: string;
    show?: "concepts";
}

export interface IConceptExample {
    title?: string;
    desc?: string;
    f1?: string;
    f2?: string;
}
