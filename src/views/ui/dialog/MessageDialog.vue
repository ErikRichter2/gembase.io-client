<script setup lang="ts">
import GbPopup from "@/views/ui/popups/GbPopup.vue";
import {IMessageDialogData} from "@/models/ui/UiData";
import {useUiStore} from "@/models/ui/UiStore";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import GbSection from "@/views/ui/popups/GbSection.vue";

const uiStore = useUiStore();

const props = defineProps<{
    data: IMessageDialogData
}>();

function onClose() {
    uiStore.hideMessageDialog(props.data.id);
    if (props.data.onClose !== undefined) {
        props.data.onClose();
    }
}

</script>

<template>
    <gb-popup @close="onClose" :type="data.type">
        <gb-section class="max-w-[800px] pt-7 text-[0.8em] h-full">
            <template #content>
                <div class="gb-selectable-text text-[0.8em]">
                    <div class="h-full" v-html="props.data.body"></div>
                </div>
            </template>
            <template #footer>
                <gb-button @click="onClose" class="gbc-bg-primary" text="Confirm"></gb-button>
            </template>
        </gb-section>
    </gb-popup>
</template>
