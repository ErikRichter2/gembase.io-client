import { defineStore } from 'pinia'
import {
    type BillingDetails,
    type BillingModulesConfig,
    type BillingModulesDiscountDef,
    type BillingModulesPricingDef,
    type BillingModulesVatDef,
    type BillingPricingSummaryItem,
    type BillingQueryParams,
    type ModuleDataView,
    type ModuleSummaryView,
    type UserView,
} from '@/models/portal/billing/BillingData'
import { EBillingModuleId, PortalConstants, type TBillingId } from '@/models/portal/PortalConstants'
import GembaseUtils from '@/utils/GembaseUtils'
import { computed, ref } from 'vue'
import { type TUserId } from '@/models/user/UserData'
import { BillingDiscountInstanceView } from '@/models/portal/billing/BillingDiscountInstanceView'
import { PlayerResearchDiscount } from '@/models/portal/billing/PlayerResearchDiscount'
import { BillingModuleInstanceView } from '@/models/portal/billing/BillingModuleInstanceView'
import { useQueryModel } from '@/router/queryModelComposable'
import { billingCommands, type IBillingData } from '@/commands/billingCommands'
import ClientError from '@/errors/clientError'

export const modulesDataView = ref<ModuleDataView[]>([])

const DISCOUNT_TESTIMONIAL = 1
const DISCOUNT_MULTI = 2
const DISCOUNT_MULTI_SEATS = 3
export const DISCOUNT_PLAYERS_RESEARCH = 4

const discountTestimonial = new BillingDiscountInstanceView()
discountTestimonial.id = DISCOUNT_TESTIMONIAL
discountTestimonial.name = 'DISCOUNT_TESTIMONIAL'
discountTestimonial.desc = discountTestimonial.shortDesc =
    'I agree to provide a testimonial paragraph about Gembase.io'

const discountMulti = new BillingDiscountInstanceView()
discountMulti.id = DISCOUNT_MULTI
discountMulti.name = 'DISCOUNT_MULTI'
discountMulti.desc = discountMulti.shortDesc =
    'Discount activates automatically if you select 2 and more services.'
discountMulti.autoCheck = true

const discountMultiSeats = new BillingDiscountInstanceView()
discountMultiSeats.id = DISCOUNT_MULTI_SEATS
discountMultiSeats.name = 'DISCOUNT_MULTI_SEATS'
discountMultiSeats.desc = discountMultiSeats.shortDesc =
    'Discount activates automatically if you select 2 and more users per paid service.'
discountMultiSeats.autoCheck = true

const discountPlayersResearch = new PlayerResearchDiscount()
discountPlayersResearch.id = DISCOUNT_PLAYERS_RESEARCH
discountPlayersResearch.name = 'DISCOUNT_PLAYERS_RESEARCH'
discountPlayersResearch.desc = discountPlayersResearch.shortDesc =
    'I agree to place Gembase.io surveys in our game(s) to understand traits of our players'

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
    addressStateRegion: ref(),
}

