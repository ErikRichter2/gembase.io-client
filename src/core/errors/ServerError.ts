import {AxiosError} from "axios";

export default class ServerError {
    id?: string;
    module?: string;
    message?: string;
    call_stack?: string;
    last_command_id?: string;
    is_public?: boolean;
    is_default?: boolean;

    static tryParse(data: unknown): ServerError | null {
        if (typeof data === "object") {
            let obj = data as object;

            if (obj instanceof ServerError) {
                return obj as ServerError;
            }

            if (obj instanceof AxiosError) {
                const axiosError = obj as AxiosError;
                if (axiosError.response !== undefined) {
                    if (axiosError.response.data !== undefined &&
                        axiosError.response.data !== null) {
                        obj = axiosError.response.data;
                    }
                }
            }

            if ('server_error' in obj && obj['server_error'] !== undefined) {
                const serverError = new ServerError();
                for (const key in obj) {
                    if (key in serverError) {
                        serverError[key] = obj[key];
                    }
                }

                return serverError;
            }
        }
        return null;
    }

    reloadAfter(): string | undefined {
        if (this.id === "AUTH001" || this.id === "AUTH004") {
            return "/sign-in"
        }
        return undefined;
    }

    format() {
        let res = "";
        if (this.id === "AUTH001") {
            res = `You have been logged out.`;
        } else if (this.id === "AUTH004") {
            res = `You are not authorized to see this page.`;
        } else if (this.is_default === true) {
            res = `Sorry, but we experienced a server error. Please refresh page.`;
        } else if (this.is_public === true) {
            res = `${this.message}`;
        } else {
            res = `Id: ${this.id}<br><br>Last command: ${this.last_command_id}<br><br>Module: ${this.module}<br><br>Error: ${this.message}<br><br>Stack: ${this.call_stack}`;
        }
        return res;
    }
}
