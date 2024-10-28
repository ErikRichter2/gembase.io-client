<script setup lang="ts">

import {onMounted, onUnmounted, ref, watch} from "vue";
import {
    PlayerExplorerChart,
    PlayerExplorerChartItemData,
    PlayerExplorerFilterView
} from "@/models/portal/PortalDataTypes";
import {playerExplorerGroupsColorsCss, usePlayerExplorerStore} from "@/models/portal/playerExplorer/PlayerExplorerStore";
import * as am5 from "@amcharts/amcharts5";
import {GB_PALETTE} from "@/tailwind/gembaseTwPalette";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";
import CssUtils from "@/utils/CssUtils";
import {DataItem} from "@amcharts/amcharts5";
import {IColumnSeriesDataItem} from "@amcharts/amcharts5/.internal/charts/xy/series/ColumnSeries";
import {useUiStore} from "@/models/ui/UiStore";

const props = defineProps<{
    chartData: PlayerExplorerChart,
    filters: PlayerExplorerFilterView[],
    updateFiltersRequest?: number,
}>();

const playerExplorerStore = usePlayerExplorerStore();

const chartDiv = ref<HTMLDivElement>();
const tooltipDiv = ref<HTMLDivElement>();

let root: am5.Root | undefined = undefined;

let tooltipInterval = 0;

onMounted(() => {
    render();
    tooltipInterval = window.setInterval(() => {
        const uiStore = useUiStore();
        if (tooltipDiv.value !== undefined) {
            tooltipDiv.value.style.left = `${uiStore.data.mouseX + 20}px`;
            tooltipDiv.value.style.top = `${uiStore.data.mouseY + 10}px`;
        }
    }, 10);
});

onUnmounted(() => {
    window.clearInterval(tooltipInterval);
});

watch(() => props.updateFiltersRequest, render);

