<script setup lang="ts">

import {useRegistrationStore} from "@/models/portal/registration/RegistrationStore";
import {onMounted, ref} from "vue";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import GbWindow from "@/views/ui/popups/GbWindow.vue";

const registrationStore = useRegistrationStore();
const subscribed = ref(false);

onMounted(async () => {
    await registrationStore.setEmailSubscription(false);
    subscribed.value = false;
});

async function onSubscribe(subscribe: boolean) {
    await registrationStore.setEmailSubscription(subscribe);
    subscribed.value = subscribe;
}

</script>

<template>
    <gb-window>
        <div v-if="subscribed">
            <div>You have been subscribed to marketing communication with Gembase.io. We appreciate it and only send few important emails.</div>
            <gb-button @click="onSubscribe(false)" class="gbc-bg-primary mt-4 ml-2" text="Unsubscribe" icon="email"></gb-button>
        </div>
        <div v-else>
            <div>You have been unsubscribed from marketing communication with Gembase.io. Thank you for your past interest and have a great day!</div>
            <gb-button @click="onSubscribe(true)" class="gbc-bg-primary mt-4 ml-2" text="Subscribe" icon="email"></gb-button>
        </div>
    </gb-window>
</template>
