<script setup lang="ts">
import {PortalConstants} from "@/models/portal/PortalConstants";
import {onMounted, onUnmounted, ref} from "vue";
import {useBillingStore} from "@/models/portal/billing/BillingStore";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import GbWindow from "@/views/ui/popups/GbWindow.vue";
import BillingOrderSteps from "@/views/platform/modules/billing/__components/__components/BillingOrderSteps.vue";
import {useFullscreenLoading} from "@/models/ui/FullscreenLoadingComposable";

const billingStore = useBillingStore();
const fullscreenLoading = useFullscreenLoading();

const stripeResponded = ref(false);
const stripeUrl = ref("");
const countdown = ref(5);

let countdownInterval = 0;

onMounted(async () => {
    if (billingStore.routerQuery.query.processOrder === "1") {
        fullscreenLoading.show();

        const response = await billingStore.paymentRequest();
        stripeUrl.value = response.redirect;

        await billingStore.routerQuery.remove({processOrder: undefined});

        fullscreenLoading.hide();

        stripeResponded.value = true;
        countdown.value = 5;

        window.clearTimeout(countdownInterval);
        countdownInterval = window.setInterval(() => {
            countdown.value -= 1;
            if (countdown.value <= 0) {
                window.location.replace(stripeUrl.value);
                window.clearTimeout(countdownInterval);
            }
        }, 1000);
    }
});

onUnmounted(() => {
    window.clearTimeout(countdownInterval);
    countdownInterval = 0;
});

</script>

<template>
    <gb-window header="Thank you for your order">
        <div class="gb-inner-window">
            <div class="gb-layout-row gap-5 pr-3 pt-3 pb-3">
                <div class="pl-r pr-4 m-w-[480px] text-[0.8em]">
                    You will be automatically redirected to Stripe checkout in {{countdown}} seconds.
                    <br><br>
                    Or <a :href="stripeUrl" class="!text-yellow">click here</a> to redirect manually.
                </div>
                <billing-order-steps></billing-order-steps>
            </div>
        </div>
        <div class="gb-layout-row gap-2 pl-4 pr-4">
            <a :href="`mailto:${PortalConstants.MAIL_CONTACT}`">
                <gb-button class="gbc-bg-primary" :icon="PortalConstants.ICON_EMAIL" :text="PortalConstants.MAIL_CONTACT"></gb-button>
            </a>
        </div>
    </gb-window>
</template>
