<template>

    <div class="gb-ui w-full h-full">
        <router-view v-if="enableRouterView"></router-view>
    </div>

    <!-- MOUSE OVER TOOLTIP -->
    <div ref="refTitleTooltip" class="fixed pointer-events-none z-[1000]">
        <div v-if="refTooltipText !== undefined" class="text-[12px] rounded-2xl pr-3 pl-3 pt-1 pb-1 mt-[10px] ml-[10px] bg-black bg-opacity-80">
            {{refTooltipText}}
        </div>
    </div>
    <!-- MOUSE OVER TOOLTIP -->

    <!-- TUTORIAL HAND -->
    <div ref="tutorialHand" class="fixed top-1/2 left-1/2 w-[60px] h-[60px] z-[10000] pointer-events-none rotate-[-45deg]">
        <img v-if="tutorialHandVisible" class="absolute opacity-0" :src="UiUtils.getIcon('tap.png')">
    </div>
    <!-- TUTORIAL HAND -->

    <!-- LOADING DIALOG -->
    <gb-window-container v-if="uiStore.data.isLoadingDialog" :fixed="true" :black-bg="uiStore.data.isLoadingDialogTransparentBg !== true">
        <div class="gb-loading-dialog">
            <div class="gb-loading-dialog-message">
                <gb-svg class="gb2-loading-anim w-[30px] h-[30px]" icon="loading"></gb-svg>
                <div>Loading ...</div>
            </div>
        </div>
    </gb-window-container>
    <!-- LOADING DIALOG -->

    <!-- MESSAGE DIALOGS -->
    <message-dialog v-for="data in uiStore.messageDialogs" :key="data.id" :data="data"></message-dialog>
    <!-- MESSAGE DIALOGS -->

    <!-- TEST BANNER -->
    <div v-if="AppConfig.isTest" class="fixed w-full h-[5px] top-0 bg-dim-magenta z-[999999]"></div>
    <!-- TEST BANNER -->
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, ref} from "vue";
import {useUiStore} from "@/models/ui/UiStore";
import AppConfig from "@/config/AppConfig";
import {UiUtils} from "@/utils/UiUtils";
import {tutorialHand, tutorialHandVisible} from "@/models/portal/tutorial/TutorialData";
import GembaseUtils from "@/utils/GembaseUtils";
import MessageDialog from "@/views/ui/dialog/MessageDialog.vue";
import GbSvg from "@/views/ui/icons/GbSvg.vue";
import GbWindowContainer from "@/views/ui/popups/GbWindowContainer.vue";

const uiStore = useUiStore();

const refTitleTooltip = ref<HTMLElement>();
const refTooltipText = ref<string>();
const enableRouterView = ref(false);

let currentMouseMoveEl: HTMLElement | undefined = undefined;
let tooltipTimer = 0;

onMounted(async () => {
    enableRouterView.value = true;
    uiStore.hideAllLoadingDialogs();
    document.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onResize);
    onResize();
});

onUnmounted(async () => {
    document.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("resize", onResize);
    if (tooltipTimer !== 0) {
        window.clearTimeout(tooltipTimer);
    }
});

function onResize() {
    uiStore.data.windowW = window.innerWidth;
    uiStore.data.windowH = window.innerHeight;
    uiStore.data.screenW = screen.width;
    uiStore.data.screenH = screen.height;
}

function onMouseMove(e: MouseEvent) {
    uiStore.data.mouseX = e.clientX;
    uiStore.data.mouseY = e.clientY;
    if (refTitleTooltip.value !== undefined) {
        refTitleTooltip.value.style.left = `${e.clientX}px`;
        refTitleTooltip.value.style.top = `${e.clientY}px`;
    }
    refTooltipText.value = undefined;
    if (e.target instanceof HTMLElement) {
        currentMouseMoveEl = e.target;
    }
    __showTooltipOnMouseMoved();
}

function __showTooltipOnMouseMoved() {

    function __getTooltipFromElement(__el: HTMLElement): {
        el: HTMLElement,
        text: string,
        delay?: number
    } | undefined {
        if (__el.dataset.tooltip !== undefined) {
            return {
                el: __el,
                text: __el.dataset.tooltip,
                delay: GembaseUtils.parseNumberSafe(__el.dataset.tooltipDelay)
            };
        }

        if (__el.parentElement !== null) {
            return __getTooltipFromElement(__el.parentElement);
        }

        return undefined;
    }

    if (currentMouseMoveEl === undefined) {
        return;
    }

    const tooltipData = __getTooltipFromElement(currentMouseMoveEl);

    if (tooltipTimer !== 0) {
        window.clearTimeout(tooltipTimer);
        tooltipTimer = 0;
    }

    if (tooltipData === undefined) {
        return;
    }

    tooltipData.delay ??= 500;

    if (tooltipData.delay === 0) {
        refTooltipText.value = tooltipData.text;
        return;
    }

    tooltipTimer = window.setTimeout(() => {
        refTooltipText.value = tooltipData.text;
    }, tooltipData.delay);
}

</script>
