import {defineStore} from "pinia";
import {
    BillingData,
    BillingDetails,
    BillingModulesConfig,
    BillingModulesDiscountDef,
    BillingModulesPricingDef,
    BillingModulesVatDef,
    BillingPricingSummaryItem,
    BillingQueryParams, ModuleDataView, ModuleSummaryView, UserView
} from "@/models/portal/billing/BillingData";
import EndpointRequest from "@/core/requests/EndpointRequest";
import {EBillingModuleId, PortalConstants, TBillingId} from "@/models/portal/PortalConstants";
import GembaseUtils from "@/utils/GembaseUtils";
import ClientError from "@/core/errors/ClientError";
import {ref} from "vue";
import {TUserId} from "@/models/user/UserData";
import {useRouterQuery} from "@/core/router/query/RouterQueryComposable";
import {BillingDiscountInstanceView} from "@/models/portal/billing/BillingDiscountInstanceView";
import {PlayerResearchDiscount} from "@/models/portal/billing/PlayerResearchDiscount";
import {BillingModuleInstanceView} from "@/models/portal/billing/BillingModuleInstanceView";

export const modulesDataView = ref<ModuleDataView[]>([]);

const DISCOUNT_TESTIMONIAL = 1;
const DISCOUNT_MULTI = 2;
const DISCOUNT_MULTI_SEATS = 3;
export const DISCOUNT_PLAYERS_RESEARCH = 4;

const discountTestimonial = new BillingDiscountInstanceView();
discountTestimonial.id = DISCOUNT_TESTIMONIAL;
discountTestimonial.name = "DISCOUNT_TESTIMONIAL";
discountTestimonial.desc = discountTestimonial.shortDesc = "I agree to provide a testimonial paragraph about Gembase.io";

const discountMulti = new BillingDiscountInstanceView();
discountMulti.id = DISCOUNT_MULTI;
discountMulti.name = "DISCOUNT_MULTI";
discountMulti.desc = discountMulti.shortDesc = "Discount activates automatically if you select 2 and more services.";
discountMulti.autoCheck = true;

const discountMultiSeats = new BillingDiscountInstanceView();
discountMultiSeats.id = DISCOUNT_MULTI_SEATS;
discountMultiSeats.name = "DISCOUNT_MULTI_SEATS";
discountMultiSeats.desc = discountMultiSeats.shortDesc = "Discount activates automatically if you select 2 and more users per paid service.";
discountMultiSeats.autoCheck = true;

const discountPlayersResearch = new PlayerResearchDiscount();
discountPlayersResearch.id = DISCOUNT_PLAYERS_RESEARCH;
discountPlayersResearch.name = "DISCOUNT_PLAYERS_RESEARCH";
discountPlayersResearch.desc = discountPlayersResearch.shortDesc = "I agree to place Gembase.io surveys in our game(s) to understand traits of our players";


export const billingDetailsForm = {
    companyName: ref(),
    billingEmail: ref(),
    businessId: ref(),
    businessTaxCountry: ref(),
    businessTaxId: ref(),
    addressCountry: ref(),
    addressLine1: ref(),
    addressLine2: ref(),
    addressCity: ref(),
    addressPostalCode: ref(),
    addressStateRegion: ref()
}

