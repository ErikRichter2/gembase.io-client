<script setup lang="ts">
import {computed, ref} from "vue";
import {LocalStorageModel} from "@/models/storage/LocalStorageModel";
import GbSvg from "@/views/ui/icons/GbSvg.vue";

const props = defineProps({
    closeId: {
        type: String,
        required: true
    },
    blink: Boolean
});

const isClosedThisSession = ref(false);

const isClosed = computed(() => {
    if (isClosedThisSession.value) {
        return true;
    }
    const val = LocalStorageModel.hasItem(`gb_ui_w_sub__${props.closeId}`);
    if (val) {
        return true;
    }
    return false;
});

function onClose() {
    isClosedThisSession.value = true;
    LocalStorageModel.setItem(`gb_ui_w_sub__${props.closeId}`, props.closeId);
}
</script>

<template>
    <div v-if="!isClosed" class="bg-white text-black rounded-xl p-2 w-full relative text-[0.7em]">
        <gb-svg icon="close" @click="onClose" class="cursor-pointer opacity-50 hover:opacity-100 absolute top-[10px] right-[10px] w-[15px] h-[15px]"></gb-svg>
        <div :class="{'gb-subtitle-blink': props.blink}" class="w-[90%] ml-2">
            <slot>
            </slot>
        </div>
    </div>
</template>

<style scoped>
.gb-subtitle-blink {
  animation: gb-subtitle-blinker-frames 1.5s linear infinite;
}

@keyframes gb-subtitle-blinker-frames {
  0% {
    color: inherit;
  }

  50% {
    @apply text-yellow;
  }

  100% {
    color: inherit;
  }
}

</style>