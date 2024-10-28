<script setup lang="ts">

import {ref} from "vue";
import PasswordInput from "@/views/platform/__components/__components/PasswordInput.vue";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import GbTooltip from "@/views/ui/tooltips/GbTooltip.vue";
import GembaseUtils from "@/utils/GembaseUtils";
import GbWindow from "@/views/ui/popups/GbWindow.vue";

const password = ref<string>();
const passwordConfirm = ref<string>();
const errorPassword = ref(false);
const errorPasswordConfirm = ref(false);
const passwordTooltipText = ref("");
const passwordTooltipCnt = ref(0);
const passwordConfirmTooltipText = ref("");
const passwordConfirmTooltipCnt = ref(0);

const props = defineProps<{
    email: string
}>();

const emits = defineEmits<{
    (event: "confirm", password: string)
}>();

async function onConfirm() {
    if (password.value !== undefined) {

        if (password.value.length < 4) {
            passwordTooltipCnt.value++;
            passwordTooltipText.value = "Password must be at least 4 characters";
            errorPassword.value = true;
            await GembaseUtils.sleep(1000);
            errorPassword.value = false;
            return;
        }

        if (password.value !== passwordConfirm.value) {
            passwordConfirmTooltipCnt.value++;
            passwordConfirmTooltipText.value = "Password and confirm password must be same";
            errorPasswordConfirm.value = true;
            await GembaseUtils.sleep(1000);
            errorPasswordConfirm.value = false;
            return;
        }

        emits("confirm", password.value);
    }
}

</script>

<template>
    <gb-window header="Please set your password" class="scoped-root">
        <div class="gb-inner-window">
            <div class="gb-layout-tl gap-2 p-2">
                <div class="gb-layout-tl-row">
                    <div class="w-[var(--label-w)]">Work email</div>
                    <input class="w-[var(--input-w)]" readonly :data-not-allowed="true" :value="props.email">
                </div>
                <div class="gb-layout-tl-row">
                    <div class="w-[var(--label-w)]">Password</div>
                    <div class="relative">
                        <gb-tooltip :show="passwordTooltipCnt" :text="passwordTooltipText"></gb-tooltip>
                        <password-input :error="errorPassword" class="w-[var(--input-w)]" @input="(x) => password = x"></password-input>
                    </div>
                </div>
                <div class="gb-layout-tl-row">
                    <div class="w-[var(--label-w)]">Confirm password</div>
                    <div class="relative">
                        <gb-tooltip :show="passwordConfirmTooltipCnt" :text="passwordConfirmTooltipText"></gb-tooltip>
                        <password-input :error="errorPasswordConfirm" class="w-[var(--input-w)]" @input="(x) => passwordConfirm = x"></password-input>
                    </div>
                </div>
            </div>
        </div>
        <div class="gb-layout-tr-row w-full pt-4">
            <gb-button @click="onConfirm" class="gbc-bg-primary" icon="check_single" text="Confirm"></gb-button>
        </div>
    </gb-window>
</template>

<style scoped>
.scoped-root {
  --label-w: 200px;
  --input-w: 300px;
}
</style>