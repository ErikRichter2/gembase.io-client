<script setup lang="ts">

import {ref} from "vue";
import {useRegistrationStore} from "@/models/portal/registration/RegistrationStore";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import GbPopup from "@/views/ui/popups/GbPopup.vue";
import GbSvgV2 from "@/views/ui/icons/GbSvgV2.vue";
import LegalGeneralTermsOfService from "@/views/legals/LegalGeneralTermsOfService.vue";
import LegalUserPrivacyPolicy from "@/views/legals/LegalUserPrivacyPolicy.vue";

const registrationStore = useRegistrationStore();

const checked = ref(false);
const errorMsg = ref(false);

function confirm() {
    if (!checked.value) {
        errorMsg.value = true;
        setTimeout(() => {
            errorMsg.value = false;
        }, 2000);
        return;
    }
    registrationStore.confirmTos();
}

</script>

<template>
    <gb-popup :hide-close="true">
        <div class="max-w-[800px]">
            <div class="font-bold pb-4">
                Please read and agree with the General Terms of Service to access Gembase.io platform.
            </div>
            <div class="gb-layout-tl-row w-full gap-2 text-black text-[14px] max-h-[min(700px,calc(100vh-250px))]">
                <div class="legal-content gb-ui-scroll-v w-1/2 max-h-inherit">
                    <legal-general-terms-of-service></legal-general-terms-of-service>
                </div>
                <div class="legal-content gb-ui-scroll-v w-1/2 max-h-inherit">
                    <legal-user-privacy-policy></legal-user-privacy-policy>
                </div>
            </div>
            <div class="gb-layout-m-between pt-3 pl-3 pr-3">
                <div class="gb-layout-row gap-2 cursor-pointer">
                    <div @click="checked = !checked" class="checkbox">
                        <gb-svg-v2 v-if="checked" icon="check_single"></gb-svg-v2>
                    </div>
                    <div @click="checked = !checked" :data-text-error="errorMsg" class="text-dim-ocean">
                        I confirm I have read and agree to the General Terms of Service and User’s Privacy Policy above.
                    </div>
                </div>
                <div class="gb-layout-ml">
                    <gb-button @click="confirm" :inactive="!checked" text="Confirm" icon="check_single" class="gbc-bg-primary"></gb-button>
                </div>
            </div>
        </div>
    </gb-popup>
</template>

<style scoped>
.legal-content {
  @apply rounded p-5;

  background: var(--gb-portal-ui-element-gradient-black-to-white);
}

.legal-content::-webkit-scrollbar {
  @apply w-[8px] rounded-sm;
}

.legal-content::-webkit-scrollbar-track {
  @apply bg-dark-blue rounded-sm;
}

.legal-content::-webkit-scrollbar-thumb {
  @apply bg-orange rounded-sm border border-black;
}

:deep(.legal-content div) {
  @apply gb-layout-tl gap-5 pb-5;
}

:deep(.legal-content ul) {
  @apply list-disc list-inside;
}

:deep(.legal-content h1) {
  @apply font-bold pb-5;
}
</style>
