import ApiService from "@/core/services/ApiService";
import ApiRequest from "@/core/requests/ApiRequest";
import axios, {AxiosInstance} from "axios";

let __axiosInstance: AxiosInstance | null = null;

function axiosInstance(): AxiosInstance {
    if (__axiosInstance === null) {
        __axiosInstance = axios.create({
            baseURL: ApiService.vueInstance.axios.defaults.baseURL,
            timeout: ApiService.vueInstance.axios.defaults.timeout,
            headers: {'Content-Type': 'multipart/form-data'}
        });
        ApiService.setHeader(__axiosInstance);
    }

    return __axiosInstance;
}

export class ApiPostFileRequest<T> extends ApiRequest<T> {
    private readonly _file: File | null;
    private readonly _data: any;
    constructor(api: string, file: File | null, data: any = undefined) {
        super(api);
        this._file = file;
        this._data = data;
    }
    process(): Promise<T> {

        const formData = new FormData();
        if (this._file !== null) {
            formData.append('file', this._file);
        }
        if (this._data !== undefined) {
            formData.append('data', JSON.stringify(this._data));
        }

        return new Promise<T>((resolve, reject) => {
            axiosInstance().post(this.api, formData)
                .then(({data}) => {
                    resolve(data);
                })
                .catch((err) => {
                    reject(err);
                })
                .finally(() => {
                    delete ApiService.vueInstance.axios.defaults.headers.post[
                        "Content-Type"
                        ];
                })
        });
    }

}


export class ApiPostFilesRequest<T> extends ApiRequest<T> {

    private readonly _files: File[] | null;
    private readonly _data: any;

    constructor(api: string, files: File[] | null, data: any = undefined) {
        super(api);
        this._files = files;
        this._data = data;
    }



    process(): Promise<T> {

        const formData = new FormData();
        if (this._files !== null) {
            for (let i = 0; i < this._files.length; ++i) {
                formData.append(`file${i + 1}`, this._files[i]);
            }
        }
        if (this._data !== undefined) {
            formData.append('data', JSON.stringify(this._data));
        }
        return new Promise<T>((resolve, reject) => {
            axiosInstance().post(this.api, formData)
                .then(({data}) => {
                    resolve(data);
                })
                .catch((err) => {
                    reject(err);
                })
                .finally(() => {
                    delete ApiService.vueInstance.axios.defaults.headers.post[
                        "Content-Type"
                        ];
                })
        });
    }

}
