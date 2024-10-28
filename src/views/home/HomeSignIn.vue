<template>
    <gb-window header="Welcome ! Please sign in." :fixed="true" :hide-bg="true" :close-route="useRouterStore().getRoutePath(RoutesEnum.HOME_INDEX)">
        <div class="gb-layout-ml gap-2">
            <div class="gb-inner-window gb-layout gap-1">
                <div class="gb-layout-row gap-5">
                    <div class="w-[120px]">Email:</div>
                    <input :data-error="errorEmail" class="text-black w-[300px]" v-model="email" tabindex="1">
                    <router-link :to="useRouterStore().getRoutePath(RoutesEnum.SIGN_UP)">
                        <gb-button class="gbc-bg-secondary !w-[140px]" text="Create account"></gb-button>
                    </router-link>
                </div>
                <div class="gb-layout-row gap-5">
                    <div class="w-[120px]">Password:</div>
                    <div class="relative">
                        <gb-tooltip :duration="2000" :show="passwordTooltipCnt" :text="passwordTooltipText"></gb-tooltip>
                        <input :data-error="errorPassword" class="text-black w-[300px]" v-model="password" tabindex="2" :type="showPassword ? 'text' : 'password'">
                        <gb-svg @click="showPassword = !showPassword" class="text-black/50 top-0 cursor-pointer absolute right-[5px] h-[30px] w-[30px]" icon="see_more"></gb-svg>
                    </div>
                    <router-link :to="useRouterStore().getRoutePath(RoutesEnum.PASSWORD_RESET_REQUEST)">
                        <gb-button class="gbc-bg-secondary !w-[140px]" text="Reset password"></gb-button>
                    </router-link>
                </div>
            </div>
            <div class="pl-3 pr-3 relative">
                <gb-tooltip :duration="2000" :show="loginTooltipCnt" text="Invalid email or password"></gb-tooltip>
                <gb-button @click="onLogin" class="gbc-bg-primary" icon="free_access" text="Log In"></gb-button>
            </div>
        </div>
    </gb-window>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import {useAuthStore} from "@/models/auth/AuthStore";
import GembaseUtils from "@/utils/GembaseUtils";
import {recaptchaModel} from "@/models/external/recaptcha/RecaptchaModel";
import ServerError from "@/core/errors/ServerError";
import {RoutesEnum} from "@/router/RoutesEnum";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import GbTooltip from "@/views/ui/tooltips/GbTooltip.vue";
import GbWindow from "@/views/ui/popups/GbWindow.vue";
import GbSvg from "@/views/ui/icons/GbSvg.vue";
import {useRouterStore} from "@/core/router/RouterStore";
import {useFullscreenLoading} from "@/models/ui/FullscreenLoadingComposable";

const authStore = useAuthStore();
const fullscreenLoading = useFullscreenLoading();

const email = ref("");
const password = ref("");
const showPassword = ref(false);

const errorEmail = ref(false);
const errorPassword = ref(false);
const passwordTooltipText = ref("");
const passwordTooltipCnt = ref(0);
const loginTooltipCnt = ref(0);

onMounted(async () => {
    fullscreenLoading.show();

    await authStore.tryAuth();

    if (authStore.data.isAuthenticated) {
        await useRouterStore().to(RoutesEnum.PORTAL_GUIDE);
    } else {
        await recaptchaModel.showBadge();
    }

    fullscreenLoading.hide();
});

async function onLogin() {

    if (!GembaseUtils.isValidEmail(email.value)) {
        errorEmail.value = true;
        await GembaseUtils.sleep(1000);
        errorEmail.value = false;
        return;
    }

    if (password.value.length < 4) {
        errorPassword.value = true;
        passwordTooltipCnt.value++;
        passwordTooltipText.value = "Password must be at least 4 characters long"
        await GembaseUtils.sleep(1000);
        errorPassword.value = false;
        return;
    }

    fullscreenLoading.show({
        reason: "login"
    });

    const recaptchaToken = await recaptchaModel.execute("login");

    await authStore.loginCredentials({
        email: email.value,
        password: password.value,
        recaptcha_token: recaptchaToken
    }).catch(err => {
        fullscreenLoading.hide("login");
        const serverError = ServerError.tryParse(err);
        if (serverError !== null && serverError.id === "AUTH002") {
            loginTooltipCnt.value++;
        } else {
            throw err;
        }
    });

    if (authStore.data.isAuthenticated) {
        await recaptchaModel.hideBadge();
        await useRouterStore().to(authStore.getDefaultRoute());
        fullscreenLoading.hide("login");
    }
}


</script>

<style scoped>
  input {
    border: 3px solid transparent;
  }
</style>
