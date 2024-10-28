import {App, ComponentPublicInstance} from "vue";
import {AxiosError} from "axios";
import ServerError from "@/core/errors/ServerError";
import EndpointRequest from "@/core/requests/EndpointRequest";
import ApiService from "@/core/services/ApiService";
import {EnvProvider} from "@/core/env/EnvProvider";

export default class AppErrorHandler {

    static __onShowError: ((error: string, reload: string | undefined) => void) | undefined = undefined;

    static init(app: App<Element>) {
        app.config.errorHandler = AppErrorHandler.globalErrorHandler;
        window.onerror = AppErrorHandler.windowErrorHandler;
        window.addEventListener('unhandledrejection', AppErrorHandler.unhandledRejection);
    }

    static setOnShowError(onShowError: (error: string, reload: string | undefined) => void) {
        AppErrorHandler.__onShowError = onShowError;
    }

    public static __dispatchClientError(message: string) {
        if (EnvProvider.isProd && ApiService.initialized) {
            EndpointRequest.process2("log:client_error", {
                message: message
            });
        }
    }

    static unhandledRejection(event) {
        const serverError = ServerError.tryParse(event.reason);
        if (serverError !== null) {
            AppErrorHandler.showErrorPopupDefault(serverError.format());
            return;
        }

        if (event.reason instanceof AxiosError) {
            const msg = `Server error - please reload page.`;
            //AppErrorHandler.showErrorPopupDefault(msg);
            console.error(msg);
            return;
        }

        if (event.reason instanceof Error) {
            const error = event.reason as Error;
            const msg = `Message: ${JSON.stringify(error.message)}, Stack: ${JSON.stringify(error.stack)}`;
            //AppErrorHandler.showErrorPopupDefault(msg);
            console.error(msg);
            AppErrorHandler.__dispatchClientError(JSON.stringify(error));
        } else {
            const msg = `Unhandled rejection: ${JSON.stringify(event.reason)}`;
            //AppErrorHandler.showErrorPopupDefault(msg);
            console.error(msg);
            AppErrorHandler.__dispatchClientError(msg);
        }
    }

    static windowErrorHandler(errorMsg, url, lineNumber): boolean {
        AppErrorHandler.showErrorPopupDefault(errorMsg);
        return false;
    }

    static globalErrorHandler(err: unknown, instance: ComponentPublicInstance | null, info: string): void {
        const serverError = ServerError.tryParse(err);
        if (serverError !== null) {
            AppErrorHandler.showErrorPopupDefault(serverError.format(), serverError.reloadAfter());
            return;
        }

        if (err instanceof AxiosError) {
            const msg =`Name: ${err.name}<br><br>Message: ${err.message}<br><br>Stack: ${err.stack}`;
            console.error(msg);
            return;
        }

        if (EnvProvider.isProd) {
            if (err instanceof Error) {
                const e = err as Error;
                AppErrorHandler.__dispatchClientError(JSON.stringify({
                    name: e.name,
                    message: e.message,
                    stack: e.stack
                }));
            } else {
                AppErrorHandler.__dispatchClientError(JSON.stringify(err));
            }
            AppErrorHandler.showErrorPopupDefault(`Network error. Please reload page.`);

        } else {
            if (err instanceof Error) {
                AppErrorHandler.showErrorPopupDefault(`Name: ${err.name}<br><br>Message: ${err.message}<br><br>Stack: ${err.stack}`);
                throw err;
            } else {
                AppErrorHandler.showErrorPopupDefault(JSON.stringify(err));
            }
        }
    }

    static async showErrorPopup(error: string, reload: string | undefined = undefined) {

        if (error.includes("Failed to execute 'getImageData' on 'CanvasRenderingContext2D': The source width is 0")) {
            return;
        }

        if (AppErrorHandler.__onShowError !== undefined) {
            AppErrorHandler.__onShowError(error, reload);
        }
    }

    static showErrorPopupDefault(text: string, reload: string | undefined = undefined): Promise<void> | null {
        return AppErrorHandler.showErrorPopup(text, reload);
    }
}