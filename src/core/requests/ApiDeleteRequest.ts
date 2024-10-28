import ApiService from "@/core/services/ApiService";
import ApiRequest from "@/core/requests/ApiRequest";

export default class ApiDeleteRequest<T> extends ApiRequest<T> {
    process(): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            ApiService.setHeader();
            ApiService.delete(this.api)
                .then(({data}) => {
                    resolve(data);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }
}