function render() {
    root?.dispose();
    root = undefined;

    if (chartDiv.value === undefined) {
        return;
    }

    const seriesColor = am5.color(playerExplorerGroupsColorsCss[0]);
    const labelColor = am5.color(GB_PALETTE.WHITE);

    root = am5.Root.new(chartDiv.value);
    const goalValue: number = props.chartData.goal_value ?? 0;
    const borderRadius = 5;

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
        am5xy.XYChart.new(root, {})
    );

    const xRenderer = am5xy.AxisRendererX.new(root, {
        cellStartLocation: 0.1,
        cellEndLocation: 0.9,
        minGridDistance: 0,
    });

    const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
        categoryField: "category",
        renderer: xRenderer,
    }));

    const yRenderer = am5xy.AxisRendererY.new(root, {});

    yRenderer.labels.template.setAll({
        fontWeight: "500",
        fontSize: 12,
        fontFamily: CssUtils.getCssVariableValue("--gb-font-family"),
        fill: am5.color(GB_PALETTE.GRAY_600),
    });

    const yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
            renderer: yRenderer
        })
    );

    const series = am5xy.CandlestickSeries.new(root, {
        fill: seriesColor,
        stroke: seriesColor,
        name: "MDXI",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "q75",
        openValueYField: "q25",
        lowValueYField: "qmin",
        highValueYField: "qmax",
        categoryXField: "category"
    });

    series.columns.template.setAll({
        width: 20,
        strokeWidth: 3,
        cornerRadiusBR: borderRadius,
        cornerRadiusTR: borderRadius,
        cornerRadiusBL: borderRadius,
        cornerRadiusTL: borderRadius,
    });

    xRenderer.labels.template.adapters.add("html", (html, target) => {
        if (target.dataItem) {
            const dataItem = target.dataItem as DataItem<IColumnSeriesDataItem>;
            const dataContext = dataItem.dataContext as PlayerExplorerChartItemData;
            if (dataContext !== undefined) {
                const selected = dataContext.id === playerExplorerStore.selectedDcmConceptsHeader;
                const color = selected ? "black": "white";
                const bgColor = selected ? playerExplorerGroupsColorsCss[2] : "transparent";
                return `<div style="height: 100px; width: auto; padding-top: 40px;">
                                <div class="${selected ? 'gbc-bg-primary' : ''}" style="font-weight: bold; transform: rotate(-45deg); padding-left: 10px; padding-right: 10px; border-radius: 16px; color: ${color}; font-size: 12px; background-color: ${bgColor};">${dataContext.name}</div>
                            </div>`;
            }
        }

        return `<div></div>`;
    });

    series.columns.template.adapters.add("stroke", (value, target) => {
        if (target.dataItem) {
            const dataItem = target.dataItem as DataItem<IColumnSeriesDataItem>;
            const dataContext = dataItem.dataContext as PlayerExplorerChartItemData;
            if (dataContext.id === playerExplorerStore.selectedDcmConceptsHeader) {
                return am5.color(GB_PALETTE.ORANGE);
            }
        }
        return value;
    });

    series.columns.template.adapters.add("fill", (value, target) => {
        if (target.dataItem) {
            const dataItem = target.dataItem as DataItem<IColumnSeriesDataItem>;
            const dataContext = dataItem.dataContext as PlayerExplorerChartItemData;
            if (dataContext.id === playerExplorerStore.selectedDcmConceptsHeader) {
                return am5.color(GB_PALETTE.ORANGE);
            }
        }
        return value;
    });

    series.columns.template.events.on("pointerover", function(ev) {
        const dataItem = ev.target.dataItem as DataItem<IColumnSeriesDataItem>;
        playerExplorerStore.marketReachTooltip = dataItem.dataContext as PlayerExplorerChartItemData;
        document.body.style.cursor = "pointer";
    });

    series.columns.template.events.on("pointerout", function() {
        playerExplorerStore.marketReachTooltip = undefined;
        document.body.style.cursor = "auto";
    });

    series.columns.template.events.on("click", function(ev) {
        const dataItem = ev.target.dataItem as DataItem<IColumnSeriesDataItem>;
        const dataContext = dataItem.dataContext as PlayerExplorerChartItemData;
        playerExplorerStore.updateDcmConceptsHeader(dataContext.id);
        series.data.setAll(raw_data);
        xAxis.data.setAll(raw_data);
    });

    chart.series.push(series);

    series.columns.template.states.create("riseFromOpen", {
        fill: seriesColor,
        stroke: seriesColor,
    });

    series.columns.template.states.create("dropFromOpen", {
        fill: seriesColor,
        stroke: seriesColor,
    });

    const medianaSeries = chart.series.push(
        am5xy.StepLineSeries.new(root, {
            name: "Series",
            xAxis: xAxis,
            yAxis: yAxis,
            valueYField: "q50",
            categoryXField: "category",
            fill: labelColor,
            stroke: labelColor,
            noRisers: true,
            stepWidth: am5.percent(10),
        })
    );

    medianaSeries.strokes.template.setAll({
        strokeWidth: 3,
    });

    const cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
        xAxis: xAxis
    }));
    cursor.lineY.set("visible", false);

    const rangeDataItem = yAxis.makeDataItem({
        value: goalValue,
        above: true
    });

    yAxis.createAxisRange(rangeDataItem);

    rangeDataItem._settings.grid?.setAll({
        stroke: am5.color(GB_PALETTE.GRAY_600),
        strokeWidth: 2,
        strokeOpacity: 1,
        strokeDasharray: [5, 5],
    });

    const raw_data = props.chartData.data;

    series.data.setAll(raw_data);
    medianaSeries.data.setAll(raw_data);
    xAxis.data.setAll(raw_data);

    series.appear(1000);
    medianaSeries.appear(1000);
    chart.appear(1000, 100);
}
</script>

<template>
    <div ref="chartDiv">
        <div ref="tooltipDiv" class="fixed z-[1000] text-[0.8em]">
            <div v-if="playerExplorerStore.marketReachTooltip !== undefined" class="gb-layout-tl bg-black bg-opacity-80 rounded-2xl p-2 pl-4 pr-4 w-[300px] h-auto">
                <div class="font-bold">{{playerExplorerStore.marketReachTooltip?.name}}</div>
                <div class="text-[0.8em] leading-[1em]">{{playerExplorerStore.getBestFeaturesForHeader(playerExplorerStore.marketReachTooltip?.id)}}</div>
                <div class="text-[0.9em] font-bold">Market reach {{playerExplorerStore.marketReachTooltip?.q25}}% - {{playerExplorerStore.marketReachTooltip?.q75}}%</div>
                <div class="text-[0.8em] leading-[1em]">Demo {{playerExplorerStore.filters[0].data.females?.value}}% {{playerExplorerStore.filters[0].data.females !== undefined && playerExplorerStore.filters[0].data.females?.value >= 50 ? 'females' : 'males'}}</div>
            </div>
        </div>
    </div>
</template>
