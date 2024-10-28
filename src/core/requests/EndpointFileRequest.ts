import {ApiPostFileRequest, ApiPostFilesRequest} from "@/core/requests/ApiPostFileRequest";
import {EndpointResponse} from "@/core/requests/EndpointRequest";

export class EndpointFileRequest<T> extends ApiPostFileRequest<T>{
    constructor(file: File | null, data: any = undefined) {
        super(`endpoint/file`, file, data);
    }

    static process<U>(command: string, file: File | null, payload: any = undefined): Promise<U> {
        return new EndpointFileRequest<U>(file, {id: command, payload: payload}).process();
    }
}

export class EndpointFilesRequest<T> extends ApiPostFilesRequest<T>{
    constructor(files: File[] | null, data: any = undefined) {
        super(`endpoint/files`, files, data);
    }

    static process<U>(command: string, files: File[] | null, payload: any = undefined): Promise<U> {
        return new EndpointFilesRequest<U>(files, {id: command, payload: payload}).process();
    }

    static async process2<U>(command: string, files: File[] | null, payload: any = undefined): Promise<U> {
        return await new EndpointFilesRequest<EndpointResponse<U>>(files, {
            id: command,
            payload: payload
        }).process().then((response) => {
            return response.payload;
        });
    }
}
