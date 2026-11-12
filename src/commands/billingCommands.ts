import type { EBillingModuleId, TBillingId } from '@/models/portal/PortalConstants'
import { BaseCommands } from './base/baseCommands'
import type {
    BillingDetails,
    BillingInstance,
    BillingLicence,
    BillingModule,
    BillingModulesConfig,
    BillingModulesDiscountDef,
    BillingModulesPricingDef,
    BillingModulesVatDef,
    BillingOrganizationMember,
    BillingOrganizationRequest,
    BillingOrganizationRequestModules,
} from '@/models/portal/billing/BillingData'
import type { TUserId } from '@/models/user/UserData'

export interface IGetModulesDefResponse {
    pricing_def: BillingModulesPricingDef[]
    discount_def: BillingModulesDiscountDef[]
    vat_def: BillingModulesVatDef[]
    last_billing_details: BillingDetails | null
    redirect?: string
}

export interface IBillingData {
    billings: BillingInstance[]
    organization_members: BillingOrganizationMember[]
    licences: BillingLicence[]
    modules: BillingModule[]
    organization_requests: BillingOrganizationRequest[]
    organization_requests_modules: BillingOrganizationRequestModules[]
    organization_domains: string[]
}

export interface IPaymentRequestInput {
    billing_details?: BillingDetails
    modules_config: BillingModulesConfig
    test_payment: boolean
    test_live_payment: boolean
}

export interface ISetLicencesInput {
    added_accounts: {
        request_guid: string
        email: string
    }[]
    usedSeats: {
        billing_guid: TBillingId
        user_or_request_guid: TUserId | string
        module_id: EBillingModuleId
    }[]
}

class BillingCommands extends BaseCommands {
    constructor() {
        super('/commands/billing')
    }

    getModulesDef = () => this.runCommand<IGetModulesDefResponse>('billing:get_modules_def')

    getBillings = () => this.runCommand<IBillingData>('billing:get')

    paymentRequest = (params: IPaymentRequestInput) =>
        this.runCommand<IGetModulesDefResponse>('billing:payment_request', params)

    sendConfirmationEmail = (params: { guid: string }) =>
        this.runCommand('billing:send_confirmation_mail', params)

    setLicences = (params: ISetLicencesInput) => this.runCommand('billing:set_licences', params)

    paymentConfirm = (params: { request_guid: string }) =>
        this.runCommand<{ state: string }>('billing:payment_confirm', params)
}

export const billingCommands = new BillingCommands()
