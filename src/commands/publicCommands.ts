import type { DevDetail } from '@/models/portal/apps/AppsData'
import { BaseCommands } from './base/baseCommands'

export interface IUserData {
    role: string
    tos_agree_t: number
    tutorial_finished: boolean
    concepts_counter: number
    added_to_my_apps: number
    dev_detail: DevDetail
    name: string
    position_area: number
    position_role: number
    email: string
    organization?: {
        role: string
    }
}

export interface ILoginCredentialsResponse {
    user_data: IUserData
    error_id?: string
    auth_token: string
}

class PublicCommands extends BaseCommands {
    constructor() {
        super('/commands/public')
    }

    loginCredentials = (params: { email: string; password_raw: string }) =>
        this.runCommand<ILoginCredentialsResponse>('public:login_credentials', params)

    getLoggedUserData = () => this.runCommand<IUserData>('public:is_logged')

    logout = () => this.runCommand('public:logout')

    confirmRegistration = (params: { uuid: string; password_raw: string }) =>
        this.runCommand('public:confirm_client_pending_registration', params)

    requestPasswordChange = (params: { email: string }) =>
        this.runCommand('public:request_password_change', params)
}

export const publicCommands = new PublicCommands()
