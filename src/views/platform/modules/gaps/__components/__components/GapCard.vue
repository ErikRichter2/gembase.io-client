<script setup lang="ts">

import {usePortalStore} from "@/models/portal/PortalStore";
import {RoutesEnum} from "@/router/RoutesEnum";
import GembaseUtils from "@/utils/GembaseUtils";
import {computed} from "vue";
import GbSvg from "@/views/ui/icons/GbSvg.vue";
import PortalUiRevealBtn from "@/views/shared/DemoRevealBtn.vue";
import {PortalConstants} from "@/models/portal/PortalConstants";
import GapCardBar from "@/views/platform/modules/gaps/__components/__components/GapCardBar.vue";
import {IPlatformCalcAffinity, TsColor} from "@/models/portal/calc/PlatformCalcData";
import GbImgLocal from "@/views/ui/img/GbImgLocal.vue";

const portalStore = usePortalStore();

const props = defineProps<{
    opportunity: IPlatformCalcAffinity,
    maxTam?: number
}>();

function getCardClickUrl(card: IPlatformCalcAffinity): any {

    if (card.locked === true) {
        return {
            name: ""
        }
    }

    return {
        name: RoutesEnum.PORTAL_MY_APPS,
        query: {
            show: "audit",
            opportunity: card.uuid,
            audienceAngle: card.audience_angle_id
        }
    };
}

const cardTitle = computed(() => {
    if (props.opportunity.locked === true) {
        return "Undisclosed";
    }
    return portalStore.getTagName(props.opportunity.affinity.tag_id);
});

const cardSubtitle = computed(() => {
    if (props.opportunity.locked === true) {
        return "";
    }
    const d = portalStore.getPortalDefProductItem(props.opportunity.affinity.tag_id);
    if (d !== undefined) {
        let s = d.subcategory;
        if (s[s.length - 1] === "s") {
            s = s.substring(0, s.length - 1);
        }
        return `${d.category} ${s.toLowerCase()}`
    }
    return "";
});

const cardTagDesc = computed(() => {
    if (props.opportunity.locked === true) {
        return "Opportunity unavailable in DEMO.";
    }
    return portalStore.getPortalDefProductItem(props.opportunity.affinity.tag_id)?.description ?? "";
});

const tamRatio = computed(() => {
    if (props.maxTam === undefined || props.maxTam === 0) {
        return 0;
    }
    return Math.round(100 * (props.opportunity.tam ?? 0) / props.maxTam);
});

</script>

<template>
    <router-link :to="getCardClickUrl(opportunity)" :style="{cursor: props.opportunity.locked === true ? 'default' : 'pointer'}">
        <div class="w-[350px] h-[300px] p-2 rounded-2xl bg-gradient-to-r from-night-violet to-night-violet-light border border-black text-white hover:brightness-125 data-[locked='true']:cursor-default data-[locked='true']:hover:brightness-100" :data-locked="opportunity.locked">
            <div class="w-full h-full gb-layout-tc">
                <div class="font-bold text-[1.2rem]">
                    {{cardTitle}}
                </div>
                <div class="font-thin opacity-70 text-[0.9rem]">
                    {{cardSubtitle}}
                </div>
                <div class="font-thin text-center opacity-70 text-[0.65rem] min-h-[50px]">
                    {{cardTagDesc}}
                </div>
                <div class="w-full h-full gb-layout-tl-row">
                    <div class="w-[80px] h-full pb-2 gb-layout gap-1">
                        <gap-card-bar :ratio="tamRatio" :text="GembaseUtils.formatNumber(opportunity.tam)" :color="TsColor.Green" :icon="PortalConstants.ICON_DOLLAR"></gap-card-bar>
                    </div>
                    <div class="w-full h-full">
                        <div v-if="opportunity.locked" class="w-full h-full gb-layout gap-2">
                            <gb-svg icon="locked" class="opacity-20 w-[50px] h-[50px]"></gb-svg>
                            <portal-ui-reveal-btn></portal-ui-reveal-btn>
                        </div>
                        <div v-else class="h-full w-full relative gb-layout-row">
                            <div class="absolute top-[70px] left-[20px] right-0 gb-layout-row">
                                <div class="absolute rounded-[50%] left-[25px] w-[110px] h-[90px] bg-ocean gb-glow-ocean gb-glow-size-lg"></div>
                                <gb-img-local class="absolute w-[160px] h-auto" src="gembase/gaps-min.png"></gb-img-local>
                            </div>
                            <div class="absolute bottom-[7px] gb-layout bg-black rounded-full p-1">
                                <div class="gb-layout-row rounded-2xl gap-1 pl-2 pr-2">
                                    <gb-svg :icon="PortalConstants.ICON_PLAYERS" class="h-[30px] w-auto"></gb-svg>
                                    <div>{{ GembaseUtils.formatNumber(opportunity.audience_stats.total_audience) }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="w-[80px] h-full pb-2 from-dark-blue to-black gb-layout gap-1">
                        <gap-card-bar :ratio="opportunity.ts ?? 0" :text="`${opportunity.ts}%`" :icon="PortalConstants.ICON_THREAT_SCORE" :color="TsColor.Red"></gap-card-bar>
                    </div>
                </div>
            </div>
        </div>
    </router-link>
</template>
