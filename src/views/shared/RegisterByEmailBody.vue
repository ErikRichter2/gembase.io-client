<script setup lang="ts">

import GbButton from "@/views/ui/buttons/GbButton.vue";
import {RoutesEnum} from "@/router/RoutesEnum";
import {ref} from "vue";
import {useRegistrationStore} from "@/models/portal/registration/RegistrationStore";
import GbTooltip from "@/views/ui/tooltips/GbTooltip.vue";
import GembaseUtils from "@/utils/GembaseUtils";
import {useRouterStore} from "@/core/router/RouterStore";
import {useFullscreenLoading} from "@/models/ui/FullscreenLoadingComposable";

defineProps<{
    showSignIn?: boolean;
}>();

const email = ref("");
const errorEmail = ref(false);
const showConfirm = ref(false);
const emailSentTooltip = ref(0);

const registrationStore = useRegistrationStore();
const fullscreenLoading = useFullscreenLoading();

async function onNext() {
    if (await validateEmail()) {
        fullscreenLoading.show();
        await registrationStore.registerByEmail(email.value);
        showConfirm.value = true;
    }
    fullscreenLoading.hide();
}

async function onResend() {
    if (await validateEmail()) {
        fullscreenLoading.show();
        await registrationStore.registerByEmail(email.value);
        emailSentTooltip.value++;
    }
    fullscreenLoading.hide();
}

async function validateEmail() {
    if (!GembaseUtils.isValidEmail(email.value)) {
        errorEmail.value = true;
        await GembaseUtils.sleep(1000);
        errorEmail.value = false;
        return false;
    }
    return true;
}

</script>

<template>
    <div class="gb-layout-ml w-full gap-2">
        <div v-if="showConfirm" class="w-full">
            <div class="gb-layout-ml gap-2 w-full">
                <div class="gb-inner-window gb-layout gap-1 w-full">
                    <div class="w-full max-w-[600px] pl-2">
                        We have sent an email with instructions to the provided email address.
                    </div>
                </div>
                <div class="gb-layout-m pt-2 pb-3 pl-5 w-[calc(100%-20px)]">
                    <div class="relative">
                        <gb-tooltip :show="emailSentTooltip" text="Email sent ..."></gb-tooltip>
                        <gb-button @click="onResend" class="gbc-bg-primary" icon="free_access" text="Resend email"></gb-button>
                    </div>
                    <router-link v-if="showSignIn" :to="useRouterStore().getRoutePath(RoutesEnum.SIGN_IN)">
                        <gb-button class="gbc-bg-primary" text="Log in" icon="flip_card"></gb-button>
                    </router-link>
                </div>
            </div>
        </div>
        <div v-else class="gb-layout-tl gap-2 w-full">
            <div class="gb-inner-window gb-layout w-full">
                <div class="gb-layout-row flex-wrap gap-2 pl-2">
                    <div class="w-[150px]">Work email:</div>
                    <input :data-error="errorEmail" type="email" v-model="email" placeholder="Email address ..." tabindex="1" class="w-[430px] max-w-[calc(100%-120px)]">
                </div>
            </div>
            <div class="gb-layout-tr-row w-full pr-3">
                <gb-button @click="onNext" text="Next" icon="next" class="gbc-bg-primary"></gb-button>
            </div>
        </div>
    </div>
</template>

<style scoped>
input {
  border: 3px solid transparent;
}
</style>