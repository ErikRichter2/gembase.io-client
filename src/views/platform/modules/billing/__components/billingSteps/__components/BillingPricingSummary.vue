<script setup lang="ts">

import {PortalConstants} from "@/models/portal/PortalConstants";
import {useBillingStore} from "@/models/portal/billing/BillingStore";
import {computed} from "vue";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import GbSvg from "@/views/ui/icons/GbSvg.vue";
import BillingOrderSteps from "@/views/platform/modules/billing/__components/__components/BillingOrderSteps.vue";

const billingStore = useBillingStore();

interface IButtonData {
    icon: string;
    text: string;
    disabled: boolean;
}

const buttonData = computed((): IButtonData | undefined => {
    if (billingStore.routerQuery.query.show === "billingDetails") {
        return {
            icon: PortalConstants.ICON_CHECK_SINGLE,
            text: "Send order",
            disabled: false
        }
    } else if (billingStore.routerQuery.query.show === undefined) {
        return {
            icon: PortalConstants.ICON_NEXT,
            text: "Continue",
            disabled: billingStore.checkedModulesCount() == 0
        }
    }

    return undefined;
});

</script>

<template>
    <div class="scoped-root gb-inner-window w-full">
        <div class="gb-layout-t-between w-full gap-12">
            <div class="gb-layout-tl pl-5 pt-2 pb-2">
                <div v-for="item in billingStore.pricingSummary" :key="item.text" class="gb-price-item" :data-type="item.type">
                    <div class="gb-layout-ml-row">
                        <div class="gb-layout-ml-row h-[30px] font-bold w-[var(--gb-price-width)]">
                            <div class="w-[5px]">{{item.type === 'discount' ? '-' : ''}}</div>
                            <gb-svg class="h-[80%] w-auto" :icon="PortalConstants.ICON_EURO"></gb-svg>
                            <div class="price">{{item.value}}</div>
                        </div>
                        <div class="price-text" v-html="item.text"></div>
                    </div>
                </div>
                <div class="text-orange text-[0.65rem] pl-2">
                    *We will return your money, if in 3 days you request the payment back for any reason
                </div>
            </div>
            <div class="gb-layout-bc h-full pt-10 pr-5 gap-14">
                <billing-order-steps></billing-order-steps>
                <div v-if="buttonData !== undefined" >
                    <div class="gb-layout-row w-full">
                        <gb-button @click="billingStore.billingOrderNextStep()" class="gbc-bg-primary !h-[45px] !pl-[35px] !pr-[35px] !rounded-full" :disabled="buttonData.disabled" :icon="buttonData.icon" :text="buttonData.text"></gb-button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.scoped-root {
  --gb-price-width: 120px;
}

.gb-price-item {
  @apply gb-layout-tl w-full;
}

.gb-price-item .price {
  @apply text-[1em];
}

.gb-price-item .price-text {
  @apply text-[0.7em];
}

.gb-price-item[data-type="discount"] {
  @apply text-ocean;
}

.gb-price-item[data-type="total"] {
  @apply text-orange;
}

.gb-price-item[data-type="total"]::before {
  @apply w-full h-[2px] bg-white/5 mt-2 mb-2;

  content: "";
}

.gb-price-item[data-type="total"] .price {
  @apply text-[1.2em];
}

.gb-price-item[data-type="total"] .price-text {
  @apply text-[1.2em] font-bold;
}
</style>