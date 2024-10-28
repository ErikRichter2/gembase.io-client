import {ApiCommandOptions, Command, CommandResponse} from "@/api/commands/Command";
import ApiRequest from "@/core/requests/ApiRequest";
import ServerError from "@/core/errors/ServerError";

export default class ApiCommand extends Command {
    private readonly _apiRequest: ApiRequest<any>;
    private _wasFirstExecute = false;

    constructor(apiRequest: ApiRequest<any>) {
        super();
        this._apiRequest = apiRequest;
    }

    beforeFirstExecute() {
        if (this._wasFirstExecute) {
            return;
        }
        this._wasFirstExecute = true;
        const o = this._options?.get(ApiCommandOptions);
        if (o !== undefined && o !== null) {
            this._apiRequest.api = o.apiRoot + this._apiRequest.api;
        }
    }

    execute(): Promise<CommandResponse> {
        this.beforeFirstExecute();
        return new Promise<CommandResponse>((resolve, reject) => {
            this._apiRequest.process()
                .then(response => {
                    resolve({success: true, data: response.data})
                })
                .catch((response: ServerError) => {
                    reject({success: false, data: response})
                });
        });
    }
}
