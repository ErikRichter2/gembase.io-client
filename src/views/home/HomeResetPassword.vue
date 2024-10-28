<template>
    <gb-window header="You can change your password" :fixed="true" :hide-bg="true">
        <div class="gb-layout-ml pt-2 gap-2">
            <div class="gb-inner-window !gb-layout-tl">
                <div class="max-w-[600px]">
                    {{`Please use the button below. We will send the link to change your password`}}
                </div>
            </div>
            <div class="gb-layout-tl-row gap-2 pr-2 pl-2 pt-2">
                <input :data-error="emailError" tabindex="1" v-model="email" placeholder="Enter your email ...">
                <div class="relative gb-layout-tc-row">
                    <gb-button @click="onSubmit" class="gbc-bg-primary" icon="email" text="Send reset link"></gb-button>
                    <gb-timeout class="text-primary text-[0.65rem] bottom-[-22px] absolute" :request="tooltipCnt" :duration="3000">
                        Email has been sent …
                    </gb-timeout>
                </div>
            </div>
        </div>
    </gb-window>
</template>

<script setup lang="ts">

import {ref} from "vue";
import EndpointRequest from "@/core/requests/EndpointRequest";
import GembaseUtils from "@/utils/GembaseUtils";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import GbTimeout from "@/views/ui/timer/GbTimeout.vue";
import GbWindow from "@/views/ui/popups/GbWindow.vue";

const email = ref("");
const emailError = ref(false);
const tooltipCnt = ref(0);

async function onSubmit() {
    emailError.value = false;

    if (!GembaseUtils.isValidEmail(email.value)) {
        await GembaseUtils.sleep(100);
        emailError.value = true;
        return;
    }

    await EndpointRequest.process2("public:request_password_change", {
        email: email.value
    });

    tooltipCnt.value++;
}

</script>

<style scoped>
  input {
    width: 350px;
    border: 3px solid transparent;
  }
</style>