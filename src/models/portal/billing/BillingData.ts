import {EBillingModuleId, TBillingId} from "@/models/portal/PortalConstants";
import {TUserId} from "@/models/user/UserData";
import {IQueryData} from "@/core/router/query/QueryData";

export interface BillingQueryParams extends IQueryData {
    show?: "billingDetails" | "orderConfirmation";
    processOrder?: "1";
    showPlayersResearch?: "true";
    checkoutResult?: "success" | "cancel";
    billingRequest?: string;
}

export interface BillingModulesPricingDef {
    id: EBillingModuleId;
    price: number;
}

export interface BillingModulesDiscountDef {
    id: EBillingModuleId;
    discount_perc: number;
}

export interface BillingModulesVatDef {
    country_id: number;
    code_2: string;
    vat_name: string;
    vat_abbreviation: string;
    vat_characters_min: number;
    vat_characters_max: number;
}

export interface BillingDetails {
    company_name?: string;
    billing_email?: string;
    business_id?: string;
    business_tax_id_country?: number;
    business_tax_id_val?: string;
    country?: number;
    address_line_1?: string;
    address_line_2?: string;
    city?: string;
    postal_code?: string;
    state_province?: string;
}

export interface BillingPricingSummaryItem {
    value: number;
    type?: "discount" | "total";
    text: string;
}

export interface BillingModulesConfig {
    modules: BillingModuleInstance[];
    testimonial: boolean;
    players_research: boolean;
    final_price?: number;
}

export interface BillingModuleInstance {
    id: EBillingModuleId;
    price_monthly?: number;
    seats: number;
}

export interface BillingOrganizationRequest {
    request_guid: string;
    email: string;
    created_t: number;
    sent_request_t: number | null;
}

export interface BillingOrganizationRequestModules {
    email: string;
    request_guid: string;
    billing_guid: TBillingId;
    module_id: EBillingModuleId;
}


export interface BillingData {
    billings: BillingInstance[];
    organization_members: BillingOrganizationMember[];
    licences: BillingLicence[];
    modules: BillingModule[];
    organization_requests: BillingOrganizationRequest[];
    organization_requests_modules: BillingOrganizationRequestModules[];
    organization_domains: string[];
}

export interface BillingInstance {
    billing_guid: TBillingId;
    activated_t: number;
    expire_t: number;
    expired: number;
}

export interface BillingModule {
    billing_guid: TBillingId;
    module_id: EBillingModuleId;
    seats: number;
}

export interface BillingOrganizationMember {
    user_guid: TUserId,
    name: string;
    email: string;
    role: "admin" | "member";
    active: boolean;
    position_area: number;
    position_role: number;
}

export interface BillingLicence {
    billing_guid: TBillingId;
    user_guid: TUserId;
    module_id: EBillingModuleId;
}

export interface ModuleDataView {
    guid: string;
    seats: number;
    checked: boolean;
}

export interface ModulesPerUserView {
    billingGuid?: TBillingId;
    moduleId: EBillingModuleId;
    active: boolean;
}

export interface ModuleSummaryView {
    moduleId: EBillingModuleId;
    freeSeats: TBillingId[];
    usedSeats: {
        userOrRequestGuid: TUserId | string;
        billingGuid: TBillingId;
    }[];
}

export interface UserView {
    userOrRequestGuid: TUserId | string;
    email: string;
    positionRole: string;
    modules: ModulesPerUserView[];
    active: boolean;
    isNew?: boolean;
    isRequest?: boolean;
    sentRequest?: boolean;
}
