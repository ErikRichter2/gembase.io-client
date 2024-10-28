<script setup lang="ts">
import PortalUtils from "@/models/portal/PortalUtils";
import {usePortalStore} from "@/models/portal/PortalStore";
import GembaseUiWindowSubtitle from "@/views/ui/GembaseUiWindowSubtitle.vue";
import {computed, onMounted, onUnmounted, ref, watch} from "vue";
import {TTagId} from "@/models/portal/apps/AppsData";
import {NODE_CATEGORY_AUDIENCE} from "@/models/portal/PortalDataTypes";
import {AudienceTooltip} from "@/models/portal/competitor/PortalCompetitorData";
import * as am5 from "@amcharts/amcharts5";
import {DataItem, Tooltip} from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5flow from "@amcharts/amcharts5/flow";
import CssUtils from "@/utils/CssUtils";
import GembaseUtils from "@/utils/GembaseUtils";
import EndpointRequest from "@/core/requests/EndpointRequest";
import {usePlatformCalcStore} from "@/models/portal/calc/PlatformCalcStore";
import GbPopup from "@/views/ui/popups/GbPopup.vue";
import {GB_PALETTE} from "@/tailwind/gembaseTwPalette";
import GbSvg from "@/views/ui/icons/GbSvg.vue";
import {IFlowNodesDataItem} from "@amcharts/amcharts5/.internal/charts/flow/FlowNodes";
import ClientError from "@/core/errors/ClientError";
import {Color} from "@amcharts/amcharts5/.internal/core/util/Color";
import GbAdminButton from "@/views/platform/ui/GbAdminButton.vue";
import {useAuthStore} from "@/models/auth/AuthStore";

const portalStore = usePortalStore();

const mostHatedTags: TTagId[] = [];
const topLovedApps: string[] = [];

onMounted(refreshMostHated);

onUnmounted(() => {
    usePlatformCalcStore().removeContext("competitor-page-audience-tooltip");
});

const props = defineProps<{
    tooltipData: AudienceTooltip,
    fixed?: boolean
}>();

const emits = defineEmits<{
    (event: 'onClose'): void,
}>();

const nodeName = computed(() => {
    const res: string[] = [];
    props.tooltipData.lovedTags.forEach((x) => {
        const def = portalStore.getPortalDefProductItem(x);
        if (def !== undefined) {
            res.push(def.node);
        }
    })
    return res.join(" ");
});

watch(() => props.tooltipData.lovedTags, refreshMostHated);

async function refreshMostHated() {
    mostHatedTags.length = 0;
    topLovedApps.length = 0;

    const response = await EndpointRequest.process2<{
        top_loved: string[],
        most_hated: {
            tag_ids: TTagId[]
        }
    }>("platform_values:get_most_hated_tags", {
        audience_angle_id: props.tooltipData.audienceAngleId,
        loved_tags: {
            tag_ids: props.tooltipData.lovedTags
        },
        hated_tags: {
            tag_ids: props.tooltipData.hatedTags
        }
    });

    mostHatedTags.push(...response.most_hated.tag_ids);
    topLovedApps.push(...response.top_loved)

    renderChart();
}

const chart_div = ref<HTMLElement>();

let chartRoot: am5.Root | undefined = undefined;

