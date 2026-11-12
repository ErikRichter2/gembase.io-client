import ClientError from '@/errors/clientError'
import { ServerError, type IServerErrorData } from '@/errors/serverError'

const serverRoot = import.meta.env.VITE_APP_SERVER_ROOT
const AUTH_TOKEN_LOCAL_STORAGE_ID = 'auth_token'

export interface ICommandResponse<T> {
    state: 'ok' | 'error'
    credits?: number
    payload: T
}

export class BaseCommands {
    __commandsEndpoint: string
    constructor(commandsEndpoint: string) {
        this.__commandsEndpoint = `${serverRoot}${commandsEndpoint}`
    }
    static setAuthToken(authToken: string | undefined) {
        if (authToken === undefined) {
            window.localStorage.removeItem(AUTH_TOKEN_LOCAL_STORAGE_ID)
        } else {
            window.localStorage.setItem(AUTH_TOKEN_LOCAL_STORAGE_ID, authToken)
        }
    }
    private async __postRequest(commandId: string, data: unknown) {
        const authToken = window.localStorage.getItem(AUTH_TOKEN_LOCAL_STORAGE_ID)
        const body = JSON.stringify({
            data: {
                id: commandId,
                payload: data,
            },
        })
        try {
            const res = await fetch(this.__commandsEndpoint, {
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                    Authorization: `Token ${authToken}`,
                },
                method: 'POST',
                body: body,
            })
            return res
        } catch {
            throw new ClientError(`Command failed to fetch: ${commandId}, ${data}`)
        }
    }
    async requestFile(commandId: string, data: unknown | undefined = undefined) {
        const response = await this.__postRequest(commandId, data)

        function getFilenameFromResponse() {
            // 'attachment; filename=xxxx'
            const header = response.headers.get('Content-Disposition')
            if (header !== null) {
                const f = header.split(';').find((x) => x.includes('filename'))
                if (f !== undefined) {
                    const arr: string[] = f.split('=')
                    if (arr.length === 2) {
                        return arr[1].trim()
                    }
                }
            }
            return 'attachment'
        }

        const blob = await response.blob()
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = getFilenameFromResponse()
        link.click()
        URL.revokeObjectURL(link.href)
    }
    async post<T>(commandId: string, data: unknown | undefined = undefined): Promise<T> {
        const response = await this.__postRequest(commandId, data)
        if (response.status === 500) {
            const errorData = await response.json()
            throw new ServerError(errorData as IServerErrorData)
        }
        const commandResponse = (await response.json()) as ICommandResponse<T>

        BaseCommands.__responseHooks.forEach((x) => {
            x.callback(commandResponse as ICommandResponse<object>)
        })

        return commandResponse.payload
    }

    async postFiles<T>(commandId: string, files: File[], data: unknown | undefined = undefined) {
        const formData = new FormData()

        for (let i = 0; i < files.length; ++i) {
            formData.append(`file${i + 1}`, files[i])
        }

        if (data !== undefined) {
            formData.append('data', JSON.stringify(data))
        }

        return await this.post<T>(commandId, formData)
    }

    runCommand = async <RESPONSE>(commandId: string, params?: object) =>
        await this.post<RESPONSE>(commandId, params)

    runCommandWithFiles = async <RESPONSE>(commandId: string, files: File[], params?: object) =>
        await this.postFiles<RESPONSE>(commandId, files, params)

    static __responseHooks: {
        id: string
        callback: (response: ICommandResponse<object>) => void
    }[] = []

    static addResponseHook(id: string, callback: (response: ICommandResponse<object>) => void) {
        this.__responseHooks.push({ id: id, callback: callback })
    }
}
