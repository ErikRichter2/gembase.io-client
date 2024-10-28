<script setup lang="ts">
import {ref} from "vue";
import GbSvg from "@/views/ui/icons/GbSvg.vue";

const password = ref<string>("");
const show = ref(false);

defineProps<{
    error?: boolean;
}>();

const emits = defineEmits<{
    (event: 'input', value: string)
}>();

</script>

<template>
    <div class="relative">
        <input :data-error="error" v-model="password" @input="emits('input', password)" placeholder="Please type password ..." class="w-full" :type="show ? 'text' : 'password'">
        <gb-svg @click="show = !show" class="text-black top-0 cursor-pointer absolute right-[5px] h-[30px] w-[30px]" icon="see_more"></gb-svg>
    </div>
</template>

<style scoped>
input {
  border: 3px solid transparent;
}
</style>