<template>
    <div class="w-full h-auto">
        <div class="absolute inset-0">
            <router-view></router-view>
        </div>
        <div v-if="menuOn" class="fixed top-0 bottom-0 left-0 right-0" @click="toggleMenu(false)"></div>
        <div class="fixed w-full h-[8vmin] md:h-[5vmin] max-h-[100px] top-[4vmin] md:top-[2vmin] pointer-events-none">
            <div class="visible md:hidden menu-roll w-[170px] pointer-events-none absolute top-0 bottom-0" :data-menu-on="menuOn" :data-menu-anim="menuAnim">
                <div class="h-full pointer-events-none"></div>
                <div class="w-full pt-[2vmin] gb-layout-ml gap-[5px]">
                    <div v-for="item in topMenuButtons" :key="item.id" class="w-full h-[90%] pointer-events-auto">
                        <router-link class="gb-layout-row w-full h-full" :to="{name: RoutesEnum.HOME_INDEX, hash: `#${item.id}`}" @click="() => {homePageScrollModel.scrollToSectionByName(item.id); toggleMenu(false); }">
                            <div class="text-[0.8em] pl-[40px] pt-[5px] pb-[5px] gb-layout-ml-row bg-white bg-opacity-10 border-0 hover:border-[1px] data-[active='true']:border-[1px] w-full h-full rounded-full font-bold" :data-active="homePageScrollModel.data.value.activeSection?.name === item.id">
                                {{item.text}}
                            </div>
                        </router-link>
                    </div>
                </div>
            </div>

            <div class="h-full w-full pl-[2vmin] pr-[2vmin] gb-layout-m-between text-[3vmin] md:text-[2vmin]">
                <div class="w-[20vmin] h-full gb-layout-tl-row">
                    <portal-ui-router-link class="h-full" href="/" :disabled="uiStore.isMobile">
                        <div @click="toggleMenu()" class="pointer-events-auto relative h-full gb-layout">
                            <div class="absolute shadow-[0_0_40px_9px] shadow-ocean w-[1px] h-[1px]"></div>
                            <gb-svg title="Gembase.io" class="h-full w-auto" src="/static/media/gembase/logos/white_e.svg"></gb-svg>
                        </div>
                    </portal-ui-router-link>
                </div>
                <div class="hidden md:!gb-layout-row w-full h-full gap-[3vmin]">
                    <div v-for="item in topMenuButtons" :key="item.id" class="w-[25vmin] h-full pointer-events-auto">
                        <router-link class="gb-layout-row w-full h-full" :to="{name: RoutesEnum.HOME_INDEX, hash: `#${item.id}`}" @click="() => {homePageScrollModel.scrollToSectionByName(item.id); toggleMenu(false); }">
                            <gb-button :text="item.text" class="gbc-bg-transparent-10 w-full h-full font-bold !text-[100%]" :data-selected="homePageScrollModel.data.value.activeSection?.name === item.id"></gb-button>
                        </router-link>
                    </div>
                </div>
                <portal-ui-router-link class="pointer-events-auto w-[25vmin] h-full gb-layout" :name="RoutesEnum.SIGN_IN">
                    <gb-button class="gbc-bg-violet font-bold h-full !text-[100%] !pl-[3vmin] !pr-[3vmin]" text="SIGN IN" icon="sign_in"></gb-button>
                </portal-ui-router-link>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

import {onMounted, ref} from "vue";
import {RoutesEnum} from "@/router/RoutesEnum";
import {homePageScrollModel} from "@/models/home/HomePageScrollModel";
import PortalUiRouterLink from "@/views/ui/router/PortalUiRouterLink.vue";
import GbSvg from "@/views/ui/icons/GbSvg.vue";
import {useUiStore} from "@/models/ui/UiStore";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import {initSmartsupp} from "@/models/external/smartsupp/Smartsupp";

const uiStore = useUiStore();

const topMenuButtons = [
    {id: "solutions", text: "SOLUTIONS"},
    {id: "pricing", text: "PRICING"},
    {id: "company", text: "COMPANY"}
]

onMounted(async () => {
    initSmartsupp();
});

const menuOn = ref(false);
const menuAnim = ref(false);

function toggleMenu(_menuOn: boolean | undefined = undefined) {
    menuOn.value = _menuOn ?? !menuOn.value;
    menuAnim.value = true;
    window.setTimeout(() => {
        menuAnim.value = false;
    }, 1000);
}

</script>

<style scoped>
.menu-roll {
  left: -200px;
}

.menu-roll[data-menu-on="true"] {
  left: -30px;
}

.menu-roll[data-menu-on="true"][data-menu-anim="true"] {
  transition: 1s;
  left: -30px;
}

.menu-roll[data-menu-on="false"] {
  left: -200px;
}

.menu-roll[data-menu-on="false"][data-menu-anim="true"] {
  transition: 1s;
  left: -200px;
}
</style>

<style>
@import "vue3-carousel/dist/carousel.css";

body::before {
  background-image: url("/static/media/gembase/home/v2/gembase_background-min.jpg"), var(--gb-background);
}
</style>
