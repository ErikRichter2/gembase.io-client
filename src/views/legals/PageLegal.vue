<script setup lang="ts">
import {onMounted} from "vue";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import {useRouterStore} from "@/core/router/RouterStore";

onMounted(() => {
    window.scrollTo(0,0);
    document.getElementsByTagName("body")[0].style.overflow = "scroll";
});
</script>

<template>
    <div class="pt-[80px]">
        <gb-button @click="useRouterStore().back()" class="gbc-bg-primary ml-2 mt-2" icon="next" text="Back"></gb-button>
        <div class="gb-legal-content">
            <router-view></router-view>
        </div>
    </div>
</template>

<style>
.gb-legal-content {
  color: white;
  font-size: 16px;
  max-width: 800px;
  padding-left: 50px;
  padding-top: 50px;
  padding-bottom: 50px;
}

.gb-legal-content h1 {
  font-size: 22px;
  font-weight: bold;
  padding-bottom: 20px;
}

.gb-legal-content div {
  @apply gb-layout-tl gap-4 pb-4;
}

.gb-legal-content ul {
  @apply list-disc list-inside;
}
</style>

<style scoped>
:deep(svg) {
  transform: rotate(180deg);
}
</style>
