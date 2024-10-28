<template>
    <template v-if="billingsStore.initialized">
        <template v-if="billingsStore.routerQuery.query.checkoutResult !== undefined">
            <billing-checkout-success v-if="billingsStore.routerQuery.query.checkoutResult === 'success'"></billing-checkout-success>
            <billing-checkout-cancel v-if="billingsStore.routerQuery.query.checkoutResult === 'cancel'"></billing-checkout-cancel>
        </template>
        <template v-else>
            <billing-modules-list v-if="billingsStore.routerQuery.query.show === undefined"></billing-modules-list>
            <billing-payment-details v-else-if="billingsStore.routerQuery.query.show === 'billingDetails'"></billing-payment-details>
            <billing-order-confirm v-else-if="billingsStore.routerQuery.query.show === 'orderConfirmation'"></billing-order-confirm>
        </template>
    </template>
</template>

<script setup lang="ts">
import {onMounted} from "vue";
import {useBillingStore} from "@/models/portal/billing/BillingStore";
import BillingModulesList from "@/views/platform/modules/billing/__components/billingSteps/BillingModulesOffer.vue";
import BillingPaymentDetails from "@/views/platform/modules/billing/__components/billingSteps/BillingPaymentDetails.vue";
import BillingOrderConfirm from "@/views/platform/modules/billing/__components/billingSteps/BillingOrderConfirm.vue";
import BillingCheckoutSuccess from "@/views/platform/modules/billing/__components/BillingCheckoutSuccess.vue";
import BillingCheckoutCancel from "@/views/platform/modules/billing/__components/BillingCheckoutCancel.vue";
import {useFullscreenLoading} from "@/models/ui/FullscreenLoadingComposable";

const billingsStore = useBillingStore();
const fullscreenLoading = useFullscreenLoading();

onMounted(async () => {
    fullscreenLoading.show();
    await billingsStore.init();
    fullscreenLoading.hide();
});

</script>