function renderChart() {

    if (chartRoot !== undefined) {
        chartRoot.dispose();
        chartRoot = undefined;
    }

    if (chart_div.value === undefined) {
        return;
    }

    chartRoot = am5.Root.new(chart_div.value);
    chartRoot.setThemes([am5themes_Animated.new(chartRoot)]);

    chartRoot.container.children.push(am5.Container.new(chartRoot, {
        width: am5.percent(100),
        height: am5.percent(100),
        layout: chartRoot.verticalLayout,
        interactive: false,
    }));

    const tooltip: Tooltip = am5.Tooltip.new(chartRoot, {
        pointerOrientation: "up",
        //labelHTML: "<div>xxx</div>",
        getFillFromSprite: false,
        opacity: 0,
        visible: false,
        tooltipText: ""
    });

    tooltip._settings.background?.setAll({
        fill: am5.color(GB_PALETTE.BLACK),
        fillOpacity: 0.8,
        stroke: am5.color(GB_PALETTE.BLACK),
        strokeOpacity: 0
    });

    const series = chartRoot.container.children.push(am5flow.Sankey.new(chartRoot, {
        sourceIdField: "from",
        targetIdField: "to",
        valueField: "value",
        paddingRight: 200,
        paddingBottom: 30,
        showTooltipOn: "hover",
        hiddenSize: 0.03,
        minHiddenValue: 1,
        //tooltip: tooltip,
        //tooltipPosition: "pointer"
        tooltipText: ""
    }));

    series.links.template.setAll({
        interactive: false,
        tooltipText: "",
        tooltipHTML: "",
        tooltip: tooltip,
        // tooltipHTML: undefined
    })

    series.nodes.labels.template.setAll({
        fontWeight: "500",
        fontSize: 12,
        fill: am5.color(GB_PALETTE.WHITE),
        paddingRight: 15,
        fontFamily: CssUtils.getCssVariableValue("--gb-font-family"),
        interactive: false,

    });

    series.nodes.labels.template.adapters.add("opacity", (value, target) => {
        if (target.dataItem) {
            const dataItem = target.dataItem as DataItem<IFlowNodesDataItem>;
            if ((dataItem.dataContext as object)["opacity"] !== undefined) {
                return (dataItem.dataContext as object)["opacity"];
            }
        }
        return 1;
    });

    const audience = props.tooltipData.audienceStats;
    const tagDefMobile = portalStore.portalDefProduct.find((x) => x.platform_mobile === 1);
    const tagDefPC = portalStore.portalDefProduct.find((x) => x.platform_pc === 1);
    const platformTags = [tagDefPC?.tag_id ?? "", tagDefMobile?.tag_id ?? ""];

    function hasPlatform(id: "mobile" | "pc" | "console"): boolean {
        let foundPlatform = false;

        for (let i = 0; i < audience.app_platforms.tag_ids.length; ++i) {
            if (platformTags.includes(audience.app_platforms.tag_ids[i])) {
                foundPlatform = true;
                break;
            }
        }

        if (!foundPlatform) {
            return true;
        }

        if (id === "mobile") {
            return audience.app_platforms.tag_ids.includes(tagDefMobile?.tag_id ?? "");
        }

        if (id === "pc") {
            return audience.app_platforms.tag_ids.includes(tagDefPC?.tag_id ?? "");
        }

        return false;
    }


    let platformWW = 0;
    portalStore.potentialDownloads.platform.forEach((x) => platformWW += x.absolute);

    let platformBase = platformWW;

    let platformBaseAngle: undefined | number = undefined;
    if (audience.app_platforms.tag_ids.length > 0) {
        portalStore.potentialDownloads.platform.forEach((x) => {
            if (hasPlatform(x.id)) {
                platformBaseAngle ??= 0;
                platformBaseAngle += x.absolute;
            }
        });
    }

    if (platformBaseAngle !== undefined) {
        platformBase = platformBaseAngle;
    }

    const label_WW = `${GembaseUtils.formatNumber(platformWW)} all installs`;
    const label_LOVED = `${GembaseUtils.formatNumber(audience.loved_absolute)} like ${nodeName.value}`;
    const label_DISLIKE = `${GembaseUtils.formatNumber(audience.max_audience - audience.loved_absolute)} dislike ${nodeName.value}`;
    const label_LOYAL = `${GembaseUtils.formatNumber(audience.loyal_absolute)} loyal to other games`;
    const label_REJECTED = `${GembaseUtils.formatNumber(audience.rejected_absolute)} dislike other attributes`;
    const label_TAM = `${GembaseUtils.formatNumber(audience.total_audience)} remaining TAM`;
    const label_DISLIKE_FAKE = "DISLIKE_FAKE";

    series.links.template.adapters.add("tooltipHTML", (value, target) => {
        if (target.dataItem) {
            const dataItem = target.dataItem as DataItem<IFlowNodesDataItem>;
            if ((dataItem.dataContext as object)["to"] === label_LOYAL) {
                const lovedApps = ` (mainly ${topLovedApps.slice(0, 3).join(",<br>")} ...)`;
                return `<div style="height: 70px; line-height: 10px; padding-top: 15px;"><span style="font-size: 12px;">${label_LOYAL}</span><br><span style="font-size: 10px;">${lovedApps}</span></div>`;
            }
        }
        return "";
    });

    series.nodes.labels.template.adapters.add("html", (value, target) => {
        if (target.dataItem) {
            const dataItem = target.dataItem as DataItem<IFlowNodesDataItem>;
            if ((dataItem.dataContext as object)["rejected"]) {
                const tags: string[] = [];
                mostHatedTags.forEach((x) => tags.push(portalStore.getTagName(x)));
                const rejectedTags = ` (mainly ${tags.slice(0, 3).join(", ")} ...)`;

                return `<div style="line-height: 10px; padding-top: 15px;"><span style="font-size: 12px;">${label_REJECTED}</span><br><span style="font-size: 10px;">${rejectedTags}</span></div>`;
            }

            // if ((dataItem.dataContext as object)["loved"]) {
            //     const lovedApps = ` (mainly ${topLovedApps.slice(0, 3).join(",<br>")} ...)`;
            //     return `<div style="line-height: 10px; padding-top: 15px;"><span style="font-size: 12px;">${label_LOYAL}</span><br><span style="font-size: 10px;">${lovedApps}</span></div>`;
            // }
        }
        return value;
    });

    function getPlatformLabel(id: "mobile" | "pc" | "console"): string {
        let label = "";
        const data = portalStore.potentialDownloads.platform.find((x) => x.id === id);

        if (data === undefined) {
            throw new ClientError(`Not found ${id}`);
        }

        if (data.id === "mobile") {
            label = "Mobile";
        } else if (data.id === "pc") {
            label = "PC";
        } else if (data.id === "console") {
            label = "Console";
        }

        return `${GembaseUtils.formatNumber(data.absolute)} ${label}`;
    }

    function getGeoLabel(data: {id: "na" | "eu" | "latam" | "mena" | "apac", ratio: number}): {
        label: string,
        fill: string
    } {
        let label = "";
        let fill = GB_PALETTE.VIOLET;

        const value = data.ratio * platformBase;

        if (data.id === "na") {
            label = "North America";
        } else if (data.id === "eu") {
            label = "Europe";
        } else if (data.id === "latam") {
            label = "LATAM";
            fill = GB_PALETTE.GRAY_600;
        } else if (data.id === "mena") {
            label = "MENA";
            fill = GB_PALETTE.GRAY_600;
        } else if (data.id === "apac") {
            label = "APAC";
            fill = GB_PALETTE.GRAY_600;
        }

        return {
            label: `${GembaseUtils.formatNumber(value)} ${label}`,
            fill: fill
        };
    }

    const seriesNodes: {id: string, fill?: Color, opacity?: number, rejected?: boolean, loved?: boolean}[] = [
        { id: label_WW, fill: am5.color(GB_PALETTE.DARK_VIOLET) }
    ];

    portalStore.potentialDownloads.platform.forEach((y) => {
        seriesNodes.push({
            id: getPlatformLabel(y.id),
            fill: am5.color(GB_PALETTE.VIOLET)
        });
    });

    portalStore.potentialDownloads.geo.forEach((y) => {
        const t = getGeoLabel(y);
        seriesNodes.push({
            id: t.label,
            fill: am5.color(t.fill)
        });
    });

    const dislikePlatform = platformBase - audience.loved_absolute;

    seriesNodes.push(...[
        { id: label_LOVED, fill: am5.color(GB_PALETTE.DIM_OCEAN) },
        { id: label_TAM, fill: am5.color(GB_PALETTE.DIM_OCEAN) },
        { id: label_DISLIKE, fill: am5.color(GB_PALETTE.DIM_MAGENTA), opacity: dislikePlatform > 0 ? 1 : 0 },
        { id: label_LOYAL, loved: true, fill: am5.color(GB_PALETTE.DIM_MAGENTA), opacity: audience.loyal_absolute > 0 ? 1 : 0 },
        { id: label_REJECTED, rejected: true, fill: am5.color(GB_PALETTE.DIM_MAGENTA), opacity: audience.rejected_absolute > 0 ? 1 : 0 },
        { id: label_DISLIKE_FAKE, opacity: 0 },
    ]);

    series.nodes.data.setAll(seriesNodes);

    const seriesData: any[] = [];

    portalStore.potentialDownloads.platform.forEach((x) => {
        seriesData.push({
            from: label_WW,
            to: getPlatformLabel(x.id),
            value: x.absolute
        });
    });

    portalStore.potentialDownloads.platform.forEach((x) => {
        portalStore.potentialDownloads.geo.forEach((y) => {
            let value = 0;
            if (hasPlatform(x.id)) {
                value = y.ratio * x.absolute;
            }
            const label = getGeoLabel(y).label;
            seriesData.push({
                from: getPlatformLabel(x.id),
                to: label,
                value: value
            });
        });
    });

    portalStore.potentialDownloads.geo.forEach((x) => {
        const label = getGeoLabel(x).label;

        seriesData.push({
            from: label,
            to: label_LOVED,
            value: x.ratio * audience.loved_absolute
        });

        seriesData.push({
            from: label,
            to: label_DISLIKE,
            value: x.ratio * dislikePlatform
        });
    });

    seriesData.push({
        from: label_LOVED,
        to: label_TAM,
        value: audience.total_audience
    });

    seriesData.push({
        from: label_LOVED,
        to: label_REJECTED,
        value: audience.rejected_absolute
    });

    seriesData.push({
        from: label_LOVED,
        to: label_LOYAL,
        value: audience.loyal_absolute
    });

    seriesData.push({
        from: label_DISLIKE,
        to: label_DISLIKE_FAKE,
        value: 0
    });

    series.data.setAll(seriesData);

    chartRoot.numberFormatter = am5.NumberFormatter.new(chartRoot, {
        numberFormat: "#.a",
        bigNumberPrefixes: [
            { "number": 1e+3, "suffix": "k" },
            { "number": 1e+6, "suffix": "M" },
        ]
    });

    series.appear(1000, 100);
}

