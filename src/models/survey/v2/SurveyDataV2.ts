import ClientError from "@/core/errors/ClientError";
import GembaseUtils from "@/utils/GembaseUtils";
import {Ref} from "vue";

export class SurveyServerRequestController {
    private __lock = false;
    private __timeTracking = {};
    private readonly __dataLoadingState: Ref<string>;

    constructor(dataLoadingState: Ref<string>) {
        this.__dataLoadingState = dataLoadingState;
    }

    async submit(data: object, timeTracking: object) {
        if (this.__lock) {
            return;
        }

        window.scrollTo(0,0);

        this.__lock = true;
        this.__dataLoadingState.value = "fade-out";
        await GembaseUtils.sleep(500);
        await this.submitInternal(data);
        this.__dataLoadingState.value = "fade-in";
        await GembaseUtils.sleep(500);
        this.__lock = false;
    }

    async refreshPage() {
        if (this.__lock) {
            return;
        }

        window.scrollTo(0,0);

        this.__lock = true;
        this.__dataLoadingState.value = "fade-out";
        await GembaseUtils.sleep(500);
        await this.refreshPageInternal();
        this.__dataLoadingState.value = "fade-in";
        await GembaseUtils.sleep(500);
        this.__lock = false;
    }

    async submitInternal(data: any) {
        // do nothing
    }

    async refreshPageInternal() {

    }

    async setLang(lang: string) {

    }
}

export interface SurveyViewData {
    guid: string;
    view?: SurveyViewController;
    server_data?: SurveyServerData;
    translate: SurveyTranslateController;
    serverController: SurveyServerRequestController;
}

export interface SurveyServerData {
    recaptcha?: {
        state: string;
        error_message?: string;
    }
    config_data: SurveyServerConfigData;
    client_data: any;
    progress_data: {
        current: number;
        total: number;
    }
    lang?: string;
}

export interface SurveyServerConfigData {
    id: string;
    end_type?: string;
    config_type?: string;
    template?: string;
    redirect?: string;
}

export interface SurveyServerDefaultConfigData extends SurveyServerConfigData {
    title?: string;
    subtitle?: string;
    answers_error?: string;
    title_genre?: string;
    title_topic?: string;
    split_to_pages?: number;
    sections: SurveyServerDefaultSectionData[];
    title_app?: {
        icon: string,
        title: string
    }
}

export interface SurveyServerConceptsDcmConfigData {
    id: number;
    title: string;
    description: string;
    feature_1: string;
    feature_2: string;
}

export interface SurveyServerGenreDcmConfigData {
    id: string;
    index: number;
    genres: string[];
    choices: SurveyServerGenreDcmChoiceConfigData[];
}

export interface SurveyServerTopicDcmConfigData {
    id: string;
    index: number;
    topic: string;
    choices: SurveyServerTopicDcmChoiceConfigData[];
}

export interface SurveyServerTopicDcmChoiceConfigData {
    id: string;
    items: string[];
}

export interface SurveyServerGenreDcmChoiceConfigData {
    id: string;
    text: string;
}

export interface SurveyServerDefaultSectionData {
    id: string;
    title?: string;
    icon?: string;
    apps_data?: SurveyServerSectionAppsData[];
    answers_group?: SurveyServerDefaultAnswerGroupData;
}

export interface SurveyServerDefaultAnswerGroupData {
    type: AnswerGroupTypeEnum;
    check_answers_count?: number;
    check_answers_min_count?: number;
    check_answers_max_count?: number;
    answers: SurveyServerSectionDefaultAnswerData[];
    genres_dcm?: SurveyServerGenreDcmConfigData;
    topics_dcm?: SurveyServerTopicDcmConfigData;
    concepts_dcm?: {
        index: number;
        choices: SurveyServerConceptsDcmConfigData[];
    };
}

export interface SurveyServerSectionAppsData {
    id: string;
    title: string;
    icon: string;
}

export interface SurveyServerSectionDefaultAnswerData {
    id: string;
    text: string;
    from?: number;
    to?: number;
}

export enum AnswerGroupTypeEnum {
    RADIO = "radio",
    CHECK = "check",
    TEXT = "text",
    APP_SEARCH = "app_search"
}

