<script setup lang="ts">
import {
    useBillingStore
} from "@/models/portal/billing/BillingStore";
import GbWindow from "@/views/ui/popups/GbWindow.vue";
import BillingModulesList
    from "@/views/platform/modules/billing/__components/billingSteps/__components/BillingModulesList.vue";
import BillingPricingSummary
    from "@/views/platform/modules/billing/__components/billingSteps/__components/BillingPricingSummary.vue";

const billingStore = useBillingStore();

</script>

<template>
    <gb-window header="Please select services to upgrade">
        <div class="gb-layout-tl gap-4 w-full h-full">
            <billing-modules-list @click="(item) => billingStore.toggleModule(item)" @on-set-seats="(item, seats) => billingStore.setSeats(item, seats)"></billing-modules-list>
            <billing-pricing-summary></billing-pricing-summary>
        </div>
    </gb-window>
</template>
