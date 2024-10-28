<script setup lang="ts">

import GbButton from "@/views/ui/buttons/GbButton.vue";
import GbSvg from "@/views/ui/icons/GbSvg.vue";
import {useTutorialStore} from "@/models/portal/tutorial/TutorialStore";
import PortalUiRouterLink from "@/views/ui/router/PortalUiRouterLink.vue";
import {RoutesEnum} from "@/router/RoutesEnum";
import {usePortalStore} from "@/models/portal/PortalStore";

const tutorialStore = useTutorialStore();
const portalStore = usePortalStore();

</script>

<template>
    <div v-if="tutorialStore.isTutorial" class="gb-inner-window">
        <div class="text-white pt-2 pb-2">
            <div v-if="!tutorialStore.tutorialUiToggled" class="gb-layout-tl gap-1">
                <gb-button @click="tutorialStore.tutorialUiToggled = true" class="gbc-bg-primary" icon="process" text="Onboarding"></gb-button>
                <div class="bg-black h-[10px] w-full rounded gb-layout-tc">
                    <div class="gbc-bg-primary h-[6px] rounded mr-0.5 ml-0.5" :style="{width: `${tutorialStore.tutorialProgress}%`}"></div>
                </div>
            </div>
            <div v-else class="gb-layout gap-1 w-full">
                <div @click="tutorialStore.tutorialUiToggled = false" class="gb-layout-m-between w-full pl-1 pr-1 cursor-pointer">
                    <div class="text-[0.9rem]">Onboarding</div>
                    <gb-svg icon="expand_menu" class="h-[20px]"></gb-svg>
                </div>
                <div class="bg-black h-[10px] w-full rounded gb-layout-ml">
                    <div class="gbc-bg-primary h-[6px] rounded mr-0.5 ml-0.5" :style="{width: `${tutorialStore.tutorialProgress}%`}"></div>
                </div>
                <portal-ui-router-link :name="RoutesEnum.PORTAL_GUIDE" class="w-full">
                    <gb-button text="Solutions" icon="light-bulb" class="gbc-bg-primary mt-2 !w-full"></gb-button>
                </portal-ui-router-link>
                <gb-button @click="tutorialStore.onIntroduction()" text="Introduction" icon="play" class="gbc-bg-primary !w-full"></gb-button>
            </div>
        </div>
    </div>
    <gb-button v-else @click="portalStore.inviteFriendPopup = true" class="gbc-bg-primary" icon="add-user" text="Invite others"></gb-button>
</template>