const adminStats = ref(false);

</script>

<template>
    <gb-popup @close="emits('onClose')" close-id="auditor_audience_tooltip_close">
        <div class="min-w-[1000px] pt-5">
            <div class="relative gb-layout-tl gap-1">
                <div class="gb-layout-row w-full gap-2">
                    <div class="gb-layout-row gap-2">
                        <gb-svg :src="PortalUtils.getIconForNodeCategory(NODE_CATEGORY_AUDIENCE)" class="h-[35px] w-auto"></gb-svg>
                        <span><b>{{ GembaseUtils.formatNumber(props.tooltipData.audienceStats.total_audience) }}</b> potential {{nodeName}} audience</span>
                    </div>
                </div>
                <div class="w-full">
                    <gembase-ui-window-subtitle close-id="competitor-page-audience-tooltip">
                <span>
                    Potential audience considers player preference variations but also loyalty to competitive products.
                </span>
                    </gembase-ui-window-subtitle>
                </div>
                <div class="w-full text-[0.8em]">
                    <div class="gb-inner-window w-full">
                        <div ref="chart_div" class="w-full h-[400px]"></div>
                    </div>
                </div>
                <div v-if="useAuthStore().isAdmin()" class="absolute">
                    <gb-admin-button text="Admin stats" @click="adminStats = !adminStats"></gb-admin-button>
                    <table v-if="adminStats && tooltipData.audienceStats.admin_data !== null" class="text-[0.7em] bg-night-violet">
                        <tr>
                            <td>Potential installs</td>
                            <td>{{GembaseUtils.numberWithSeparator(tooltipData.audienceStats.admin_data.potential_downloads)}}</td>
                        </tr>
                        <tr>
                            <td>Loved - REAL</td>
                            <td>{{GembaseUtils.round(tooltipData.audienceStats.admin_data.loved_survey_cnt / tooltipData.audienceStats.admin_data.total_survey_cnt, 4)}}</td>
                        </tr>
                        <tr>
                            <td>Loved - HACK</td>
                            <td>{{tooltipData.audienceStats.admin_data.loved_ratio_ext}}</td>
                        </tr>
                        <tr>
                            <td>Loved - Absolute</td>
                            <td>{{GembaseUtils.numberWithSeparator(GembaseUtils.round(tooltipData.audienceStats.loved_absolute))}}</td>
                        </tr>
                        <tr>
                            <td>Survey total</td>
                            <td>{{GembaseUtils.round(tooltipData.audienceStats.survey_total_cnt)}}</td>
                        </tr>
                        <tr>
                            <td>Rejected - REAL</td>
                            <td>{{tooltipData.audienceStats.admin_data.rejected_survey_cnt}} (min: {{tooltipData.audienceStats.admin_data.min_rejected_survey_cnt}}, max: {{tooltipData.audienceStats.admin_data.max_rejected_survey_cnt}})</td>
                        </tr>

                        <tr>
                            <td>Rejected - HACK 1</td>
                            <td>{{tooltipData.audienceStats.admin_data.rejected_ratio_ext > 0 ? GembaseUtils.round(tooltipData.audienceStats.admin_data.rejected_ratio_ext * tooltipData.audienceStats.admin_data.rejected_survey_cnt, 4) : tooltipData.audienceStats.admin_data.rejected_survey_cnt}}</td>
                        </tr>
                        <tr>
                            <td>Rejected - HACK2: SIN()</td>
                            <td>{{tooltipData.audienceStats.admin_data.survey_rejected_cnt_hack}}</td>
                        </tr>
                        <tr>
                            <td>Rejected ratio</td>
                            <td>{{GembaseUtils.round(tooltipData.audienceStats.rejected_ratio, 4)}}</td>
                        </tr>
                        <tr>
                            <td>Rejected absolute</td>
                            <td>{{GembaseUtils.numberWithSeparator(GembaseUtils.round(tooltipData.audienceStats.rejected_absolute))}}</td>
                        </tr>
                        <tr>
                            <td>Loyalty installs</td>
                            <td>{{GembaseUtils.formatNumber(tooltipData.audienceStats.admin_data.installs)}} * {{tooltipData.audienceStats.admin_data.loved_ratio_ext}} / 200 = {{GembaseUtils.numberWithSeparator(tooltipData.audienceStats.admin_data.loyalty_installs)}}</td>
                        </tr>
                        <tr>
                            <td>Rejected + Loyal</td>
                            <td>{{GembaseUtils.numberWithSeparator(GembaseUtils.round(tooltipData.audienceStats.admin_data.loyalty_installs + tooltipData.audienceStats.rejected_absolute))}}</td>
                        </tr>
                        <tr>
                            <td>TAM (loved - (rejected + loyal))</td>
                            <td>{{GembaseUtils.numberWithSeparator(GembaseUtils.round(tooltipData.audienceStats.total_audience))}}</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    </gb-popup>
</template>
