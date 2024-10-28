<template>
    <register-by-email :show-sign-in="true" @close="useRouterStore().to(RoutesEnum.SIGN_IN)"></register-by-email>
</template>

<script setup lang="ts">
import {onMounted} from "vue";
import {RoutesEnum} from "@/router/RoutesEnum";
import {recaptchaModel} from "@/models/external/recaptcha/RecaptchaModel";
import RegisterByEmail from "@/views/home/__components/RegisterByEmail.vue";
import {useRouterStore} from "@/core/router/RouterStore";

onMounted(() => {
    recaptchaModel.showBadge();
});

</script>
