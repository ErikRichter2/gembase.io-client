<script setup lang="ts">
import {SelectOptionItem} from "@/views/ui/UiData";
import EndpointRequest from "@/core/requests/EndpointRequest";
import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";
import CssUtils from "@/utils/CssUtils";
import GembaseUiSelect from "@/views/ui/GembaseUiSelect.vue";
import {useGamesExplorerStore} from "@/models/portal/gamesExplorer/GamesExplorerStore";
import {TAppId} from "@/models/portal/apps/AppsData";
import {GamesExplorerSelectedItemTypeEnum} from "@/models/portal/gamesExplorer/GamesExplorerData";
import {onMounted, onUnmounted, ref, watch} from "vue";
import {GB_PALETTE} from "@/tailwind/gembaseTwPalette";

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
        id: "tam",
        value: "TAM"
    },
    {
        id: "ts",
        value: "Threat Score"
    },
    {
        id: "quality",
        value: "Quality"
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
const selectedInterval = ref("6m");

const gamesExplorerStore = useGamesExplorerStore();

interface IKpiData {
    app_id: TAppId;
    t: number;
    v: number;
}

let chartData: IKpiData[] = [];

onMounted(() => {
    fetchData();
});

watch(() => gamesExplorerStore.compareViewDataChange, () => {
    fetchData();
});

async function fetchData() {
    const appIds: TAppId[] = [];
    gamesExplorerStore.selectedItems.forEach((x) => {
        if (x.type === GamesExplorerSelectedItemTypeEnum.APP) {
            appIds.push(x.id);
        }
    });

    if (selectedKpi.value === "size" || selectedKpi.value === "growth" || selectedKpi.value === "quality") {
        chartData = await EndpointRequest.process2<IKpiData[]>("portal:get_games_explorer_kpi_hist_data", {
            app_ids: appIds,
            kpi: selectedKpi.value,
            interval: selectedInterval.value
        });
    } else {
        chartData.length = 0;
        const m6 = 6 * 30 * 24 * 60 * 60 * 1000;
        const dateFrom = (Date.now() - m6) / 1000;
        const dateTo = Date.now() / 1000
        gamesExplorerStore.chartData.forEach((x) => {
            if (selectedKpi.value === "tam") {
                chartData.push({
                    app_id: x.appId,
                    t: dateFrom,
                    v: x.tam
                });
                chartData.push({
                    app_id: x.appId,
                    t: dateTo,
                    v: x.tam
                });
            } else if (selectedKpi.value === "ts") {
                chartData.push({
                    app_id: x.appId,
                    t: dateFrom,
                    v: x.ts
                });
                chartData.push({
                    app_id: x.appId,
                    t: dateTo,
                    v: x.ts
                });
            }
        })
    }

    renderChart();
}

const chart_div = ref<HTMLElement>();
let currentSeriesData: Map<TAppId, IKpiData[]> = new Map<TAppId, IKpiData[]>();

let chartRoot: am5.Root | undefined = undefined;

onUnmounted(() => {
    disposeChart();
});

function disposeChart() {
    if (chartRoot !== undefined) {
        chartRoot.dispose();
        chartRoot = undefined;
    }
}

function renderChart() {

    const nextSeriesData: Map<TAppId, IKpiData[]> = new Map<TAppId, IKpiData[]>();
    chartData.forEach((x) => {
        if (!nextSeriesData.has(x.app_id)) {
            nextSeriesData.set(x.app_id, []);
        }
        nextSeriesData.get(x.app_id)?.push(x);
    });

    let needsRedraw = false;

    for (const [appId, kpiData] of currentSeriesData) {
        if (!nextSeriesData.has(appId)) {
            needsRedraw = true;
            break;
        }
    }

    if (!needsRedraw) {
        for (const [appId, kpiData] of nextSeriesData) {
            if (!currentSeriesData.has(appId)) {
                needsRedraw = true;
                break;
            }
            const currentArr = currentSeriesData.get(appId) ?? [];
            const nextArr = nextSeriesData.get(appId) ?? [];

            if (currentArr.length !== nextArr.length) {
                needsRedraw = true;
                break;
            }

            for (let i = 0; i < currentArr.length; ++i) {
                if (currentArr[i].t !== nextArr[i].t || currentArr[i].v !== nextArr[i].v) {
                    needsRedraw = true;
                    break;
                }
            }
        }
    }

    if (!needsRedraw) {
        return;
    }

    currentSeriesData = nextSeriesData;

    disposeChart();

    if (chart_div.value === undefined || chart_div.value === null) {
        return;
    }

    chartRoot = am5.Root.new(chart_div.value);
    chartRoot.setThemes([am5themes_Animated.new(chartRoot)]);

    const chart = chartRoot.container.children.push(am5xy.XYChart.new(chartRoot, {
        arrangeTooltips: false,
    }));

    // // Add cursor
    // const cursor = chart.set("cursor", am5xy.XYCursor.new(chartRoot, {
    //     behavior: "none"
    // }));
    // cursor.lineY.set("visible", false);

    const xRenderer = am5xy.AxisRendererX.new(chartRoot, {
        //minorGridEnabled:true
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

    const kpiName = kpiSelectItems.find((x) => x.id === selectedKpi.value)?.value;

    for (const [appId, kpiData] of currentSeriesData) {

        const color = gamesExplorerStore.getItemColor(appId);

        const series = chart.series.push(am5xy.LineSeries.new(chartRoot, {
            name: `Series ${appId}`,
            xAxis: xAxis,
            yAxis: yAxis,
            valueYField: "value",
            valueXField: "date",
            stroke: am5.color(color),
            fill: am5.color(color),
        }));

        const appTitle = gamesExplorerStore.getIconTitle({
            type: GamesExplorerSelectedItemTypeEnum.APP,
            id: appId
        })?.title;

        series.bullets.push(function(){
            if (chartRoot !== undefined) {
                const tooltip = am5.Tooltip.new(chartRoot, {
                    getFillFromSprite: false,
                    getStrokeFromSprite: false,
                    getLabelFillFromSprite: false,
                });
                tooltip.get("background")?.setAll({
                    stroke: am5.color(GB_PALETTE.BLACK),
                    strokeOpacity: 0.8
                });
                return am5.Bullet.new(chartRoot, {
                    sprite: am5.Circle.new(chartRoot, {
                        tooltip: tooltip,
                        strokeWidth: 0,
                        strokeOpacity: 0,
                        radius: 6, // you can make it small enough not to show
                        //tooltipText: '{valueY}',
                        fill: am5.color(color),
                        tooltipHTML: `<div class="text-[12px] rounded-2xl pr-3 pl-3 pt-1 pb-1 mt-[10px] ml-[10px] bg-black bg-opacity-80">${appTitle}<br>${kpiName} {valueY}${selectedKpi.value === 'ts' ? '%' : ''} on {valueX}</div>`
                    })
                });
            }
        });

        // Set data
        const data: {date: number, value: number}[] = [];
        kpiData?.forEach((x) => {
            data.push({
                date: x.t * 1000,
                value: x.v
            });
        });

        series.data.setAll(data);
    }
}
</script>

<template>
    <div class="gb-layout-tl w-full h-[300px]">
        <div class="gb-layout-m-between w-full">
            <gembase-ui-select class="!w-[200px] font-bold !text-[1.2em]" @on-change="(data) => {selectedKpi = data.id; fetchData()}" :selected="selectedKpi" :items="kpiSelectItems"></gembase-ui-select>
            <div class="gb-layout-tl-row gap-1">
                <gembase-ui-select class="!w-[150px] !h-[20px] !text-[0.9em]" @on-change="(data) => {selectedInterval = data.id; fetchData()}" :selected="selectedInterval" :items="intervalSelectItems"></gembase-ui-select>
            </div>
        </div>
        <div ref="chart_div" class="w-full max-w-full h-[90%] pt-3 gb-layout">
        </div>
    </div>
</template>
