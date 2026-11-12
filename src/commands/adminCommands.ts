import type {
    AppDetail,
    TagDetail,
    TAppId,
    TRequestAppTagsChangesState,
} from '@/models/portal/apps/AppsData'
import { BaseCommands } from './base/baseCommands'
import type { ICustomerData } from '@/views/platform/modules/admin/__subpages/AdminUsers.vue'

export interface IEmailTemplatesDef {
    themes: {
        theme: string
        wrapper: string
    }[]
    templates: string[]
}

export interface IGetOrCreateEmailDraft {
    email: string
    template_def: string
}

export type IDraftParameters = object & {
    theme?: string
}

interface EmailTemplateParameters {
    gb__title: string
    gb__content: string
    gb__footer: string
    gb__homepage: string
}

export interface IEmailInstanceData {
    def_id: string
    draft_id: number | undefined
    instance_data: {
        subject: string
        from_address: string | null
        draft_parameters: IDraftParameters | null
        content_parameters: Record<string, string> | null
        template_parameters: EmailTemplateParameters
    }
}

export interface IGetFollowupEmailParametersInput {
    audience_angle_id: string
    app_id: TAppId
    draft_id: number
}

export interface IFollowupEmailData {
    all_angles: {
        audience_angle_id: string
        name: string
    }[]
    all_apps: {
        app_id: TAppId
        title: string
    }[]
}

export interface IGetFollowupEmailParametersResponse {
    instance: IEmailInstanceData
    data: IFollowupEmailData
}

export interface ISendEmailDraftInput {
    draft_id: number
    to_test_user: boolean
    to_current_user: boolean
}

export interface ISheetData {
    name: string
    sheet_id: string
    dms_guid: string
}

export interface IUpdateDmsFromSheetInput {
    name: string
    update_sheet: boolean
}

export interface IServiceData {
    pid: number
    service_data: {
        step_index: number
        step_desc: string
    } | null
    script: string
    finished: number
    status: string
    created: number
    heartbeat: number
}

export interface IRequestAppTagsChangesData {
    request_id: number
    user_id: number
    email: string
    state: TRequestAppTagsChangesState
    rejected_reason: string
    app_detail: AppDetail
    before_tags: TagDetail[]
    request_tags: TagDetail[]
    t: number
}

export interface IConfirmRequestTagsOverrideByUser {
    request_id: number
    tags: TagDetail[]
}

export interface IUsersDeleteInput {
    customer_id: string
    email: string
}

export interface IBlockUserInput {
    email: string
    remove_block: boolean
}

interface AdminRegisteredUserData {
    email: string
    name: string
    guid: string
    created_t: number
    session_t: number
    sent_request_t: number
    developer_title: string
    free_trial_end_t: number | null
    blocked: number | null
}

interface AdminWhitelistData {
    request_guid: string
    email: string
    name: string
    title: string
    is_organization: number
    locked: number
    sent_request_t: number | null
    whitelisted: number
    request_t: number | null
    free_trial_end_t: number | null
    responded_t: number | null
    blocked: number | null
}

export interface IAdminUsers {
    error?: string
    registered: AdminRegisteredUserData[]
    whitelist: AdminWhitelistData[]
    customers: {
        id: number
        email: string | null
        developer_title: string
        data: ICustomerData
    }[]
    emails_sent_cnt: { email: string; cnt: number }[]
}

interface ISentEmailData {
    id: number
    t: number
    subject: string
    body: string
    email_def: string | null
    from_composer: number
}

export interface IAdminDataPerEmails {
    email: string
    data: {
        sent_emails?: {
            email_def: string
            email: string
            t: number | null
            opened_t: number | null
        }[]
        subscription?: {
            email: string
            subscribed: number
        }
    }
}

export interface IConfirmWhitelistEmailInput {
    email: string
    name: string
    position_role: number
    position_area: number
    dev_id_in_store: string
    dev_store: number
    dev_concept_title: string
    request_id: string
    dev_id: string
}

class AdminCommands extends BaseCommands {
    constructor() {
        super('/commands/admin')
    }

