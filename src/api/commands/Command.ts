import ApiPostRequest from "@/core/requests/ApiPostRequest";

export enum CommandState {
    Initial,
    Undo,
    Redo
}


export interface Error {
    id: number;
    message: string;
}

export interface CommandResponse {
    success: boolean;
    data: any;
}








export class Command {
    private _response: ((data: CommandResponse) => void) | null = null;
    private _onlySuccessResponse = true;
    protected _options: Options | null = null;

    setOptions(options: Options): Command {
        this._options = options;
        return this;
    }

    execute(): Promise<CommandResponse> {
        throw new Error("Not implemented");
    }

    dispatch(commandResponse: CommandResponse) {
        if (this._response !== null) {
            if (!this._onlySuccessResponse || commandResponse.success) {
                this._response(commandResponse);
            }
        }
    }

    onResponse(response: (data: CommandResponse) => void, onlySuccessResponse = true): Command {
        this._onlySuccessResponse = onlySuccessResponse;
        this._response = response;
        return this;
    }
}




export class OptionsItem {
}

export class ApiCommandOptions extends OptionsItem {
    apiRoot = "";
}

export class HandlersCommandOptions extends OptionsItem {
    progressHandler: ((progress: boolean) => void) | null = null;
    responseHandler: ((response: CommandResponse) => void) | null = null;
}

export class Options {
    private readonly _options: OptionsItem[] = [];

    add(options: OptionsItem) {
        this._options.push(options);
    }

    get<T extends OptionsItem>(ctor: new() => T): T | null {
        if (this._options === null || this._options.length === 0) {
            return null;
        }

        for (let i = 0; i < this._options.length; ++i) {
            if (this._options[i] instanceof ctor) {
                return this._options[i] as T;
            }
        }

        return null;
    }
}

export class BasePostCommand {
    private readonly id: string;
    private readonly payload: any;

    constructor(id: string, payload: any) {
        this.id = id;
        this.payload = payload;
    }

    protected request(): Promise<any> {
        return new ApiPostRequest<any>(`endpoint`, {id: this.id, payload: this.payload}).process();
    }

    async process(): Promise<any> {
        throw new Error("Not implemented");
    }
}


