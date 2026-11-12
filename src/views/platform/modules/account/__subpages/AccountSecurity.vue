<script setup lang="ts">
import GbButton from '@/views/ui/buttons/GbButton.vue'
import { ref } from 'vue'
import GbWindow from '@/views/ui/popups/GbWindow.vue'
import { useSessionStore } from '@/stores/SessionStore'

const sessionStore = useSessionStore()
const tooltipCnt = ref(0)

function onConfirm() {
    sessionStore.requestPasswordChange()
    tooltipCnt.value++
}
</script>

<template>
    <gb-window header="You can change your password" :hide-close="true">
        <div class="gb-inner-window p-4">
            <div class="gb-layout-tl gap-2">
                <div class="max-w-[600px]">
                    {{
                        `Please use the button below. We will send the link to change your password
                        to ${sessionStore.userData.email}.`
                    }}
                </div>
            </div>
        </div>
        <div class="gb-ui-window-footer">
            <gb-button
                @click="onConfirm"
                class="gbc-bg-primary"
                icon="email"
                text="Send reset link"
                :bottom-message-request="tooltipCnt"
                bottom-message="Email has been sent …"
            ></gb-button>
        </div>
    </gb-window>
</template>
