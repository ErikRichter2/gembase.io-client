import ApiService from "@/core/services/ApiService";
import ApiRequest from "@/core/requests/ApiRequest";

export default class ApiGetRequest<T> extends ApiRequest<T> {

    private readonly _slug: string;

    constructor(api = "", slug = "") {
        super(api);
        this._slug = slug;
    }

    process(): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            ApiService.setHeader();
            ApiService.get2(this.api + this._slug)
                .then(({data}) => {
                    resolve(data);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }
}
