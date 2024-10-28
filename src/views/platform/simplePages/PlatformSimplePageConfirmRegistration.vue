<script setup lang="ts">

import {useRegistrationStore} from "@/models/portal/registration/RegistrationStore";
import {computed, onMounted, ref} from "vue";
import RegistrationSetPassword from "@/views/platform/__components/PlatformUserSetPassword.vue";
import RegistrationSetPersonal from "@/views/platform/simplePages/__components/RegistrationSetPersonal.vue";
import {RegistrationUserData} from "@/models/portal/registration/RegistrationData";
import HomeSignUpNotWhitelisted from "@/views/home/HomeSignUpNotWhitelisted.vue";
import {useFullscreenLoading} from "@/models/ui/FullscreenLoadingComposable";

const registrationStore = useRegistrationStore();
const fullscreenLoading = useFullscreenLoading();

const __password = ref("");

let isRegistering = false;

onMounted(async () => {
    await registrationStore.getRegistrationConfirmDef();
});

function onSetPassword(password: string) {
    __password.value = password;
    registrationStore.show = "personal";
}

async function onSetPersonal(data: RegistrationUserData) {
    if (isRegistering) {
        return;
    }
    isRegistering = true;
    fullscreenLoading.show();
    data.password = __password.value;
    await registrationStore.confirmRegistration(data);
    fullscreenLoading.hide();
    isRegistering = false;
}

const def = computed(() => {
    return registrationStore.registrationConfirmDef;
});

</script>

<template>
    <div class="w-full h-full">
        <home-sign-up-not-whitelisted v-if="registrationStore.show === 'whitelist_pending'"></home-sign-up-not-whitelisted>
        <div class="w-full h-full" v-else-if="def?.user_data !== undefined">
            <registration-set-password v-if="registrationStore.show === 'password'" @confirm="onSetPassword" :email="def.user_data.email"></registration-set-password>
            <registration-set-personal v-else-if="registrationStore.show === 'personal'" @confirm="onSetPersonal" :user-data="def.user_data" :dev-title="def.dev_title" :position-area-def="def.position_area_def" :position-role-def="def.position_role_def"></registration-set-personal>
        </div>
    </div>
</template>
