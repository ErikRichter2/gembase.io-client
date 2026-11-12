import { ref, type ComponentPublicInstance, type Ref } from 'vue'
import { type IServerErrorData, ServerError } from './serverError'
import { appEnv } from '@/appEnv'

export interface IPublicError {
    message: string
}

export interface IErrorDataView {
    serverError?: IServerErrorData
    publicError?: IPublicError
}

export const defaultErrorMessage = 'Sorry ! We experienced an error, please refresh page.'

export function useErrorHandler() {
    function __setServerError(error: ServerError) {
        const data = error.serverErrorData
        if (data.is_default === true) {
            errorDataView.value = {
                publicError: {
                    message: defaultErrorMessage,
                },
            }
        } else if (data.is_public === true) {
            errorDataView.value = {
                publicError: {
                    message: data.message ?? defaultErrorMessage,
                },
            }
        } else {
            errorDataView.value = {
                serverError: error.serverErrorData,
            }
            console.error(error.toString())
        }
    }
    function unhandledRejection(event: unknown) {
        if (event instanceof PromiseRejectionEvent) {
            const promiseRejectionEvent = event
            if (promiseRejectionEvent.reason instanceof ServerError) {
                __setServerError(promiseRejectionEvent.reason)
                event.preventDefault()
                return
            }
        }
        errorDataView.value = {
            publicError: {
                message: defaultErrorMessage,
            },
        }
    }

    function windowErrorHandler(
        event: Event | string,
        source?: string,
        lineno?: number,
        colno?: number,
        error?: Error,
    ): boolean {
        if (appEnv.isDev) {
            errorDataView.value = {
                publicError: {
                    message: `Event:${event}\nSource:${source}\nLineno:${lineno}\nColno:${colno}\nError:${error}\n`,
                },
            }
        } else {
            errorDataView.value = {
                publicError: {
                    message: defaultErrorMessage,
                },
            }
        }

        console.error(
            `Event:${event}\nSource:${source}\nLineno:${lineno}\nColno:${colno}\nError:${error}\n`,
        )
        return false
    }

    function globalErrorHandler(
        err: unknown,
        instance: ComponentPublicInstance | null,
        info: string,
    ): void {
        if (err instanceof ServerError) {
            __setServerError(err)
            return
        }

        let message = ``

        if (err instanceof Error && err.stack !== undefined) {
            message = `Info:${info}\nError:${err.message}\nStack:${err.stack}`
        } else {
            message = `Info:${info}\nError:${err}`
        }

        console.error(message)

        errorDataView.value = {
            publicError: {
                message: appEnv.isDev ? message : defaultErrorMessage,
            },
        }
    }

    window.onerror = windowErrorHandler
    window.addEventListener('unhandledrejection', unhandledRejection)

    const errorDataView: Ref<IErrorDataView | undefined> = ref()

    return { errorDataView, globalErrorHandler }
}
