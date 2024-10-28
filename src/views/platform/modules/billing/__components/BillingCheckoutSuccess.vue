<script setup lang="ts">

import GbButton from "@/views/ui/buttons/GbButton.vue";
import {PortalConstants} from "@/models/portal/PortalConstants";
import {RoutesEnum} from "@/router/RoutesEnum";
import {onMounted} from "vue";
import {useBillingStore} from "@/models/portal/billing/BillingStore";
import GbWindow from "@/views/ui/popups/GbWindow.vue";
import BillingOrderSteps from "@/views/platform/modules/billing/__components/__components/BillingOrderSteps.vue";

onMounted(async () => {
    await useBillingStore().confirmPayment();
});

</script>

<template>
    <gb-window header="Thank you for your order" :close-route="RoutesEnum.PORTAL_GUIDE">
        <div class="gb-inner-window">
            <div class="gb-layout-tl gap-2 text-[0.8rem] p-6">
                <div>
                    Your payment has been validated and you can now use the Gembase platform services.
                    If you have any questions, please contact us via email or chat below.
                </div>
            </div>
        </div>
        <div class="gb-layout-m-between w-full pl-3 pr-3 pt-1 pb-1">
            <a :href="`mailto:${PortalConstants.MAIL_CONTACT}`">
                <gb-button class="gbc-bg-primary" icon="email" :text="PortalConstants.MAIL_CONTACT"></gb-button>
            </a>
            <billing-order-steps></billing-order-steps>
        </div>
    </gb-window>
</template>
