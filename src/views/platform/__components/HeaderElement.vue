<script setup lang="ts">

import {RoutesEnum} from "@/router/RoutesEnum";
import GbSvg from "@/views/ui/icons/GbSvg.vue";
import {useRouterStore} from "@/core/router/RouterStore";

const props = defineProps<{
    hamburgerVisible?: boolean,
    logoRoute?: RoutesEnum
}>();

const emits = defineEmits<{
    (event: 'onHamburgerClick'): void,
}>();

</script>

<template>
    <div class="fixed top-0 left-0 w-full h-[var(--gb-ui-portal-header-h)] bg-gradient-to-l from-night-violet to-night-violet-light border-b-[1px] border-black">
        <div class="gb-layout-m-between h-full font-bold pl-2 pr-2 pt-1">
            <div class="gb-layout-ml-row gb-ui-svg-current gap-2 w-full pl-2">
                <gb-svg v-if="props.hamburgerVisible" @click="emits('onHamburgerClick')" icon="home" class="gb-ui-svg-current text-white gb-glow-white cursor-pointer w-[35px] h-[35px]"></gb-svg>
                <div class="gb-layout-row md:gb-layout-ml-row w-full">
                    <router-link :to="useRouterStore().getRoutePath(logoRoute)">
                        <div class="gb-layout-row md:gb-layout-ml-row w-full">
                            <gb-svg class="h-[25px] w-auto gb-glow-ocean gb-glow-opacity-75" path="/static/media/gembase/logos/white_full_trimmed.svg"></gb-svg>
                        </div>
                    </router-link>
                </div>
            </div>
            <div class="gb-layout-ml-row">
                <slot></slot>
            </div>
        </div>
    </div>
</template>
