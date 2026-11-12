export interface IServerErrorData {
    id?: string
    message?: string
    call_stack?: string
    last_command_id?: string
    is_public?: boolean
    is_default?: boolean
}

export class ServerError extends Error {
    serverErrorData: IServerErrorData

    constructor(serverErrorData: IServerErrorData) {
        super('Server Error')
        this.serverErrorData = serverErrorData
    }

    toString() {
        return `SERVER ERROR\nID: ${this.serverErrorData.id}\nCOMMAND: ${this.serverErrorData.last_command_id}\nMESSAGE: ${this.serverErrorData.last_command_id}\nCALLSTACK:\n${this.serverErrorData.call_stack}`
    }

    static tryParse(data: unknown) {
        return new ServerError({})
    }
}
