<script setup lang="ts">
import {billingDetailsForm, useBillingStore} from "@/models/portal/billing/BillingStore";
import GembaseUiSelect from "@/views/ui/GembaseUiSelect.vue";
import {computed, onMounted, ref} from "vue";
import {SelectOptionItem} from "@/views/ui/UiData";
import {UiUtils} from "@/utils/UiUtils";
import GbWindow from "@/views/ui/popups/GbWindow.vue";
import BillingPricingSummary
    from "@/views/platform/modules/billing/__components/billingSteps/__components/BillingPricingSummary.vue";

const billingStore = useBillingStore();

const vatCountries = computed((): SelectOptionItem[] => {
    const res: SelectOptionItem[] = [];

    billingStore.vatDef.forEach((x) => {
        res.push({
            id: x.country_id.toString(),
            sortValue: `${x.code_2} ${x.vat_abbreviation}`,
            searchValue: `${x.code_2} ${x.vat_abbreviation}`.toLowerCase().trim().replaceAll(" ", ""),
            value: `<span class="gb-layout-ml-row gap-1 overflow-hidden text-[12px]"><span style="min-width: 12px; width: 12px; height: 12px; border-radius: 8px; content: url(${UiUtils.getFlagIcon(x.code_2)})"></span><span>${x.code_2}</span><span>${x.vat_abbreviation}</span></span>`
        })
    });

    res.sort((a, b) => {
        if (a.sortValue !== undefined && b.sortValue !== undefined) {
            return a.sortValue.localeCompare(b.sortValue);
        }
        return 0;
    });

    return res;
});

const vatPlaceholder = computed(() => {
    for (let i = 0; i < billingStore.vatDef.length; ++i) {
        if (billingStore.vatDef[i].country_id === billingStore.billingDetails.business_tax_id_country) {
            if (billingStore.vatDef[i].vat_abbreviation !== "") {
                return billingStore.vatDef[i].vat_abbreviation;
            } else {
                return `${billingStore.vatDef[i].code_2} tax ID`;
            }
        }
    }

    return "Tax ID";
});

const addressCountries = computed((): SelectOptionItem[] => {
    const res: SelectOptionItem[] = [];

    billingStore.vatDef.forEach((x) => {
        res.push({
            id: x.country_id.toString(),
            sortValue: x.vat_name,
            searchValue: x.vat_name.toLowerCase().trim().replaceAll(" ", ""),
            value: `<span class="gb-layout-ml-row gap-1 overflow-hidden text-[12px]"><span style="min-width: 12px; width: 12px; height: 12px; border-radius: 8px; content: url(${UiUtils.getFlagIcon(x.code_2)})"></span><span>${x.vat_name}</span></span>`
        })
    });

    res.sort((a, b) => {
        if (a.sortValue !== undefined && b.sortValue !== undefined) {
            return a.sortValue.localeCompare(b.sortValue);
        }
        return 0;
    });

    return res;
});

const selectedBusinessTaxIdCountry = ref<string>();
const selectedCountry = ref<string>();

onMounted(() => {
    if (billingStore.billingDetails.business_tax_id_country !== undefined) {
        selectedBusinessTaxIdCountry.value = billingStore.billingDetails.business_tax_id_country.toString();
    }

    if (billingStore.billingDetails.country !== undefined) {
        selectedCountry.value = billingStore.billingDetails.country.toString();
    }
})

function onSelectVatCountry(item: SelectOptionItem) {
    billingStore.billingDetails.business_tax_id_country = parseInt(item.id);
}

function onSelectAddressCountry(item: SelectOptionItem) {
    billingStore.billingDetails.country = parseInt(item.id);
}

</script>

<template>
    <gb-window header="Please fill in your billing details">
        <div class="gb-layout-tl-row pl-3 gap-4 pb-4">
            <div class="gb-layout-tl gap-1 w-[330px]">
                <div class="gb-input-w-label">
                    <div id="companyName" class="label">Company name</div>
                    <input type="text" data-label-id="companyName" required :ref="billingDetailsForm.companyName" placeholder="Enter company name" v-model="billingStore.billingDetails.company_name">
                </div>
                <div class="gb-input-w-label">
                    <div id="billingEmail" class="label">Billing email</div>
                    <input type="email" data-label-id="billingEmail" required :ref="billingDetailsForm.billingEmail" placeholder="Enter billing email" v-model="billingStore.billingDetails.billing_email">
                </div>
                <div class="gb-input-w-label">
                    <div id="businessId" class="label">Business ID</div>
                    <input type="number" data-label-id="businessId" required :ref="billingDetailsForm.businessId" placeholder="Enter business ID" v-model="billingStore.billingDetails.business_id">
                </div>
                <div class="gb-input-w-label">
                    <div id="businessTax" class="label">Business tax ID</div>
                    <div class="gb-layout-row w-full gap-1">
                        <div :ref="billingDetailsForm.businessTaxCountry" data-label-id="businessTax" class="w-1/2">
                            <gembase-ui-select :show-items-search-filter="true" options-width="200px" class="!w-full" placeholder="VAT country" :selected="selectedBusinessTaxIdCountry" @on-change="onSelectVatCountry" :items="vatCountries">
                            </gembase-ui-select>
                        </div>
                        <div class="w-1/2">
                            <input data-label-id="businessTax" type="text" required :ref="billingDetailsForm.businessTaxId" :placeholder="vatPlaceholder" v-model="billingStore.billingDetails.business_tax_id_val">
                        </div>
                    </div>
                </div>
            </div>
            <div class="gb-layout-tl w-[350px]">
                <div class="gb-input-w-label">
                    <div id="address" class="label">Primary business address</div>
                    <div class="gb-layout-tl gap-1">
                        <div class="w-full" data-label-id="address" :ref="billingDetailsForm.addressCountry">
                            <gembase-ui-select :show-items-search-filter="true" class="!w-full" placeholder="Select country" :selected="selectedCountry" @on-change="onSelectAddressCountry" :items="addressCountries">
                            </gembase-ui-select>
                        </div>
                        <input type="text" data-label-id="address" required :ref="billingDetailsForm.addressLine1" placeholder="Address line 1" v-model="billingStore.billingDetails.address_line_1">
                        <input type="text" data-label-id="address" :ref="billingDetailsForm.addressLine2" placeholder="Address line 2" v-model="billingStore.billingDetails.address_line_2">
                        <div class="gb-layout-tl-row gap-1">
                            <div class="w-1/2">
                                <input type="text" required data-label-id="address" :ref="billingDetailsForm.addressCity" placeholder="City" v-model="billingStore.billingDetails.city">
                            </div>
                            <div class="w-1/2">
                                <input type="number" required data-label-id="address" :ref="billingDetailsForm.addressPostalCode" placeholder="Postal code" v-model="billingStore.billingDetails.postal_code">
                            </div>
                        </div>
                        <input type="text" data-label-id="address" :ref="billingDetailsForm.addressStateRegion" placeholder="State, country, province or region" v-model="billingStore.billingDetails.state_province">
                    </div>
                </div>
            </div>
        </div>
        <billing-pricing-summary></billing-pricing-summary>
    </gb-window>
</template>

<style scoped>
.gb-input-w-label {
  @apply gb-layout-tl w-full;
}

.gb-input-w-label .label {
  @apply text-[0.7em] pl-3;
}

.gb-input-w-label input {
  @apply w-full;
}
</style>