export const useBillingStore = defineStore('billingStore', {
    state: () => ({
        initialized: false,
        pricingDef: [] as BillingModulesPricingDef[],
        discountDef: [] as BillingModulesDiscountDef[],
        vatDef: [] as BillingModulesVatDef[],
        billingDetails: {} as BillingDetails,
        pricingSummary: [] as BillingPricingSummaryItem[],
        modules: [] as BillingModuleInstanceView[],
        discounts: [] as BillingDiscountInstanceView[],
        billingData: {} as BillingData,
        routerQuery: useRouterQuery<BillingQueryParams>()
    }),
    actions: {
        async init(force = false) {
            if (force || !this.initialized) {

                const response = await EndpointRequest.process2<{
                    pricing_def: BillingModulesPricingDef[],
                    discount_def: BillingModulesDiscountDef[],
                    vat_def: BillingModulesVatDef[],
                    last_billing_details: BillingDetails | null
                }>("portal:billing:get_modules_def");

                this.pricingDef = response.pricing_def;
                this.discountDef = response.discount_def;
                this.vatDef = response.vat_def;

                if (response.last_billing_details !== null) {
                    this.billingDetails = response.last_billing_details;
                }

                this.billingData = await EndpointRequest.process2<BillingData>("portal:billing:get_billings");

                modulesDataView.value.length = 0;

                const modules: BillingModuleInstanceView[] = [];

                this.pricingDef.forEach((x) => {
                    const guid = GembaseUtils.guid();
                    modulesDataView.value.push({
                        guid: guid,
                        seats: 0,
                        checked: false
                    });

                    const moduleDef = PortalConstants.getBillingModule(x.id);
                    const item = new BillingModuleInstanceView();
                    item.id = x.id;
                    item.guid = guid;
                    item.title = moduleDef.title;
                    item.desc = moduleDef.desc;
                    item.shortDesc = moduleDef.desc;
                    item.priceInItemsPerMonthPerSeat = x.price;
                    item.moduleDataView.seats = 1;
                    modules.push(item);

                    if (item.id === EBillingModuleId.INSIGHTS) {
                        modulesDataView.value.push({
                            guid: discountPlayersResearch.guid,
                            seats: 0,
                            checked: false
                        });
                    }
                });

                const auditor = modules.find((x) => x.id === EBillingModuleId.AUDIT);
                if (auditor !== undefined) {
                    if (this.getActiveSeats(EBillingModuleId.AUDIT) === 0) {
                        auditor.alwaysChecked = true;
                        auditor.moduleDataView.checked = true;
                    }
                }

                this.modules.length = 0;
                this.modules.push(...modules);

                discountTestimonial.discount = this.__getDiscountDef(discountTestimonial.id).discount_perc;
                modulesDataView.value.push({
                    guid: discountTestimonial.guid,
                    seats: 0,
                    checked: true
                });
                discountMulti.discount = this.__getDiscountDef(discountMulti.id).discount_perc;
                modulesDataView.value.push({
                    guid: discountMulti.guid,
                    seats: 0,
                    checked: false
                });
                discountMultiSeats.discount = this.__getDiscountDef(discountMultiSeats.id).discount_perc;
                modulesDataView.value.push({
                    guid: discountMultiSeats.guid,
                    seats: 0,
                    checked: false
                });

                this.discounts.length = 0;
                this.discounts.push(...[discountTestimonial, discountMulti, discountMultiSeats, discountPlayersResearch]);

                this.__refreshModules();

                this.initialized = true;
            }
        },
        checkedModulesCount() {
            let res = 0;
            for (let i = 0; i < this.modules.length; ++i) {
                if (this.modules[i].moduleDataView.checked) {
                    res++;
                }
            }
            return res;
        },
        __isMultiDiscount() {
            return this.checkedModulesCount() >= 2;
        },
        __isMultiSeatsDiscount() {
            for (let i = 0; i < this.modules.length; ++i) {
                if (this.modules[i].moduleDataView.seats >= 2 && this.modules[i].priceInItems > 0) {
                    return true;
                }
            }
            return false;
        },
        findModule(guid: string) {
            const module = this.modules.find((x) => x.guid === guid);
            if (module !== undefined) {
                return module;
            }
            const discount = this.discounts.find((x) => x.guid === guid);
            if (discount !== undefined) {
                return discount;
            }
            throw new ClientError("Module not found")
        },
        toggleModule(guid: string) {
            const item = this.findModule(guid);
            item.moduleDataView.checked = !item.moduleDataView.checked || item.alwaysChecked;
            const module = this.modules.find((x) => x.id === EBillingModuleId.INSIGHTS);
            if (module !== undefined) {
                module.forceGreen = discountPlayersResearch.moduleDataView.checked;
                if (!module.moduleDataView.checked && discountPlayersResearch.moduleDataView.checked) {
                    module.moduleDataView.checked = true;
                    module.moduleDataView.seats = 1;
                }
            }
            this.__refreshModules();
        },
        async setSeats(guid: string, n: number) {
            if (n <= 1) {
                n = 1;
            }
            for (let i = 0; i < modulesDataView.value.length; ++i) {
                if (modulesDataView.value[i].guid === guid) {
                    modulesDataView.value[i].seats = n;
                }
            }
            this.__refreshModules();
        },
        __refreshModules() {
            discountMulti.moduleDataView.checked = this.__isMultiDiscount();
            discountMultiSeats.moduleDataView.checked = this.__isMultiSeatsDiscount();
            this.__refreshPricingSummary();
        },
        __refreshPricingSummary() {
            const arr: BillingPricingSummaryItem[] = [];

            let modulesPriceSum = 0;
            let modulesPriceSumMonthly = 0;
            let discountTestimonialSummary = 0;
            let discountMultiSummary = 0;
            let discountMultiSeatsSummary = 0;

            let vat = 0;
            const vatDef = 19;

            const module = this.modules.find((x) => x.id === EBillingModuleId.INSIGHTS);
            if (module !== undefined) {
                module.priceInItemsPerMonthPerSeatOverride = discountPlayersResearch.moduleDataView.checked ? 0 : undefined;
            }

            this.modules.forEach((x) => {
                if (x.moduleDataView.checked) {
                    modulesPriceSumMonthly += x.priceInItems;
                    modulesPriceSum += x.priceInItems * x.moduleDataView.seats;
                }
            });

            modulesPriceSum = GembaseUtils.roundPrice(modulesPriceSum * 12);

            arr.push({
                value: modulesPriceSum,
                text: "Total <span style='font-weight: bold'>yearly</span> price of selected services and users"
            });

            discountTestimonial.priceInItemsPerMonthPerSeat = GembaseUtils.roundPrice(modulesPriceSumMonthly * (discountTestimonial.discount / 100));
            if (discountTestimonial.moduleDataView.checked) {
                discountTestimonialSummary = GembaseUtils.roundPrice(modulesPriceSum * (discountTestimonial.discount / 100));
            }

            arr.push({
                value: discountTestimonialSummary,
                type: "discount",
                text: "Discount for providing a testimonial"
            });

            discountMulti.priceInItemsPerMonthPerSeat = GembaseUtils.roundPrice(modulesPriceSumMonthly * (discountMulti.discount / 100));
            if (discountMulti.moduleDataView.checked) {
                discountMultiSummary = GembaseUtils.roundPrice(modulesPriceSum * (discountMulti.discount / 100));
            }

            discountMultiSeats.priceInItemsPerMonthPerSeat = GembaseUtils.roundPrice(modulesPriceSumMonthly * (discountMultiSeats.discount / 100));
            if (discountMultiSeats.moduleDataView.checked) {
                discountMultiSeatsSummary = GembaseUtils.roundPrice(modulesPriceSum * (discountMultiSeats.discount / 100));
            }

            arr.push({
                value: discountMultiSummary,
                type: "discount",
                text: "Discount for multiple services"
            });

            arr.push({
                value: discountMultiSeatsSummary,
                type: "discount",
                text: "Discount for multiple users"
            });

            const vatBase = modulesPriceSum - (discountMultiSummary + discountMultiSeatsSummary + discountTestimonialSummary);

            vat = GembaseUtils.round(vatBase * (vatDef / 100));

            arr.push({
                value: vat,
                text: `${vatDef}% VAT`
            });

            const total = vatBase + vat;

            arr.push({
                value: GembaseUtils.round(total),
                type: "total",
                text: `Total price billed per year<span class="text-primary">*</span>`
            });

            this.pricingSummary.length = 0;
            this.pricingSummary.push(...arr);
        },
        __getDiscountDef(moduleId: EBillingModuleId): BillingModulesDiscountDef {
            const m = this.discountDef.find((x) => x.id === moduleId);
            if (m === undefined) {
                throw new ClientError(`Discount id ${moduleId} not found`);
            }
            return m;
        },
        async paymentRequest(testPayment = false, testLivePayment = false) {

            const modulesConfig: BillingModulesConfig = {
                testimonial: discountTestimonial.moduleDataView.checked,
                players_research: discountPlayersResearch.moduleDataView.checked,
                modules: []
            }

            this.modules.forEach((x) => {
                if (x.moduleDataView.checked) {
                    modulesConfig.modules.push({
                        id: x.id,
                        seats: x.moduleDataView.seats
                    });
                }
            });

            const response = await EndpointRequest.process2<{
                redirect: string
            }>("portal:billing:payment_request", {
                billing_details: this.billingDetails,
                modules_config: modulesConfig,
                test_payment: testPayment,
                test_live_payment: testLivePayment
            });

            return response;
        },
        getActiveSeats(moduleId: EBillingModuleId) {
            let res = 0;
            this.billingData.billings.forEach((x) => {
                this.billingData.modules.forEach((y) => {
                    if (x.billing_guid === y.billing_guid && y.module_id === moduleId) {
                        res += y.seats;
                    }
                });
            });
            return res;
        },
        billingOrderNextStep() {

            async function showError(el: HTMLElement) {
                el.classList.add("gb-input-err");
                const labelId = el.dataset.labelId;
                if (labelId !== undefined) {
                    const labelEl = document.getElementById(labelId);
                    if (labelEl !== null) {
                        labelEl.classList.add("gb-label-err");
                    }
                }
                await GembaseUtils.sleep(1000);
                clearError(el);
            }

            function clearError(el: HTMLElement) {
                el.classList.remove("gb-input-err");
                const labelId = el.dataset.labelId;
                if (labelId !== undefined) {
                    const labelEl = document.getElementById(labelId);
                    if (labelEl !== null) {
                        labelEl.classList.remove("gb-label-err");
                    }
                }
            }

            function checkIsNotEmpty(el: HTMLInputElement) {
                if (el.value === "") {
                    showError(el);
                    return false;
                }
                return true;
            }

            function checkIsEmail(el: HTMLInputElement) {
                const res = el.value.includes("@") && el.value.includes(".");
                if (!res) {
                    showError(el);
                }
                return res;
            }

            if (this.routerQuery.query.show === undefined) {
                this.routerQuery.replace({show: "billingDetails"});
            } else if (this.routerQuery.query.show === "billingDetails") {

                for (const k in billingDetailsForm) {
                    clearError(billingDetailsForm[k].value as HTMLElement);
                }

                let validated = true;

                validated &&= checkIsNotEmpty(billingDetailsForm.companyName.value);
                validated &&= checkIsEmail(billingDetailsForm.billingEmail.value);
                validated &&= checkIsNotEmpty(billingDetailsForm.businessId.value);

                if (validated) {
                    if (this.billingDetails.business_tax_id_country === undefined || this.billingDetails.business_tax_id_country === 0) {
                        validated = false;
                        showError(billingDetailsForm.businessTaxCountry.value);
                    }
                }

                validated &&= checkIsNotEmpty(billingDetailsForm.businessTaxId.value);
                if (validated) {
                    for (let i = 0; i < this.vatDef.length; ++i) {
                        if (this.vatDef[i].country_id === this.billingDetails.business_tax_id_country) {
                            const val = (billingDetailsForm.businessTaxId.value as HTMLInputElement).value;
                            if (this.vatDef[i].vat_characters_max > 0) {
                                if (val.length < this.vatDef[i].vat_characters_min || val.length > this.vatDef[i].vat_characters_max + 2) {
                                    showError(billingDetailsForm.businessTaxId.value);
                                    return false;
                                }
                            }
                        }
                    }
                }

                validated &&= checkIsNotEmpty(billingDetailsForm.businessTaxId.value);
                if (validated) {
                    if (this.billingDetails.country === undefined || this.billingDetails.country === 0) {
                        validated = false;
                        showError(billingDetailsForm.addressCountry.value);
                    }
                }

                validated &&= checkIsNotEmpty(billingDetailsForm.addressLine1.value);
                validated &&= checkIsNotEmpty(billingDetailsForm.addressCity.value);
                validated &&= checkIsNotEmpty(billingDetailsForm.addressPostalCode.value);
                validated &&= checkIsNotEmpty(billingDetailsForm.addressStateRegion.value);

                if (!validated) {
                    return;
                }

                this.routerQuery.push({
                    show: "orderConfirmation",
                    processOrder: "1"
                });
            }
        },
        async sendConfirmationEmail(guid: string) {
            this.billingData.organization_requests.forEach((x) => {
                if (x.request_guid === guid) {
                    x.sent_request_t = GembaseUtils.serverTimestamp()
                    return;
                }
            });
            await EndpointRequest.process2("portal:billing:send_confirmation_mail", {
                guid: guid
            });
        },
        async saveChanges(members: UserView[], modulesSummary: ModuleSummaryView[]) {
            const addedAccounts: {
                request_guid: string;
                email: string;
            }[] = [];

            const usedSeats: {
                billing_guid: TBillingId,
                user_or_request_guid: TUserId | string,
                module_id: EBillingModuleId
            }[] = [];

            members.forEach((x) => {
                if (x.isNew) {
                    addedAccounts.push({
                        request_guid: x.userOrRequestGuid,
                        email: x.email
                    });
                }
            });
            modulesSummary.forEach((x) => {
                x.usedSeats.forEach((y) => {
                    usedSeats.push({
                        user_or_request_guid: y.userOrRequestGuid,
                        billing_guid: y.billingGuid,
                        module_id: x.moduleId
                    });
                });
            });
            await EndpointRequest.process2("portal:billing:set_licences", {
                added_accounts: addedAccounts,
                licences: usedSeats
            });

            await this.init(true);
        },
        getExpirationT(billingGuid: TBillingId) {
            for (let i = 0; i < this.billingData.billings.length; ++i) {
                if (this.billingData.billings[i].billing_guid === billingGuid) {
                    return this.billingData.billings[i].expire_t;
                }
            }
            throw new ClientError(`Billing ${billingGuid} not found`);
        },
        async confirmPayment() {
            return await EndpointRequest.process2<{
                state: string
            }>("portal:billing:payment_confirm", {
                request_guid: this.routerQuery.query.billingRequest
            });
        }
    },
    getters: {
        getModulesSummaryView(): ModuleSummaryView[] {
            const res: ModuleSummaryView[] = [];

            PortalConstants.billingModules.forEach((m) => {

                const d: ModuleSummaryView = {
                    moduleId: m.id,
                    freeSeats: [],
                    usedSeats: []
                }
                res.push(d);

                this.billingData.billings.forEach((x) => {
                    this.billingData.modules.forEach((y) => {
                        if (x.billing_guid === y.billing_guid && m.id === y.module_id) {
                            let cnt = y.seats;
                            this.billingData.licences.forEach((z) => {
                                if (z.billing_guid === y.billing_guid && z.module_id === y.module_id) {
                                    cnt--;
                                    d.usedSeats.push({
                                        billingGuid: z.billing_guid,
                                        userOrRequestGuid: z.user_guid,
                                    });
                                }
                            });
                            this.billingData.organization_requests_modules.forEach((z) => {
                                if (z.billing_guid === y.billing_guid && z.module_id === y.module_id) {
                                    cnt--;
                                    d.usedSeats.push({
                                        billingGuid: z.billing_guid,
                                        userOrRequestGuid: z.request_guid,
                                    });
                                }
                            });
                            for (let i = 0; i < cnt; ++i) {
                                d.freeSeats.push(y.billing_guid);
                            }
                        }
                    });
                });
            });

            return res;
        }
    }
});
