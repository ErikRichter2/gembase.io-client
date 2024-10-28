<script setup lang="ts">

import RegistrationSetPassword from "@/views/platform/__components/PlatformUserSetPassword.vue";
import {onMounted, ref} from "vue";
import {useRegistrationStore} from "@/models/portal/registration/RegistrationStore";
import GbWindow from "@/views/ui/popups/GbWindow.vue";

const registrationStore = useRegistrationStore();

const email = ref<string>();
const initialized = ref(false);

onMounted(async () => {
    email.value = await registrationStore.getChangePasswordData();
    initialized.value = true;
});

async function onConfirm(password: string) {
    await registrationStore.changePassword(password);
}

</script>

<template>
    <registration-set-password v-if="email !== undefined" @confirm="onConfirm" :email="email"></registration-set-password>
    <gb-window v-if="initialized && email === undefined" header="This reset link is not valid. Please reset your password again."></gb-window>
</template>
