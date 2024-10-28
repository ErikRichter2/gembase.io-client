export interface SurveyData {
    group_id?: string;
    title?: string;
    first?: boolean;
    last?: boolean;
    redirect?: string;
    randomized?: boolean;
    view?: string;
    questions: Question[];
    concept_data?: ConceptData;
}

export interface Question {
    apps?: {icon: string, title: string}[];
    id: string;
    text: string;
    text_params?: object;
    validation: Validation;
    options: Option[];
    options_id: string;
    show_only_when_answer? : ShowOnlyWhenAnswer;
}

export interface Option {
    value: string;
    text: string;
    dcm_title?: string;
    dcm_features?: string[];
}


export interface Validation {
    type: string;
    max_checked: number;
    required?: boolean;
}

export interface ShowOnlyWhenAnswer {
    questions_group_id: string;
    question_id: string;
    option_id: string;
}

export interface ConceptData {
    title: string;
    desc: string;
    icon: string;
}

export interface SurveyConfig {
    id: string;
    guid: string;
    t: number;
    state: number;
    config: string;
}

export interface SurveyPreview {
    user_id: number;
    survey_config: string;
    survey_instance: string;
}


