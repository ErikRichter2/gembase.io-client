<script setup lang="ts">

import {AppDetail} from "@/models/portal/apps/AppsData";
import {onMounted, onUnmounted, ref, watch} from "vue";
import GembaseUiSelect from "@/views/ui/GembaseUiSelect.vue";
import {SelectOptionItem} from "@/views/ui/UiData";
import EndpointRequest from "@/core/requests/EndpointRequest";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import CssUtils from "@/utils/CssUtils";
import {GB_PALETTE} from "@/tailwind/gembaseTwPalette";

const props = defineProps<{
    appDetail?: AppDetail
}>();

watch(() => props.appDetail?.app_id, () => {
    fetchData();
});

const kpiSelectItems: SelectOptionItem[] = [
    {
        id: "growth",
        value: "Growth"
    },
    {
        id: "size",
        value: "Size"
    },
    {
        id: "quality",
        value: "Quality"
    }
];

const geoSelectItems: SelectOptionItem[] = [
    {
        id: "ww",
        value: "Worldwide"
    }
];

const intervalSelectItems: SelectOptionItem[] = [
    {
        id: "6m",
        value: "Last 6 months"
    },
    {
        id: "12m",
        value: "Last 12 months"
    },
    {
        id: "all",
        value: "All time"
    }
];

const selectedKpi = ref("growth");
const selectedGeo = ref("ww");
const selectedInterval = ref("6m");

interface IKpiData {
    t: number;
    v: number;
}

let chartData: IKpiData[] = [];

onMounted(() => {
    fetchData();
});

async function fetchData() {
    chartData = await EndpointRequest.process2<IKpiData[]>("portal:get_app_history_kpis", {
        app_id: props.appDetail?.app_id,
        kpi: selectedKpi.value,
        interval: selectedInterval.value
    });

    renderChart();
}

onUnmounted(() => {
    disposeChart();
});

function disposeChart() {
    if (chartRoot !== undefined) {
        chartRoot.dispose();
        chartRoot = undefined;
    }
}

const chart_div = ref<HTMLElement>();

let chartRoot: am5.Root | undefined = undefined;

function renderChart() {
    disposeChart();

    if (chart_div.value === undefined || chart_div.value === null) {
        return;
    }

    chartRoot = am5.Root.new(chart_div.value);
    chartRoot.setThemes([am5themes_Animated.new(chartRoot)]);

    const chart = chartRoot.container.children.push(am5xy.XYChart.new(chartRoot, {
        paddingLeft: 0
    }));

    const xRenderer = am5xy.AxisRendererX.new(chartRoot, {
    });

    xRenderer.labels.template.setAll({
        fontWeight: "500",
        fontSize: 12,
        fill: am5.color(GB_PALETTE.GRAY_750),
        fontFamily: CssUtils.getCssVariableValue("--gb-font-family"),
    });

    const xAxis = chart.xAxes.push(am5xy.DateAxis.new(chartRoot, {
        maxDeviation: 0.2,
        baseInterval: {
            timeUnit: "day",
            count: 1
        },
        renderer: xRenderer,
        tooltipText: ""
    }));

    const yRenderer = am5xy.AxisRendererY.new(chartRoot, {
    });

    yRenderer.grid.template.set("forceHidden", true);

    yRenderer.labels.template.setAll({
        fontWeight: "500",
        fontSize: 12,
        fill: am5.color(GB_PALETTE.WHITE),
        paddingRight: 15,
        fontFamily: CssUtils.getCssVariableValue("--gb-font-family"),
        tooltipText: ""
    });

    const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(chartRoot, {
        renderer: yRenderer
    }));

    chartRoot.dateFormatter.setAll({
        dateFormat: "dd. MMMM yyyy",
        dateFields: ["valueX"]
    });

    chartRoot.numberFormatter = am5.NumberFormatter.new(chartRoot, {
        numberFormat: "#.#a",
        bigNumberPrefixes: [
            { "number": 1e+3, "suffix": "k" },
            { "number": 1e+6, "suffix": "M" },
        ]
    });

    const chartColor = am5.color(GB_PALETTE.WHITE);

    const series = chart.series.push(am5xy.LineSeries.new(chartRoot, {
        name: "Series",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        valueXField: "date",
        stroke: chartColor,
        fill: chartColor
    }));

    const appTitle = props.appDetail?.title;
    const kpiName = kpiSelectItems.find((x) => x.id === selectedKpi.value)?.value;

    series.bullets.push(function(){
        if (chartRoot !== undefined) {
            const tooltip = am5.Tooltip.new(chartRoot, {
                getFillFromSprite: false,
                getStrokeFromSprite: false,
                getLabelFillFromSprite: false,
            });
            tooltip.get("background")?.setAll({
                stroke: am5.color(GB_PALETTE.BLACK),
                strokeOpacity: 0
            });
            return am5.Bullet.new(chartRoot, {
                sprite: am5.Circle.new(chartRoot, {
                    tooltip: tooltip,
                    strokeWidth: 0,
                    strokeOpacity: 0,
                    radius: 6,
                    fill: chartColor,
                    tooltipHTML: `<div class="text-[12px] rounded-2xl pr-3 pl-3 pt-1 pb-1 mt-[10px] ml-[10px] bg-black bg-opacity-80">${appTitle}<br>${kpiName} {valueY}${selectedKpi.value === 'ts' ? '%' : ''} on {valueX}</div>`
                })
            });
        }
    });

    const data: {date: number, value: number}[] = [];
    chartData.forEach((x) => {
        data.push({
            date: x.t * 1000,
            value: x.v
        });
    });

    series.data.setAll(data);

    series.appear(1000);
    chart.appear(1000, 100);
}

</script>

<template>
    <div class="gb-layout-tl w-full h-full">
        <div class="gb-layout-m-between w-full">
            <gembase-ui-select class="!w-[200px] font-bold !text-[1.2em]" @on-change="(data) => {selectedKpi = data.id; fetchData()}" :selected="selectedKpi" :items="kpiSelectItems"></gembase-ui-select>
            <div class="gb-layout-tl-row gap-1">
                <gembase-ui-select class="!w-[150px] !h-[20px] !text-[0.9em]" @on-change="(data) => {selectedGeo = data.id; fetchData()}" :readonly="true" :selected="selectedGeo" :items="geoSelectItems"></gembase-ui-select>
                <gembase-ui-select class="!w-[150px] !h-[20px] !text-[0.9em]" @on-change="(data) => {selectedInterval = data.id; fetchData()}" :selected="selectedInterval" :items="intervalSelectItems"></gembase-ui-select>
            </div>
        </div>
        <div ref="chart_div" class="w-full max-w-full h-[90%] pt-3 gb-layout">
        </div>
    </div>
</template>
