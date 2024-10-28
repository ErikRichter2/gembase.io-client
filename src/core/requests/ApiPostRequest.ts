import ApiService from "@/core/services/ApiService";
import ApiRequest from "@/core/requests/ApiRequest";

export default class ApiPostRequest<T> extends ApiRequest<T> {
    private readonly _data: any;
    constructor(api: string, data: any = null) {
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
            ApiService.post(this.api, {data: data})
                .then(({data}) => {
                    resolve(data);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

}
