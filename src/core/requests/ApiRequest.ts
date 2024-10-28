export default class ApiRequest<T> {

    private _api: string;

    constructor(api: string) {
        this._api = api;
    }

    get api(): string {
        return this._api;
    }

    set api(value: string) {
        this._api = value;
    }

    process(): Promise<T> {
        throw new Error("Not implemented");
    }
}
