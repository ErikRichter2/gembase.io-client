export default class SurveyTranslator {

    private _surveyLangData = {}

    setLangData(surveyLangData) {
        this._surveyLangData = surveyLangData;
    }

    private internalTranslate(t: string): string {
        while (t.includes('SV')) {
            const i = t.indexOf('SV');
            const c = t.substring(i, i + 5);
            if (c in this._surveyLangData) {
                t = t.replace(c, this._surveyLangData[c]);
            } else {
                t = t.replace(c, "???");
            }
        }
        return t;
    }

    translate(text: string | undefined, text_params: object | undefined = undefined): string {
        if (text === undefined || text === null) {
            return "";
        }

        let t = text as string;

        t = this.internalTranslate(t);

        if (text_params !== undefined) {
            for (const key in text_params) {
                while (t.includes("{{" + key + "}}")) {
                    t = t.replace("{{" + key + "}}", text_params[key]);
                }
            }
        }

        t = this.internalTranslate(t);

        return t;
    }
}