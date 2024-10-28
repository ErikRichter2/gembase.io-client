<script setup lang="ts">

import PortalUiSvg from "@/views/ui/svg/PortalUiSvg.vue";
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
    <gb-window header="Your payment has failed" :close-route="RoutesEnum.PORTAL_GUIDE">
        <div class="gb-ui-window-header">
            <div class="gb-layout-tc-row gap-2">
                <portal-ui-svg class="text-alert gb-ui-svg-current aspect-square h-[40px]" icon="close"></portal-ui-svg>
                <div>Your payment has failed</div>
            </div>
        </div>
        <div class="gb-inner-window">
            <div class="gb-layout-tl gap-2 text-[0.8rem] p-3">
                <div>
                    Your payment did not go through. Please repeat the payment process.
                    If the problem persists, please contact us via email or chat below.
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
