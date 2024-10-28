<script setup lang="ts">
import {onMounted, ref} from "vue";
import {useBillingStore} from "@/models/portal/billing/BillingStore";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import BillingModulesList
    from "@/views/platform/modules/billing/__components/billingSteps/__components/BillingModulesList.vue";
import BillingPricingSummary
    from "@/views/platform/modules/billing/__components/billingSteps/__components/BillingPricingSummary.vue";

const billingStore = useBillingStore();

const initialized = ref(false);

onMounted(async () => {
    await billingStore.init();
    initialized.value = true;
});

async function onTest() {
    const response = await billingStore.paymentRequest(true);
    window.location.replace(response.redirect);
}

async function onTestLive() {
    const response = await billingStore.paymentRequest(false, true);
    window.location.replace(response.redirect);
}

</script>

<template>
    <div class="gb-ui-svg-current">
        Test Payments
        <gb-button @click="onTest" class="gbc-bg-secondary" text="TEST"></gb-button>
        <gb-button @click="onTestLive" class="gbc-bg-secondary" text="TEST LIVE"></gb-button>
        <div v-if="initialized">
            <billing-modules-list @click="(item) => billingStore.toggleModule(item)" @on-set-seats="(item, seats) => billingStore.setSeats(item, seats)"></billing-modules-list>
            <billing-pricing-summary></billing-pricing-summary>
        </div>
    </div>
</template>
