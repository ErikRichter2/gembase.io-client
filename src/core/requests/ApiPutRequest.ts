import ApiService from "@/core/services/ApiService";
import ApiRequest from "@/core/requests/ApiRequest";

export default class ApiPutRequest<T> extends ApiRequest<T> {
    private readonly _data: any;
    private readonly _headers: any;

    constructor(api: string, data: any = null, headers: any = null) {
        super(api);
        this._data = data;
    }
    process(): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            ApiService.setHeader();
            let data = {};
            if (this._data !== null) {
                data = this._data;
            }
            ApiService.put(this.api, {data: data, headers: this._headers})
                .then(({data}) => {
                    resolve(data);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }
}
