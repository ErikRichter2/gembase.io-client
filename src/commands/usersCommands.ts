import type { RegistrationConfirmDef } from '@/models/portal/registration/RegistrationData'
import { BaseCommands } from './base/baseCommands'
import type { ILoginCredentialsResponse } from './publicCommands'

export interface IChangePasswordInput {
    request_guid: string
    password: string
}

export interface IGetRegistrationConfirmDefInput {
    request_guid: string
    email: string
}

export interface IConfirmRegistrationRequestInput {
    request_guid: string
    name: string
    position_role: number
    position_area: number
    password: string
}

export interface IConfirmRegistrationRequestResponse {
    state: 'created' | 'updated' | 'error'
    login_data?: ILoginCredentialsResponse
}

class UsersCommands extends BaseCommands {
    constructor() {
        super('/commands/users')
    }

    delete = (params: { user_id: number }) => this.runCommand('users:delete_study', params)

    getEmailSubscriptionState = (params: { request_guid: string }) =>
        this.runCommand<boolean>('users:get_email_subscription_state', params)

    setEmailSubscriptionState = (params: { subscribed: boolean }) =>
        this.runCommand<number>('users:set_email_subscription_state', params)

    getChangePasswordData = (params: { request_guid: string }) =>
        this.runCommand<{
            email?: string
        }>('users:get_change_password_data', params)

    changePassword = (params: IChangePasswordInput) =>
        this.runCommand('users:change_password', params)

    getRegistrationConfirmDef = (params: IGetRegistrationConfirmDefInput) =>
        this.runCommand<RegistrationConfirmDef>('users:get_registration_confirm_def', params)

    confirmRegistrationRequest = (params: IConfirmRegistrationRequestInput) =>
        this.runCommand<{
            state: 'created' | 'updated' | 'error'
            login_data?: ILoginCredentialsResponse
        }>('users:confirm_registration_request', params)

    registrationByEmail = (params: { email: string }) =>
        this.runCommand('users:registration_by_email', params)

    registrationByInvite = (params: { email: string }) =>
        this.runCommand('users:registration_by_invite', params)

    confirmTos = () =>
        this.runCommand<{
            state: 'ok'
        }>('users:confirm_tos')
}

export const usersCommands = new UsersCommands()
