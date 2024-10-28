import ApiPostRequest from "@/core/requests/ApiPostRequest";
import ClientError from "@/core/errors/ClientError";
import {GbUtils} from "@/core/utils/GbUtils";

export interface EndpointResponse<T> extends IEndpointResponse {
    payload: T;
}

export interface IEndpointResponse {
    state: string;
    mimetype?: string;
    file_name?: string;
}

export default class EndpointRequest<T> extends ApiPostRequest<T>{

    static __responseHooks: Map<string, ((response: IEndpointResponse) => void)> = new Map<string, (response: IEndpointResponse) => void>();

    constructor(data: any) {
        super(`endpoint`, data);
    }

    static async processUntil<U>(options: {
        command: string,
        stopCallback: (data: U) => boolean,
        requestPayload?: any,
        delay?: number
    }): Promise<U> {
        let iteration = 0;
        let response: U | undefined = undefined;
        do {
            if (iteration > 0 && options.delay !== undefined) {
                await GbUtils.sleep(options.delay);
            }
            response = await EndpointRequest.process2<U>(options.command, options.requestPayload);
            iteration++;
        } while (!options.stopCallback(response));
        if (response === undefined) {
            throw new ClientError(`Undefined response ${options.command}`);
        }
        return response;
    }

    static async process2<U>(command: string, requestPayload: any = null): Promise<U> {
        return await new EndpointRequest<EndpointResponse<U>>({
            id: command,
            payload: requestPayload
        }).process().then((response) => {
            for (const value of this.__responseHooks.values()){
                value(response);
            }
            if (response.file_name !== undefined) {
                const blob = new Blob([response.payload as string], { type: response.mimetype })
                const link = document.createElement('a')
                link.href = URL.createObjectURL(blob)
                link.download = response.file_name
                link.click()
                URL.revokeObjectURL(link.href)
            }
            return response.payload;
        });
    }

    static addResponseHook(id: string, callback: (response: IEndpointResponse) => void) {
        this.removeResponseHook(id);
        this.__responseHooks.set(id, callback);
    }

    static removeResponseHook(id: string) {
        if (this.__responseHooks.has(id)) {
            this.__responseHooks.delete(id);
        }
    }
}
