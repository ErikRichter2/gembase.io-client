<template>
    <div class="gb-layout-ml-row gap-2">
        <div>Model: </div>
        <select class="min-w-[50px]" @change="(event) => model = (event.target as any).value ?? models[0]">
            <option v-for="m in models" :key="m" :value="m" :selected="model === m">
                {{ m }}
            </option>
        </select>
    </div>
    <div class="relative z-[1] gb-layout-tl-row gap-2">
        <div class="gb-layout-tl">
            <div>Context</div>
            <textarea v-model="system"></textarea>
        </div>
        <div class="gb-layout-tl">
            <div>Prompt</div>
            <textarea v-model="prompt"></textarea>
        </div>
        <div class="gb-layout-tl">
            <button @click="onSubmit">Submit</button>
        </div>
        <div class="gb-layout-tl">
            <div>Answer</div>
            <textarea v-model="answer"></textarea>
        </div>
    </div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import ApiPostRequest from "@/core/requests/ApiPostRequest";
import {useRouterStore} from "@/core/router/RouterStore";
import {useFullscreenLoading} from "@/models/ui/FullscreenLoadingComposable";

const fullscreenLoading = useFullscreenLoading();

const system = ref("");
const prompt = ref("");
const answer = ref("");

const models = ref(["4o", "o1"])
const model = ref(models.value[0]);

async function onSubmit() {
    fullscreenLoading.show();
    answer.value = await new ApiPostRequest<string>("gpt4-test", {
        token: useRouterStore().getQueryKey("token"),
        system: system.value,
        prompt: prompt.value,
        model: model.value
    }).process();
    fullscreenLoading.hide();
}

</script>

<style scoped>
textarea {
  @apply h-[500px] w-[400px] text-black text-[14px];
}
</style>