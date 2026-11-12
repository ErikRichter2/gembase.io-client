import GembaseUtils from '@/utils/GembaseUtils'
import {
    type EPlatformValuesCalcType,
    type IPlatformCalcOptions,
    type IPlatformCalcResponseBase,
    type IPlatformCalcResponseState,
    type IPlatformCalcServiceRequest,
    type IPlatformCallback,
    type IResponseCallbackOptions,
} from '@/models/portal/calc/PlatformCalcData'
import { calcCommands, type ICheckCalcInput } from '@/commands/calcCommands'

interface CallbackData<T> {
    serviceRequest: IPlatformCalcServiceRequest<T>
    data: IPlatformCalcOptions<T>
    callback: IResponseCallbackOptions<T>
}

export function runCallbacks<T>(options: {
    state: IPlatformCalcResponseState
    callbackData: IPlatformCallback<T>
    callbacks?: IResponseCallbackOptions<T>
}) {
    if (options.state === 'done') {
        if (options.callbacks?.done !== undefined && options.callbacks?.done !== null) {
            options.callbacks?.done(options.callbackData)
        }
    } else if (options.state === 'error') {
        if (options.callbacks?.error !== undefined && options.callbacks?.error !== null) {
            options.callbacks?.error(options.callbackData)
        }
    } else {
        if (options.callbacks?.progress !== undefined && options.callbacks?.progress !== null) {
            options.callbacks?.progress(options.callbackData)
        }
    }

    if (options.state === 'done' || options.state === 'error') {
        if (options.callbacks?.finally !== undefined && options.callbacks?.finally !== null) {
            options.callbacks?.finally()
        }
    }
}

export class PlatformValuesServiceChecker {
    private readonly __calcType: EPlatformValuesCalcType
    private readonly __clientHashKey: number
    private readonly __serverHashKey: number
    private readonly __controllerCallback: (
        clientHashKey: number,
        data: IPlatformCalcResponseBase,
    ) => void

    private __stopped = false
    private __requestClientDataNextTime = false
    private __currentProgressData: string | null = null
    private __callbacks: Map<string, CallbackData<object>[]> = new Map<
        string,
        CallbackData<object>[]
    >()

    constructor(options: {
        clientHashKey: number
        serverHashKey: number
        calcType: EPlatformValuesCalcType
        controllerCallback: (clientHashKey: number, data: IPlatformCalcResponseBase) => void
    }) {
        this.__calcType = options.calcType
        this.__serverHashKey = options.serverHashKey
        this.__clientHashKey = options.clientHashKey
        this.__controllerCallback = options.controllerCallback
    }

    run() {
        this.__runInternal()
    }

    addCallback<T>(serviceRequest: IPlatformCalcServiceRequest<T>, data: IPlatformCalcOptions<T>) {
        if (!this.__callbacks.has(data.context)) {
            this.__callbacks.set(data.context, [])
        }
        const arr = this.__callbacks.get(data.context)
        const callbackBase = data.responseCallback

        if (arr !== undefined && callbackBase !== undefined) {
            arr.push({
                serviceRequest: serviceRequest as IPlatformCalcServiceRequest<any>,
                data: data as IPlatformCalcOptions<any>,
                callback: callbackBase as IResponseCallbackOptions<any>,
            })
        }
    }

    private __getCallbacks() {
        const res: CallbackData<object>[] = []
        for (const [key, value] of this.__callbacks) {
            value.forEach((x) => {
                if (
                    x.callback !== null &&
                    x.callback !== undefined &&
                    x.serviceRequest.requestGuid === x.data.requestToken?.guid
                ) {
                    res.push(x)
                }
            })
        }
        return res
    }

    private async __runInternal() {
        let counter = 999
        let notFoundRetry = 20

        const payload: ICheckCalcInput = {
            calc: this.__calcType,
            hash_key: this.__serverHashKey,
            generate_client_data: false,
        }

        while (!this.__stopped && counter > 0) {
            counter--

            if (this.__getCallbacks().length === 0) {
                await GembaseUtils.sleep(1000)
                continue
            }

            payload['generate_client_data'] = this.__requestClientDataNextTime
            this.__requestClientDataNextTime = false

            const response = await calcCommands.checkCalc(payload)

            if (this.__stopped) {
                return
            }

            if (response.metadata.error_code === 'not_found') {
                if (notFoundRetry > 0) {
                    notFoundRetry--
                    await GembaseUtils.sleep(1000)
                    continue
                }
            }

            this.__controllerCallback(this.__clientHashKey, response)

            this.__getCallbacks().forEach((x) => {
                runCallbacks({
                    state: response.metadata.state,
                    callbackData: {
                        response: response,
                        serviceRequest: x.serviceRequest as IPlatformCalcServiceRequest<any>,
                    },
                    callbacks: x.callback,
                })
            })

            if (response.metadata.state === 'done' || response.metadata.state === 'error') {
                this.stop()
                return
            }

            if (response.payload?.progress_data !== undefined) {
                const str = JSON.stringify(response.payload.progress_data)
                this.__requestClientDataNextTime =
                    this.__currentProgressData === null || this.__currentProgressData !== str
                this.__currentProgressData = str
            }

            await GembaseUtils.sleep(1000)
        }
    }

    stop() {
        this.__stopped = true
        this.__callbacks.clear()
    }

    removeCallback(context: string) {
        if (this.__callbacks.has(context)) {
            this.__callbacks.delete(context)
        }
    }
}
