<script setup lang="ts">

import {PortalConstants} from "@/models/portal/PortalConstants";
import {
    DISCOUNT_PLAYERS_RESEARCH,
    modulesDataView,
    useBillingStore,
} from "@/models/portal/billing/BillingStore";
import PortalUiSvg from "@/views/ui/svg/PortalUiSvg.vue";
import {onMounted, ref, watch} from "vue";
import GbSvg from "@/views/ui/icons/GbSvg.vue";
import PlatformModuleLogoElement from "@/views/platform/__components/PlatformModuleLogoElement.vue";
import {ModuleDataView} from "@/models/portal/billing/BillingData";

const billingStore = useBillingStore();

const moduleAnim = ref("");

const emits = defineEmits<{
    (event: "click", guid: string);
    (event: "onSetSeats", guid: string, seats: number);
}>();

watch(() => billingStore.routerQuery.query.showPlayersResearch, fromUrlToData);

onMounted(() => {
    fromUrlToData();
});

function fromUrlToData() {
    if (billingStore.initialized && billingStore.routerQuery.query.showPlayersResearch) {
        billingStore.routerQuery.remove({showPlayersResearch: undefined});
        const discount = billingStore.discounts.find((x) => x.id === DISCOUNT_PLAYERS_RESEARCH);
        if (discount !== undefined) {
            moduleAnim.value = discount.guid;
        }
    }
}

function getActiveSeats(data: ModuleDataView | undefined) {
    const item = getItem(data);
    if (item !== undefined && item.moduleId !== undefined) {
        return billingStore.getActiveSeats(item.moduleId);
    }
    return "";
}

function getSeatsTitle(data: ModuleDataView) {
    const item = getItem(data);
    if (item !== undefined && item.moduleId !== undefined) {
        return `${getActiveSeats(data)} Authorized users can already access ${item.title}. You have added ${item.currentSeats} more access to your basket.`;
    }
    return undefined;
}

function getItem(item: ModuleDataView | undefined) {
    const module = billingStore.modules.find((x) => x.guid === item?.guid);
    if (module !== undefined) {
        return module;
    }
    const discount = billingStore.discounts.find((x) => x.guid === item?.guid);
    if (discount !== undefined) {
        return discount;
    }
    return undefined;
}

watch(modulesDataView.value, () => {
    modulesDataView.value.forEach((x) => {
        billingStore.setSeats(x.guid, x.seats);
    })
});

</script>

<template>
    <div class="scoped-root gb-layout-tl gb-ui-scroll-v gap-2 max-h-[calc(100vh-500px)]">
        <div v-for="item in modulesDataView" :key="item.guid" :data-checked="item.checked" class="gb-layout w-full pl-4 pr-4 gb-module text-[0.8em]" :data-module-anim="moduleAnim === item.guid"  :data-force-green="getItem(item)?.forceGreen" :data-auto-check="getItem(item)?.autoCheck" :data-discount="getItem(item)?.isDiscount" :data-discount-module="getItem(item)?.isDiscountForModule" :data-tooltip="getSeatsTitle(item)">
            <div class="gb-module-bg" :data-tooltip="getItem(item)?.desc">
                <div @click="emits('click', item.guid)" class="z-[1] absolute inset-0"></div>
                <div class="min-w-[20px]">
                    <div v-if="!getItem(item)?.autoCheck || item.checked" class="checkbox ml-2" :data-transparent-bg="getItem(item)?.autoCheck">
                        <portal-ui-svg v-if="item.checked" class="h-full w-auto" icon="check_single"></portal-ui-svg>
                    </div>
                </div>
                <div class="gb-layout-row gap-2 w-[var(--gb-module-title-w)]">
                    <template v-if="getItem(item)?.isDiscount && !getItem(item)?.isDiscountForModule">
                        <div class="font-bold">{{getItem(item)?.discount}}% OFF</div>
                    </template>
                    <platform-module-logo-element v-if="getItem(item)?.moduleId !== undefined" class="w-full" :billing-module-id="getItem(item)?.moduleId"></platform-module-logo-element>
                    <platform-module-logo-element v-else class="w-full" :hide-gembase="getItem(item)?.hideGembase" :icon="getItem(item)?.moduleIcon" :label="getItem(item)?.moduleLabel"></platform-module-logo-element>
                </div>
                <div class="w-[335px] text-[0.8em]">
                    {{getItem(item)?.shortDesc}}
                </div>
                <div class="gb-layout-row w-[160px]">
                    <div v-if="!getItem(item)?.isDiscount" class="gb-layout-row gap-1">
                        <div class="whitespace-nowrap w-[80px]">
                            <span class="font-bold">
                                Users
                            </span>
                            <span v-if="getActiveSeats(item) > 0" class="text-[0.8em]">
                                ({{getActiveSeats(item)}})
                            </span>
                        </div>
                        <input v-if="!item.checked" placeholder="0" class="w-[var(--gb-module-seats-w)] max-h-[28px] pointer-events-none border border-black">
                        <input v-else type="number" v-model="item.seats" class="border border-black w-[var(--gb-module-seats-w)] max-h-[28px] relative z-[2]">
                    </div>
                    <div v-else>
                        All users
                    </div>
                </div>
                <div class="gb-layout-ml-row h-[30px] w-[var(--gb-module-price-w)]">
                    <gb-svg :icon="PortalConstants.ICON_EURO" class="h-[90%] w-auto"></gb-svg>
                    <div class="gb-layout-ml h-full leading-[0.9]">
                        <div class="font-bold text-[1.2em]">
                            {{getItem(item)?.priceInItems}}
                        </div>
                        <div class="text-[0.7em]">
                            {{getItem(item)?.priceText}}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.scoped-root {
  --gb-module-title-w: 120px;
  --gb-module-price-w: 100px;
  --gb-module-seats-w: 50px;
}

.gb-module {
  @apply cursor-pointer;
}

.gb-module .gb-module-bg {
  @apply relative bg-dark-violet gb-layout-ml-row w-full gap-4 h-[60px] pl-4 pr-4 pt-1 pb-1 rounded-full;
}

.gb-module[data-module-anim="true"] .gb-module-bg {
  animation: billing-module-anim-keyframes 0.5s;
  animation-iteration-count: 5;
}

.gb-module[data-force-green="true"] .gb-module-bg {
  @apply border border-dim-ocean bg-violet;
}

.gb-module[data-discount="true"] .gb-module-bg {
  @apply border border-ocean bg-white bg-opacity-5;
}

.gb-module[data-discount-module="true"] .gb-module-bg {
  @apply border border-ocean bg-white bg-opacity-5;
}

.gb-module[data-discount-multi="true"] .gb-module-bg {
  @apply border border-ocean bg-white bg-opacity-5;
}

.gb-module[data-checked="true"] .gb-module-bg {
  @apply bg-orange text-black;
}

.gb-module[data-checked="true"][data-discount="true"] .gb-module-bg {
  @apply bg-ocean text-black;
}

.gb-module[data-checked="true"][data-force-green="true"] .gb-module-bg {
  @apply bg-ocean text-black;
}

.gb-module[data-auto-check="true"] {
  @apply opacity-50 pointer-events-none cursor-default;
}

.gb-module[data-auto-check="true"][data-checked="true"] {
  @apply opacity-100;
}

input {
  font-weight: bold !important;
}

.gb-module-checked[data-checked="false"] input {
  @apply border-gray-600 text-white font-bold;
}

@keyframes billing-module-anim-keyframes {
  0% {
    @apply text-black;
  }

  50% {
    @apply text-orange;
  }

  100% {
    @apply text-black;
  }
}

</style>