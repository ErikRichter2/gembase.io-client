<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useBillingStore } from '@/models/portal/billing/BillingStore'
import BillingModulesList from '@/views/platform/modules/billing/__components/billingSteps/__components/BillingModulesList.vue'
import BillingPricingSummary from '@/views/platform/modules/billing/__components/billingSteps/__components/BillingPricingSummary.vue'

const billingStore = useBillingStore()

const initialized = ref(false)

onMounted(async () => {
    await billingStore.init()
    initialized.value = true
})
</script>

<template>
    <div class="gb-ui-svg-current">
        Test Payments
        <div v-if="initialized">
            <billing-modules-list
                @click="(item) => billingStore.toggleModule(item)"
                @on-set-seats="(item, seats) => billingStore.setSeats(item, seats)"
            ></billing-modules-list>
            <billing-pricing-summary></billing-pricing-summary>
        </div>
    </div>
</template>