export const useBillingStore = defineStore('billingStore', () => {
    const initialized = ref<boolean>(false)
    const pricingDef: BillingModulesPricingDef[] = []
    const discountDef: BillingModulesDiscountDef[] = []
    const vatDef: BillingModulesVatDef[] = []
    const billingDetails = ref<BillingDetails>()
    const pricingSummary = ref<BillingPricingSummaryItem[]>([])
    const modules = ref<BillingModuleInstanceView[]>([])
    const discounts = ref<BillingDiscountInstanceView[]>([])
    const query = useQueryModel<BillingQueryParams>({}).query

    let _billingDataServer: IBillingData | undefined = undefined

    const billingData = computed(() => {
        if (_billingDataServer === undefined) {
            throw new ClientError(`Billing data undefined`)
        }
        return _billingDataServer
    })

    async function init(force = false) {
        if (force || !initialized.value) {
            const response = await billingCommands.getModulesDef()

            pricingDef.push(...response.pricing_def)
            discountDef.push(...response.discount_def)
            vatDef.push(...response.vat_def)

            if (response.last_billing_details !== null) {
                billingDetails.value = response.last_billing_details
            }

            _billingDataServer = await billingCommands.getBillings()

            modulesDataView.value.length = 0
            modules.value.length = 0

            pricingDef.forEach((x) => {
                const guid = GembaseUtils.guid()
                modulesDataView.value.push({
                    guid: guid,
                    seats: 0,
                    checked: false,
                })

                const moduleDef = PortalConstants.getBillingModule(x.id)
                const item = new BillingModuleInstanceView()
                item.id = x.id
                item.guid = guid
                item.title = moduleDef.title
                item.desc = moduleDef.desc
                item.shortDesc = moduleDef.desc
                item.priceInItemsPerMonthPerSeat = x.price
                item.moduleDataView.seats = 1
                modules.value.push(item)

                if (item.id === EBillingModuleId.INSIGHTS) {
                    modulesDataView.value.push({
                        guid: discountPlayersResearch.guid,
                        seats: 0,
                        checked: false,
                    })
                }
            })

            const auditor = modules.value.find((x) => x.id === EBillingModuleId.AUDIT)
            if (auditor !== undefined) {
                if (getActiveSeats(EBillingModuleId.AUDIT) === 0) {
                    auditor.alwaysChecked = true
                    auditor.moduleDataView.checked = true
                }
            }

            discountTestimonial.discount = __getDiscountDef(discountTestimonial.id).discount_perc
            modulesDataView.value.push({
                guid: discountTestimonial.guid,
                seats: 0,
                checked: true,
            })
            discountMulti.discount = __getDiscountDef(discountMulti.id).discount_perc
            modulesDataView.value.push({
                guid: discountMulti.guid,
                seats: 0,
                checked: false,
            })
            discountMultiSeats.discount = __getDiscountDef(discountMultiSeats.id).discount_perc
            modulesDataView.value.push({
                guid: discountMultiSeats.guid,
                seats: 0,
                checked: false,
            })

            discounts.value.length = 0
            discounts.value.push(
                ...[
                    discountTestimonial,
                    discountMulti,
                    discountMultiSeats,
                    discountPlayersResearch,
                ],
            )

            __refreshModules()

            initialized.value = true
        }
    }

    function checkedModulesCount() {
        let res = 0
        for (let i = 0; i < modules.value.length; ++i) {
            if (modules.value[i].moduleDataView.checked) {
                res++
            }
        }
        return res
    }

    function __isMultiDiscount() {
        return checkedModulesCount() >= 2
    }

    function __isMultiSeatsDiscount() {
        for (let i = 0; i < modules.value.length; ++i) {
            if (modules.value[i].moduleDataView.seats >= 2 && modules.value[i].priceInItems > 0) {
                return true
            }
        }
        return false
    }

    function findModule(guid: string) {
        const module = modules.value.find((x) => x.guid === guid)
        if (module !== undefined) {
            return module
        }
        const discount = discounts.value.find((x) => x.guid === guid)
        if (discount !== undefined) {
            return discount
        }
        throw new ClientError('Module not found')
    }

    function toggleModule(guid: string) {
        const item = findModule(guid)
        item.moduleDataView.checked = !item.moduleDataView.checked || item.alwaysChecked
        const module = modules.value.find((x) => x.id === EBillingModuleId.INSIGHTS)
        if (module !== undefined) {
            module.forceGreen = discountPlayersResearch.moduleDataView.checked
            if (!module.moduleDataView.checked && discountPlayersResearch.moduleDataView.checked) {
                module.moduleDataView.checked = true
                module.moduleDataView.seats = 1
            }
        }
        __refreshModules()
    }

    async function setSeats(guid: string, n: number) {
        if (n <= 1) {
            n = 1
        }
        for (let i = 0; i < modulesDataView.value.length; ++i) {
            if (modulesDataView.value[i].guid === guid) {
                modulesDataView.value[i].seats = n
            }
        }
        __refreshModules()
    }

    function __refreshModules() {
        discountMulti.moduleDataView.checked = __isMultiDiscount()
        discountMultiSeats.moduleDataView.checked = __isMultiSeatsDiscount()
        __refreshPricingSummary()
    }

    function __refreshPricingSummary() {
        const arr: BillingPricingSummaryItem[] = []

        let modulesPriceSum = 0
        let modulesPriceSumMonthly = 0
        let discountTestimonialSummary = 0
        let discountMultiSummary = 0
        let discountMultiSeatsSummary = 0

        let vat = 0
        const vatDef = 19

        const module = modules.value.find((x) => x.id === EBillingModuleId.INSIGHTS)
        if (module !== undefined) {
            module.priceInItemsPerMonthPerSeatOverride = discountPlayersResearch.moduleDataView
                .checked
                ? 0
                : undefined
        }

        modules.value.forEach((x) => {
            if (x.moduleDataView.checked) {
                modulesPriceSumMonthly += x.priceInItems
                modulesPriceSum += x.priceInItems * x.moduleDataView.seats
            }
        })

        modulesPriceSum = GembaseUtils.roundPrice(modulesPriceSum * 12)

        arr.push({
            value: modulesPriceSum,
            text: "Total <span style='font-weight: bold'>yearly</span> price of selected services and users",
        })

        discountTestimonial.priceInItemsPerMonthPerSeat = GembaseUtils.roundPrice(
            modulesPriceSumMonthly * (discountTestimonial.discount / 100),
        )
        if (discountTestimonial.moduleDataView.checked) {
            discountTestimonialSummary = GembaseUtils.roundPrice(
                modulesPriceSum * (discountTestimonial.discount / 100),
            )
        }

        arr.push({
            value: discountTestimonialSummary,
            type: 'discount',
            text: 'Discount for providing a testimonial',
        })

        discountMulti.priceInItemsPerMonthPerSeat = GembaseUtils.roundPrice(
            modulesPriceSumMonthly * (discountMulti.discount / 100),
        )
        if (discountMulti.moduleDataView.checked) {
            discountMultiSummary = GembaseUtils.roundPrice(
                modulesPriceSum * (discountMulti.discount / 100),
            )
        }

        discountMultiSeats.priceInItemsPerMonthPerSeat = GembaseUtils.roundPrice(
            modulesPriceSumMonthly * (discountMultiSeats.discount / 100),
        )
        if (discountMultiSeats.moduleDataView.checked) {
            discountMultiSeatsSummary = GembaseUtils.roundPrice(
                modulesPriceSum * (discountMultiSeats.discount / 100),
            )
        }

        arr.push({
            value: discountMultiSummary,
            type: 'discount',
            text: 'Discount for multiple services',
        })

        arr.push({
            value: discountMultiSeatsSummary,
            type: 'discount',
            text: 'Discount for multiple users',
        })

        const vatBase =
            modulesPriceSum -
            (discountMultiSummary + discountMultiSeatsSummary + discountTestimonialSummary)

        vat = GembaseUtils.round(vatBase * (vatDef / 100))

        arr.push({
            value: vat,
            text: `${vatDef}% VAT`,
        })

        const total = vatBase + vat

        arr.push({
            value: GembaseUtils.round(total),
            type: 'total',
            text: `Total price billed per year<span class="text-primary">*</span>`,
        })

        pricingSummary.value.length = 0
        pricingSummary.value.push(...arr)
    }

    function __getDiscountDef(moduleId: EBillingModuleId): BillingModulesDiscountDef {
        const m = discountDef.find((x) => x.id === moduleId)
        if (m === undefined) {
            throw new ClientError(`Discount id ${moduleId} not found`)
        }
        return m
    }

    async function paymentRequest(testPayment = false, testLivePayment = false) {
        const modulesConfig: BillingModulesConfig = {
            testimonial: discountTestimonial.moduleDataView.checked,
            players_research: discountPlayersResearch.moduleDataView.checked,
            modules: [],
        }

        modules.value.forEach((x) => {
            if (x.moduleDataView.checked) {
                modulesConfig.modules.push({
                    id: x.id,
                    seats: x.moduleDataView.seats,
                })
            }
        })

        const response = await billingCommands.paymentRequest({
            billing_details: billingDetails.value,
            modules_config: modulesConfig,
            test_payment: testPayment,
            test_live_payment: testLivePayment,
        })

        return response
    }

    function billingOrderNextStep() {
        if (billingDetails.value === undefined) {
            throw new ClientError('Billing details are missing')
        }

        async function showError(el: HTMLElement) {
            el.classList.add('gb-input-err')
            const labelId = el.dataset.labelId
            if (labelId !== undefined) {
                const labelEl = document.getElementById(labelId)
                if (labelEl !== null) {
                    labelEl.classList.add('gb-label-err')
                }
            }
            await GembaseUtils.sleep(1000)
            clearError(el)
        }

        function clearError(el: HTMLElement) {
            el.classList.remove('gb-input-err')
            const labelId = el.dataset.labelId
            if (labelId !== undefined) {
                const labelEl = document.getElementById(labelId)
                if (labelEl !== null) {
                    labelEl.classList.remove('gb-label-err')
                }
            }
        }

        function checkIsNotEmpty(el: HTMLInputElement) {
            if (el.value === '') {
                showError(el)
                return false
            }
            return true
        }

        function checkIsEmail(el: HTMLInputElement) {
            const res = el.value.includes('@') && el.value.includes('.')
            if (!res) {
                showError(el)
            }
            return res
        }

        if (query.value.show === undefined) {
            query.value.show = 'billingDetails'
        } else if (query.value.show === 'billingDetails') {
            for (const k in billingDetailsForm) {
                clearError(
                    billingDetailsForm[k as keyof typeof billingDetailsForm].value as HTMLElement,
                )
            }

            let validated = true

            validated &&= checkIsNotEmpty(billingDetailsForm.companyName.value)
            validated &&= checkIsEmail(billingDetailsForm.billingEmail.value)
            validated &&= checkIsNotEmpty(billingDetailsForm.businessId.value)

            if (validated) {
                if (
                    billingDetails.value.business_tax_id_country === undefined ||
                    billingDetails.value.business_tax_id_country === 0
                ) {
                    validated = false
                    showError(billingDetailsForm.businessTaxCountry.value)
                }
            }

            validated &&= checkIsNotEmpty(billingDetailsForm.businessTaxId.value)
            if (validated) {
                for (let i = 0; i < vatDef.length; ++i) {
                    if (vatDef[i].country_id === billingDetails.value.business_tax_id_country) {
                        const val = (billingDetailsForm.businessTaxId.value as HTMLInputElement)
                            .value
                        if (vatDef[i].vat_characters_max > 0) {
                            if (
                                val.length < vatDef[i].vat_characters_min ||
                                val.length > vatDef[i].vat_characters_max + 2
                            ) {
                                showError(billingDetailsForm.businessTaxId.value)
                                return false
                            }
                        }
                    }
                }
            }

            validated &&= checkIsNotEmpty(billingDetailsForm.businessTaxId.value)
            if (validated) {
                if (
                    billingDetails.value.country === undefined ||
                    billingDetails.value.country === 0
                ) {
                    validated = false
                    showError(billingDetailsForm.addressCountry.value)
                }
            }

            validated &&= checkIsNotEmpty(billingDetailsForm.addressLine1.value)
            validated &&= checkIsNotEmpty(billingDetailsForm.addressCity.value)
            validated &&= checkIsNotEmpty(billingDetailsForm.addressPostalCode.value)
            validated &&= checkIsNotEmpty(billingDetailsForm.addressStateRegion.value)

            if (!validated) {
                return
            }

            query.value.show = 'orderConfirmation'
            query.value.processOrder = '1'
        }
    }

    async function saveChanges(members: UserView[], modulesSummary: ModuleSummaryView[]) {
        const addedAccounts: {
            request_guid: string
            email: string
        }[] = []

        const usedSeats: {
            billing_guid: TBillingId
            user_or_request_guid: TUserId | string
            module_id: EBillingModuleId
        }[] = []

        members.forEach((x) => {
            if (x.isNew) {
                addedAccounts.push({
                    request_guid: x.userOrRequestGuid,
                    email: x.email,
                })
            }
        })
        modulesSummary.forEach((x) => {
            x.usedSeats.forEach((y) => {
                usedSeats.push({
                    user_or_request_guid: y.userOrRequestGuid,
                    billing_guid: y.billingGuid,
                    module_id: x.moduleId,
                })
            })
        })
        await billingCommands.setLicences({ added_accounts: addedAccounts, usedSeats: usedSeats })
        await init(true)
    }

    async function paymentConfirm() {
        if (query.value.billingRequest === undefined) {
            throw new ClientError('Undefined payment uuid')
        }
        return await billingCommands.paymentConfirm({ request_guid: query.value.billingRequest })
    }

    function getActiveSeats(moduleId: EBillingModuleId) {
        let res = 0
        billingData.value.billings.forEach((x) => {
            billingData.value.modules.forEach((y) => {
                if (x.billing_guid === y.billing_guid && y.module_id === moduleId) {
                    res += y.seats
                }
            })
        })
        return res
    }

    async function sendConfirmationEmail(guid: string) {
        billingData.value.organization_requests.forEach((x) => {
            if (x.request_guid === guid) {
                x.sent_request_t = GembaseUtils.serverTimestamp()
                return
            }
        })
        await billingCommands.sendConfirmationEmail({ guid: guid })
    }

    function getExpirationT(billingGuid: TBillingId) {
        for (let i = 0; i < billingData.value.billings.length; ++i) {
            if (billingData.value.billings[i].billing_guid === billingGuid) {
                return billingData.value.billings[i].expire_t
            }
        }
        throw new ClientError(`Billing ${billingGuid} not found`)
    }

    const getModulesSummaryView = computed(() => {
        const res: ModuleSummaryView[] = []

        PortalConstants.billingModules.forEach((m) => {
            const d: ModuleSummaryView = {
                moduleId: m.id,
                freeSeats: [],
                usedSeats: [],
            }
            res.push(d)

            billingData.value.billings.forEach((x) => {
                billingData.value.modules.forEach((y) => {
                    if (x.billing_guid === y.billing_guid && m.id === y.module_id) {
                        let cnt = y.seats
                        billingData.value.licences.forEach((z) => {
                            if (z.billing_guid === y.billing_guid && z.module_id === y.module_id) {
                                cnt--
                                d.usedSeats.push({
                                    billingGuid: z.billing_guid,
                                    userOrRequestGuid: z.user_guid,
                                })
                            }
                        })
                        billingData.value.organization_requests_modules.forEach((z) => {
                            if (z.billing_guid === y.billing_guid && z.module_id === y.module_id) {
                                cnt--
                                d.usedSeats.push({
                                    billingGuid: z.billing_guid,
                                    userOrRequestGuid: z.request_guid,
                                })
                            }
                        })
                        for (let i = 0; i < cnt; ++i) {
                            d.freeSeats.push(y.billing_guid)
                        }
                    }
                })
            })
        })

        return res
    })

    return {
        init,
        checkedModulesCount,
        findModule,
        toggleModule,
        setSeats,
        paymentRequest,
        billingOrderNextStep,
        saveChanges,
        paymentConfirm,
        sendConfirmationEmail,
        getExpirationT,
        getModulesSummaryView,
        query,
        pricingSummary,
        initialized,
        discounts,
        vatDef,
        billingDetails,
        billingData,
        getActiveSeats,
        modules,
    }
})