export interface SurveyTextsData {
    translations: SurveyTextTranslationData[];
    params: SurveyTextParamsData[];
}

export interface SurveyTextTranslationData {
    id: string;
    EN: string;
    DE: string;
}

export interface SurveyTextParamsData {
    param: string;
    text: string;
}

export interface TextAnswerData {
    id: string;
    text: string;
}

export class SurveyTranslateController {
    private __data: SurveyTextsData | null = null;
    private __lang = "EN";

    get hasData(): boolean {
        return this.__data !== null;
    }

    setData(textsData: SurveyTextsData) {
        this.__data = textsData;
    }

    setLang(lang: string) {
        this.__lang = lang;
    }

    translate(code: string | undefined, params: (string | undefined)[] | null = null): string {
        const d = this.__data?.translations as SurveyTextTranslationData[];
        for (let i = 0; i < d.length; ++i) {
            if (d[i].id === code) {
                if (this.__lang in d[i]) {
                    let t: string = d[i][this.__lang];
                    if (params !== null) {
                        for (let j = 0; j < params.length; j += 2) {
                            const r1 = `[[${params[j] as string}]]`;
                            if (t.includes(r1)) {
                                const r2 = this.translate(params[j + 1], params);
                                while (t.includes(r1)) {
                                    t = t.replace(r1, r2);
                                }
                            }
                        }
                    }

                    const p = this.__data?.params as SurveyTextParamsData[];
                    for (let j = 0; j < p.length; ++j) {
                        const r1 = `[[${p[j].param}]]`;
                        if (t.includes(r1)) {
                            const r2 = this.translate(p[j].text, params);
                            while (t.includes(r1)) {
                                t = t.replace(r1, r2);
                            }
                        }
                    }

                    return t;
                }
            }
        }

        if (code === undefined) {
            return "";
        }

        return code;
    }
}

export class SurveyViewController {
    protected readonly __serverController: SurveyServerRequestController;
    private readonly __serverData: SurveyServerData;

    static create(serverController: SurveyServerRequestController, serverData: SurveyServerData): SurveyViewController {
        const c = new SurveyViewDefaultController(serverController, serverData);
        c.init();
        return c;
    }

    constructor(serverController: SurveyServerRequestController, serverData: SurveyServerData) {
        this.__serverController = serverController;
        this.__serverData = serverData;
    }

    get id(): string {
        return this.__serverData?.config_data.id as string;
    }

    get serverData(): SurveyServerData {
        return this.__serverData as SurveyServerData;
    }

    init() {
        // do nothing
    }

    next() {
        // do nothing
    }

    validate(): boolean {
        return true;
    }

    get isNextVisible(): boolean {
        return false;
    }

    public createServerResponse(): any {
        const serverResponse = {};
        this.createServerResponseInternal(serverResponse);
        return serverResponse;
    }

    protected createServerResponseInternal(serverResponse: any) {
        // do nothing
    }
}

export class SurveyViewDefaultController extends SurveyViewController {

    private __answerGroups: SurveyAnswerGroupController[] = [];

    public sectionPages = 0;
    public sectionPage = 0;

    init() {
        const configData = this.serverData.config_data as SurveyServerDefaultConfigData;

        this.sectionPage = 0;
        this.sectionPages = 0;

        if (configData.split_to_pages !== undefined) {
            this.sectionPage = 1;
            this.sectionPages = configData.split_to_pages;
        }

        if (configData.sections !== undefined) {
            for (let i = 0; i < configData.sections.length; ++i) {
                if (configData.sections[i].answers_group !== undefined) {
                    const answerGroup = configData.sections[i].answers_group;
                    if (answerGroup !== undefined) {
                        if (answerGroup.type === AnswerGroupTypeEnum.RADIO) {
                            const gr = new SurveyAnswerRadioGroupController(configData.sections[i], this);
                            this.__answerGroups.push(gr);
                        }
                        else if (answerGroup.type === AnswerGroupTypeEnum.CHECK) {
                            const gr = new SurveyAnswerCheckGroupController(configData.sections[i], this);
                            this.__answerGroups.push(gr);
                        }
                        else if (answerGroup.type === AnswerGroupTypeEnum.TEXT) {
                            const gr = new SurveyAnswerTextController(configData.sections[i], this);
                            this.__answerGroups.push(gr);
                        }
                        else if (answerGroup.type === AnswerGroupTypeEnum.APP_SEARCH) {
                            const gr = new SurveyAnswerAppSearchController(configData.sections[i], this);
                            this.__answerGroups.push(gr);
                        }
                    }
                }
            }
        }

        for (let i = 0; i < this.__answerGroups.length; ++i) {
            this.__answerGroups[i].init();
        }
    }

