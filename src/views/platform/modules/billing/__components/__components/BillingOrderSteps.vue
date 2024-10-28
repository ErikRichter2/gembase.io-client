<script setup lang="ts">

import {PortalConstants} from "@/models/portal/PortalConstants";
import {useBillingStore} from "@/models/portal/billing/BillingStore";
import GbSvg from "@/views/ui/icons/GbSvg.vue";

const billingStore = useBillingStore();

enum StepEnum {
    SELECTION, ADDRESS, STRIPE, CONFIRM
}

function getStepState(step: StepEnum) {
    if (billingStore.routerQuery.query.checkoutResult === "success") {
        if (step === StepEnum.CONFIRM) {
            return "final";
        }
        return "locked";
    }

    if (billingStore.routerQuery.query.checkoutResult === "cancel") {
        if (step === StepEnum.STRIPE) {
            return "error";
        }
        if ([StepEnum.SELECTION, StepEnum.ADDRESS].includes(step)) {
            return "active";
        }
        return "locked";
    }

    if (billingStore.routerQuery.query.show === "orderConfirmation") {
        if (step === StepEnum.STRIPE) {
            return "current";
        }
        if ([StepEnum.SELECTION, StepEnum.ADDRESS].includes(step)) {
            return "active";
        }
        return "locked";
    }

    if (billingStore.routerQuery.query.show === "billingDetails") {
        if (step === StepEnum.ADDRESS) {
            return "current";
        }
        if ([StepEnum.SELECTION].includes(step)) {
            return "active";
        }
        return "locked";
    }

    if (billingStore.routerQuery.query.show === undefined) {
        if (step === StepEnum.SELECTION) {
            return "current";
        }
        return "locked";
    }

    return "locked";
}

</script>

<template>
    <div class="scoped-root gb-layout-row h-[50px]">
        <div class="gb-layout gb-step" :data-state="getStepState(StepEnum.SELECTION)">
            <gb-svg class="h-[30px] aspect-square" :icon="PortalConstants.ICON_RED_CARPET"></gb-svg>
            <div class="gb-layout step-text">Services selection</div>
        </div>
        <div class="gb-billing-separator"></div>
        <div class="gb-layout gb-step" :data-state="getStepState(StepEnum.ADDRESS)">
            <gb-svg class="h-[30px] aspect-square" :icon="PortalConstants.ICON_RECEIPT"></gb-svg>
            <div class="gb-layout step-text">Billing details</div>
        </div>
        <div class="gb-billing-separator"></div>
        <div class="gb-layout gb-step" :data-state="getStepState(StepEnum.STRIPE)">
            <gb-svg class="h-[25px] aspect-square" icon="credit-card"></gb-svg>
            <div class="step-text">Stripe payment</div>
        </div>
        <div class="gb-billing-separator"></div>
        <div class="gb-layout gb-step" :data-state="getStepState(StepEnum.CONFIRM)">
            <gb-svg class="h-[30px] aspect-square" icon="shopping-cart"></gb-svg>
            <div class="step-text">Order completed</div>
        </div>
    </div>
</template>

<style scoped>
.scoped-root {
  @apply pointer-events-none;
}

.gb-step {
  @apply max-w-[50px] text-[0.5em] text-white leading-[1] whitespace-normal text-center gap-1 font-bold;
}

.gb-step[data-state="locked"] {
  @apply text-gray-600 font-normal;
}

.gb-step[data-state="active"] {
  @apply text-white;
}

.gb-step[data-state="current"] {
  @apply text-white;
}

.gb-step[data-state="current"] .step-text {
  @apply text-orange;
}

.gb-step[data-state="final"] .step-text {
  @apply text-dim-ocean;
}

.gb-step[data-state="error"] .step-text {
  @apply text-dim-magenta;
}

.gb-step svg {
  @apply h-[30px] w-auto;
}

.gb-billing-separator {
  @apply gb-layout-tl h-full;
}

.gb-billing-separator::after {
  @apply w-[10px] h-[2px] bg-gray-600 mt-3;

  content: "";
}

</style>