    getEmailTemplates = () => this.runCommand<IEmailTemplatesDef>('admin:get_email_templates')

    getOrCreateEmailDraft = (params: IGetOrCreateEmailDraft) =>
        this.runCommand<IEmailInstanceData>('admin:get_or_create_email_draft', params)

    getFollowupEmailParameters = (params: IGetFollowupEmailParametersInput) =>
        this.runCommand<IGetFollowupEmailParametersResponse>(
            'admin:get_followup_email_parameters',
            params,
        )

    saveEmailDraft = (params: IEmailInstanceData) =>
        this.runCommand('admin:save_email_draft', params)

    sendEmailDraft = (params: ISendEmailDraftInput) =>
        this.runCommand<{ error?: string }>('admin:send_email_draft', params)

    resetEmailDraft = (params: { draft_id: number }) =>
        this.runCommand('admin:reset_email_draft', params)

    updateEmailTemplatesFromSheet = () => this.runCommand('admin:update_email_templates_from_sheet')

    getSheets = () => this.runCommand<ISheetData[]>('admin:get_sheets')

    updateDmsFromSheet = (params: IUpdateDmsFromSheetInput) =>
        this.runCommand('admin:get_sheets', params)

    getServices = () => this.runCommand<IServiceData[]>('admin:get_services')

    rebuildPlatformValues = () => this.runCommand('admin:rebuild_platform_values')

    getRequestTagsOverrideByUser = () =>
        this.runCommand<IRequestAppTagsChangesData[]>('admin:get_request_tags_override_by_user')

    confirmRequestTagsOverrideByUser = (params: IConfirmRequestTagsOverrideByUser) =>
        this.runCommand('admin:confirm_request_tags_override_by_user', params)

    rejectRequestTagsOverrideByUser = (params: { request_id: number }) =>
        this.runCommand('admin:reject_request_tags_override_by_user', params)

    fakeLogin = (params: { email: string }) =>
        this.runCommand<{
            state: 'ok' | 'not_found'
        }>('admin:fake_login', params)

    usersDelete = (params: { customer_id: number; email: string }) =>
        this.runCommand<IAdminUsers>('admin:users_delete', params)

    blockUser = (params: { email: string; remove_block: boolean }) =>
        this.runCommand<IAdminUsers>('admin:block_user', params)

    getSentEmails = (params: { email: string }) =>
        this.runCommand<ISentEmailData[]>('admin:get_sent_emails', params)

    usersSetText = (params: {
        email: string
        customer_id?: number
        parameter: string
        value: string
        is_timestamp?: boolean
    }) => this.runCommand<IAdminUsers>('admin:users_set_text', params)

    usersSetDeveloper = (params: {
        email: string
        customer_id?: number
        is_concept: boolean
        concept_name: string
        dev_id_in_store?: string
        store?: number
    }) => this.runCommand<IAdminUsers>('admin:users_set_developer', params)

    usersAdd = () => this.runCommand<IAdminUsers>('admin:users_add')

    getDataPerEmails = () => this.runCommand<IAdminDataPerEmails[]>('admin:get_data_per_emails')

    getUsers = () => this.runCommand<IAdminUsers>('admin:get_users')

    setFollowUpDate = (params: { timestamp: number }) =>
        this.runCommand('admin:set_follow_up_date', params)

    whitelistEmailRequest = (params: { email: string }) =>
        this.runCommand<'blocked' | 'email_whitelisted' | 'ok' | undefined>(
            'admin:whitelist_email_request',
            params,
        )

    confirmWhitelistEmail = (params: IConfirmWhitelistEmailInput) =>
        this.runCommand('admin:confirm_whitelist_email', params)

    saveTagsForExistingApp = (params: { app_id: TAppId; tags_details: TagDetail[] }) =>
        this.runCommand('admin:save_tags_for_existing_app', params)

    requestTagsOverrideByUser = (params: { app_id: TAppId; tags_details: TagDetail[] }) =>
        this.runCommand<{
            state: 'pending' | 'accepted'
        }>('admin:request_tags_override_by_user', params)
}

export const adminCommands = new AdminCommands()