    validate(): boolean {
        for (let i = 0; i < this.__answerGroups.length; ++i) {
            if (!this.__answerGroups[i].isAnswered) {
                this.__answerGroups[i].showError();
                return false;
            }
        }
        return true;
    }

    next() {
        if (this.sectionPages !== 0) {
            if (this.sectionPage < this.sectionPages) {
                const cnt = Math.ceil(this.__answerGroups.length / this.sectionPages);
                const ifrom = cnt * (this.sectionPage - 1);
                const ito = Math.min(ifrom + cnt, this.__answerGroups.length);
                let isOk = true;
                for (let i = ifrom; i < ito; ++i) {
                    if (!this.__answerGroups[i].isAnswered) {
                        isOk = false;
                        this.__answerGroups[i].showError();
                        break;
                    }
                }
                if (isOk) {
                    this.sectionPage += 1;
                    this.__serverController.refreshPage();
                    return;
                } else {
                    this
                }
            }
        }

        if (this.validate()) {
            this.__serverController.submit(this.createServerResponse(), {});
        }
    }

    get isNextVisible(): boolean {
        if (this.__answerGroups.length === 0) {
            return true;
        }
        if (this.__answerGroups.length > 1) {
            return true;
        }
        for (let i = 0; i < this.__answerGroups.length; ++i) {
            if (this.__answerGroups[i].isNextVisible) {
                return true;
            }
        }
        return false;
    }

    getAnswerGroup(sectionId: string): SurveyAnswerGroupController {
        for (let i = 0; i < this.__answerGroups.length; ++i) {
            if (this.__answerGroups[i].data.id === sectionId) {
                return this.__answerGroups[i];
            }
        }
        throw new ClientError(`Section not found. Id: ${sectionId}`);
    }

    onChildAnswered(child: SurveyAnswerGroupController) {
        this.refreshState();
        const nextGr = this.getNextUnansweredGroup(child.data.id);
        if (nextGr !== null) {
            if (nextGr !== child) {
                const el = document.getElementById(nextGr.data.id);
                el?.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            let isAnsweredFull = true;
            for (let i = 0; i < this.__answerGroups.length; ++i) {
                if (!this.__answerGroups[i].isAnsweredFull) {
                    isAnsweredFull = false;
                    break
                }
            }
            if (isAnsweredFull) {
                if (!this.isNextVisible) {
                    this.next();
                } else {
                    const nextEl = document.getElementById("next_btn");
                    nextEl?.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    }

    refreshState() {
        for (let i = 0; i < this.__answerGroups.length; ++i) {
            const gr = this.__answerGroups[i];
            gr.refreshState();
            const el = document.getElementById(gr.data.id);
            if (el !== null) {
                const val = gr.isAnsweredFull ? "true": "false";
                el.setAttribute("data-question-fade", val);
                const elements = el.querySelectorAll("[data-question-fade]");
                for (let i = 0; i < elements.length; ++i) {
                    elements[i].setAttribute("data-question-fade", val);
                }
            }
        }
    }

    getNextUnansweredGroup(fromId: string | null = null): SurveyAnswerGroupController | null {

        if (fromId !== null) {
            let fromIndex = -1;
            for (let i = 0; i < this.__answerGroups.length; ++i) {
                const gr = this.__answerGroups[i];
                if (gr.data.id === fromId) {
                    fromIndex = i + 1;
                    break;
                }
            }

            if (fromIndex != -1) {
                for (let i = fromIndex; i < this.__answerGroups.length; ++i) {
                    const gr = this.__answerGroups[i];
                    if (!gr.isAnswered) {
                        return gr;
                    }
                }
            }
        }

        for (let i = 0; i < this.__answerGroups.length; ++i) {
            const gr = this.__answerGroups[i];
            if (!gr.isAnswered) {
                return gr;
            }
        }

        return null;
    }

    protected createServerResponseInternal(serverResponse: any) {
        for (let i = 0; i < this.__answerGroups.length; ++i) {
            this.__answerGroups[i].createServerResponseInternal(serverResponse);
        }
    }
}

export class SurveyAnswerGroupController {
    private readonly __data: SurveyServerDefaultSectionData;
    private readonly __view: SurveyViewDefaultController;

    constructor(data: SurveyServerDefaultSectionData, view: SurveyViewDefaultController) {
        this.__data = data;
        this.__view = view;
    }

    init() {
        // do nothing
    }

    get data(): SurveyServerDefaultSectionData {
        return this.__data as SurveyServerDefaultSectionData;
    }

    get view(): SurveyViewDefaultController {
        return this.__view as SurveyViewDefaultController;
    }

    showError() {
        // do nothing
    }

    refreshState() {
        // do nothing
    }

    get isAnswered(): boolean {
        return false;
    }

    get isAnsweredFull(): boolean {
        return this.isAnswered;
    }

    answer(value: any) {
        // do nothing
    }

    public createServerResponseInternal(serverResponse: any) {
        // do nothing
    }

    get isNextVisible(): boolean {
        return false;
    }
}

export class SurveyAnswerRadioGroupController extends SurveyAnswerGroupController {
    private __selectedAnswerId: string | null = null;

    init() {
        if (this.view.serverData.client_data !== null) {
            if (this.data.id in this.view.serverData.client_data) {
                this.__selectedAnswerId = this.view.serverData.client_data[this.data.id];
            }
        }
    }

    answer(value: any) {
        this.__selectedAnswerId = value as string;
        this.refreshState();
        this.view.onChildAnswered(this);
    }

    get isAnswered(): boolean {
        return this.__selectedAnswerId !== null;
    }

    public createServerResponseInternal(serverResponse: any) {
        serverResponse[this.data.id] = this.__selectedAnswerId;
    }

    public async showError() {
        const el = document.getElementById(this.data.id);
        if (el !== null) {
            el.scrollIntoView({ behavior: 'smooth' });
            el.setAttribute("data-error", "true");
            await GembaseUtils.sleep(3000);
            el.setAttribute("data-error", "false");
        }
    }

    public refreshState() {
        const el = document.getElementById(this.data.id);
        if (el !== null) {
            let elements = el.querySelectorAll("[data-checked]");
            for (let i = 0; i < elements.length; ++i) {
                elements[i].setAttribute("data-checked", "false");
            }
            const checkedEl = el.querySelector(`[data-answer-id='${this.__selectedAnswerId}']`);
            if (checkedEl !== null) {
                checkedEl.setAttribute("data-checked", "true");
                elements = checkedEl.querySelectorAll("[data-checked]");
                for (let i = 0; i < elements.length; ++i) {
                    elements[i].setAttribute("data-checked", "true");
                }
            }
        }
    }
}

export class SurveyAnswerCheckGroupController extends SurveyAnswerGroupController {
    private __selectedAnswerIds: string[] = [];

    init() {
        if (this.view.serverData.client_data !== null) {
            if (this.data.id in this.view.serverData.client_data) {
                this.__selectedAnswerIds = this.view.serverData.client_data[this.data.id];
            }
        }
    }

    answer(value: any) {
        const v = value as string;
        if (this.__selectedAnswerIds.includes(v)) {
            this.__selectedAnswerIds.splice(this.__selectedAnswerIds.indexOf(v), 1);
        } else {
            if (this.__selectedAnswerIds.length + 1 > this.maxAnswerCount) {
                this.showError();
                return;
            }
            this.__selectedAnswerIds.push(v);
        }
        this.refreshState();
        this.view.onChildAnswered(this);
    }

    get isAnsweredFull(): boolean {
        return this.__selectedAnswerIds.length >= this.maxAnswerCount;
    }

    get minAnswerCount(): number {
        if (this.data.answers_group?.check_answers_min_count !== undefined) {
            return this.data.answers_group?.check_answers_min_count as number;
        } else if (this.data.answers_group?.check_answers_count !== undefined) {
            return this.data.answers_group?.check_answers_count as number;
        }

        return 1;
    }

    get maxAnswerCount(): number {
        const max = this.data.answers_group?.answers.length as number;

        let d = -1;
        if (this.data.answers_group?.check_answers_max_count !== undefined) {
            d = this.data.answers_group?.check_answers_max_count as number;
        } else if (this.data.answers_group?.check_answers_count !== undefined) {
            d = this.data.answers_group?.check_answers_count as number;
        }

        return Math.min(d, max);
    }

    get isAnswered(): boolean {
        return (
            this.__selectedAnswerIds.length >= this.minAnswerCount &&
            this.__selectedAnswerIds.length <= this.maxAnswerCount)
    }

    public createServerResponseInternal(serverResponse: any) {
        serverResponse[this.data.id] = this.__selectedAnswerIds;
    }

    public async showError() {
        const el = document.getElementById(this.data.id);
        if (el !== null) {
            el.scrollIntoView({ behavior: 'smooth' });
            el.setAttribute("data-error", "true");
            await GembaseUtils.sleep(3000);
            el.setAttribute("data-error", "false");
        }
    }

    public refreshState() {
        const el = document.getElementById(this.data.id);
        if (el !== null) {
            let elements = el.querySelectorAll("[data-checked]");
            for (let i = 0; i < elements.length; ++i) {
                elements[i].setAttribute("data-checked", "false");
            }
            for (let i = 0; i < this.__selectedAnswerIds.length; ++i) {
                const answerId = this.__selectedAnswerIds[i];
                const checkedEl = el.querySelector(`[data-answer-id='${answerId}']`);
                if (checkedEl !== null) {
                    checkedEl.setAttribute("data-checked", "true");
                    elements = checkedEl.querySelectorAll("[data-checked]");
                    for (let i = 0; i < elements.length; ++i) {
                        elements[i].setAttribute("data-checked", "true");
                    }
                }
            }
        }
    }

    get isNextVisible(): boolean {
        return true;
    }
}

export class SurveyAnswerTextController extends SurveyAnswerGroupController {
    private __answer: TextAnswerData | null = null;

    init() {
        if (this.view.serverData.client_data !== null) {
            if (this.data.id in this.view.serverData.client_data) {
                this.__answer = this.view.serverData.client_data[this.data.id];
            }
        }
    }

    answer(value: any) {
        this.__answer = value as TextAnswerData;
        this.refreshState();
        this.view.onChildAnswered(this);
    }

    get isAnswered(): boolean {
        return this.__answer !== null && this.__answer.text !== "";
    }

    public createServerResponseInternal(serverResponse: any) {
        serverResponse[this.data.id] = this.__answer;
    }

    public async showError() {
        const el = document.getElementById(this.data.id);
        if (el !== null) {
            el.scrollIntoView({ behavior: 'smooth' });
            el.setAttribute("data-error", "true");
            await GembaseUtils.sleep(3000);
            el.setAttribute("data-error", "false");
        }
    }

    public refreshState() {
        const el = document.getElementById(this.data.id);
        if (el !== null && this.__answer !== null) {
            const answerId = this.__answer.id;
            const inputEl = el.querySelector(`[data-answer-id='${answerId}']`);
            if (inputEl !== null) {
                (inputEl as HTMLInputElement).value = this.__answer.text;
            }
        }
    }

    get isNextVisible(): boolean {
        return true;
    }
}

export class SurveyAnswerAppSearchController extends SurveyAnswerGroupController {
    private __answer: string | null = null;

    init() {
        if (this.view.serverData.client_data !== null) {
            if (this.data.id in this.view.serverData.client_data) {
                this.__answer = this.view.serverData.client_data[this.data.id];
            }
        }
    }

    answer(value: any) {
        this.__answer = value as string;
        this.refreshState();
        this.view.onChildAnswered(this);
    }

    get isAnswered(): boolean {
        return this.__answer !== null && this.__answer !== "";
    }

    public createServerResponseInternal(serverResponse: any) {
        serverResponse[this.data.id] = this.__answer;
    }

    public async showError() {
        const el = document.getElementById(this.data.id);
        if (el !== null) {
            el.scrollIntoView({ behavior: 'smooth' });
            el.setAttribute("data-error", "true");
            await GembaseUtils.sleep(3000);
            el.setAttribute("data-error", "false");
        }
    }

    get isNextVisible(): boolean {
        return false;
    }
}
