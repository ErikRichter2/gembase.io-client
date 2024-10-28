<template>
  <div ref="chartDiv"></div>
</template>

<script setup lang="ts">
import {ref, watch, onMounted, computed} from "vue";
import {
    TAppId,
    TTagId
} from "@/models/portal/apps/AppsData";
import {
    CHART_TEMPLATE_BEHAVIORS,
    PlayerExplorerChart, PlayerExplorerChartItemData,
    PlayerExplorerFilterView,
} from "@/models/portal/PortalDataTypes";
import {playerExplorerGroupsColorsCss, usePlayerExplorerStore} from "@/models/portal/playerExplorer/PlayerExplorerStore";
import GembaseUtils from "@/utils/GembaseUtils";
import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import SurveyConstants from "@/models/survey/SurveyConstants";
import {GB_PALETTE} from "@/tailwind/gembaseTwPalette";
import * as am5radar from "@amcharts/amcharts5/radar";
import CssUtils from "@/utils/CssUtils";
import * as am5xy from "@amcharts/amcharts5/xy";
import {DataItem, Percent, Tooltip} from "@amcharts/amcharts5";
import {IColumnSeriesDataItem} from "@amcharts/amcharts5/.internal/charts/xy/series/ColumnSeries";
import JwtService from "@/core/services/JwtService";
import {UiUtils} from "@/utils/UiUtils";
import {PortalConstants} from "@/models/portal/PortalConstants";
import {IValueAxisDataItem} from "@amcharts/amcharts5/xy";
import {TagsHelper} from "@/models/portal/tags/TagsHelper";

interface IRenderChartData extends PlayerExplorerChartItemData {
    name: string;
    icon: string;
    locked: boolean;
    desc: string;
    maxValue: number;
    iconTemplate?: {
        src: string
    };
    appIcon?: string;
    high?: number;
}

const playerExplorerStore = usePlayerExplorerStore();

const props = defineProps<{
    chartData: PlayerExplorerChart,
    filters: PlayerExplorerFilterView[],
    updateFiltersRequest?: number,
    updateColumnsRequest?: boolean,
    appId?: TAppId,
    appTags?: TTagId[],
    columnsCount?: number
}>();

const chartDiv = ref<HTMLElement>();

let root: am5.Root | undefined = undefined;
let rawData: IRenderChartData[] = [];

const seriesColors = [
    am5.color(playerExplorerGroupsColorsCss[0]),
    am5.color(playerExplorerGroupsColorsCss[1]),
    am5.color(playerExplorerGroupsColorsCss[2])
];

onMounted(() => {
    renderChart();
});

watch(() => props.updateFiltersRequest, renderChart);
watch(() => props.updateColumnsRequest, renderChart);
watch(() => chartDiv.value, renderChart);

const goalValue = computed(() => {
    return props.chartData.goal_value ?? 50;
});

function renderChart() {
    root?.dispose();
    root = undefined;

    if (chartDiv.value === undefined) {
        return;
    }

    const isMaximized = playerExplorerStore.maximizedCharts.includes(props.chartData?.id);
    const columnsCount = isMaximized ? -1 : (props.columnsCount ?? 8);
    const chartItems = GembaseUtils.copy(props.chartData?.data) ?? [];

    root = am5.Root.new(chartDiv.value);
    root.setThemes([am5themes_Animated.new(root)]);

    rawData = [];

    chartItems.forEach((x) => {
        const dataView: IRenderChartData = GembaseUtils.copy(x) as IRenderChartData;
        rawData.push(dataView);

        for (let j = 0; j < x.values.length; ++j) {
            dataView[`value${j+1}`] = x.values[j];
            dataView[`tooltipValue${j+1}`] = '';
        }

        dataView.appIcon = undefined;
        if (props.appTags !== undefined) {
            if (props.appTags.includes(x.id)) {
                dataView.appIcon = props.appId ?? "opportunity";
            }
        }
    });

    if (props.chartData.template !== CHART_TEMPLATE_BEHAVIORS) {
        if (columnsCount != -1 && rawData.length > columnsCount) {
            rawData = rawData.slice(0, columnsCount);
        }
    }

    rawData.forEach((x) => x.maxValue = Math.max(...x.values));

    const maxValue = rawData.reduce((accumulator, currentValue) => {
        return Math.max(accumulator, currentValue.maxValue);
    }, rawData[0].maxValue);

    rawData.forEach((x) => x.high = maxValue);

    rawData.forEach((x) => {
        if (
            props.chartData.id === SurveyConstants.SPENDING ||
            props.chartData.id === SurveyConstants.PLAYING
        ) {
            if (props.chartData.avg !== undefined) {
                for (let j = 0; j < props.chartData.avg?.length; ++j) {
                    x[`tooltipValue${j + 1}`] = Math.round(x.values[j]);
                }
            }
        } else {
            for (let j = 0; j < x.values.length; ++j) {
                x[`tooltipValue${j + 1}`] = Math.round(x.values[j]);
            }
        }
    });

    props.chartData.template === CHART_TEMPLATE_BEHAVIORS ? __spiderChart() : __barChart();

    root.interfaceColors.set("text", am5.color(GB_PALETTE.WHITE));
    root.interfaceColors.set("grid", am5.color(GB_PALETTE.CHART_BLUE));
}

function __barChart() {
    if (root === undefined) {
        return;
    }

    if (chartDiv.value === undefined) {
        return;
    }

    const chart = root.container.children.push(am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        layout: root.verticalLayout,
        focusable: true,
    }));

    const yRenderer = am5xy.AxisRendererY.new(root, {
        cellStartLocation: 0,
        cellEndLocation: 1,
        minGridDistance: 0,
        inversed: true,
    });

    const yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
        categoryField: "name",
        renderer: yRenderer,

    }));

    yRenderer.grid.template.set("forceHidden", true);

    yRenderer.labels.template.setAll({
        fontWeight: "500",
        fontSize: 12,
        fill: am5.color(GB_PALETTE.WHITE),
        paddingRight: 15,
        fontFamily: CssUtils.getCssVariableValue("--gb-font-family"),
    });

    let tooltipText = "";

    if (props.chartData.id === "best_features") {
        tooltipText = "<div style='font-size:10px;'>Feature importance: {value1}</div>";
    } else if (props.chartData.id === "topics_overlap") {
        tooltipText = "<div style='font-size:10px;'>Overlap: {value1}%</div>";
    } else {
        if (goalValue.value > 0) {
            tooltipText += `<div style='font-size:10px;'>Goal: ${goalValue.value}</div>`;
        }

        if (props.chartData.id === SurveyConstants.PLAYING) {
            tooltipText += `<div style='font-size:10px;'>${__getPlayingTooltipText(props.filters,"tooltipValue", "{name}", props.chartData.avg as number[], props.chartData.median as number[])}</div>`;
        } else if (props.chartData.id === SurveyConstants.SPENDING) {
            tooltipText += `<div style='font-size:10px;'>${__getSpendingTooltipText(props.filters,"tooltipValue", "{name}", props.chartData.avg as number[], props.chartData.median as number[])}</div>`;
        } else {
            tooltipText += `<div style='font-size:10px;'>${__getTooltipText(props.filters,"tooltipValue", "{name}")}</div>`;
        }

        tooltipText += "<div style='font-size:12px; padding-top: 10px;'>{desc}</div>";
    }

    const xRenderer = am5xy.AxisRendererX.new(root, {});

    xRenderer.labels.template.setAll({
        fontWeight: "500",
        fontSize: 12,
        fill: am5.color(GB_PALETTE.GRAY_750),
        fontFamily: CssUtils.getCssVariableValue("--gb-font-family"),
    });

    const xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
        renderer: xRenderer,
    }));

    const tooltip: Tooltip = am5.Tooltip.new(root, {
        pointerOrientation: "up",
        labelHTML: tooltipText,
        getFillFromSprite: false,
    });

    tooltip?._settings.background?.setAll({
        fill: am5.color(GB_PALETTE.BLACK),
        fillOpacity: 0.8,
        stroke: am5.color(GB_PALETTE.BLACK),
        strokeOpacity: 0
    });

    const barH = 20;
    const itemH = barH * props.filters.length;
    const totalH = rawData.length * (itemH) + 150;

    if (chartDiv.value.parentElement !== null) {
        chartDiv.value.parentElement.style.height = `${totalH}px`;
        chartDiv.value.parentElement.style.minHeight = `${totalH}px`;
        chartDiv.value.parentElement.style.maxHeight = `${totalH}px`;
    }

    for (let i = props.filters.length - 1; i >= 0 ; --i) {
        const series = chart.series.push(
            am5xy.ColumnSeries.new(root, {
                name: `Dataset ${i}`,
                xAxis: xAxis,
                yAxis: yAxis,
                valueXField: `value${i + 1}`,
                categoryYField: "name",
                fill: seriesColors[i],
                tooltip: i === 0 ? tooltip : undefined,
            })
        );

        const borderRadius = 5;
        let dy = 0;

        if (props.filters.length == 2) {
            if (i === 1) {
                dy = barH - barH / 2 / 2;
            } else if (i === 0) {
                dy = -barH + barH / 2 / 2;
            }

        } else if (props.filters.length == 3) {
            if (i === 2) {
                dy = barH + barH / 2;
            } else if (i === 0) {
                dy = -barH  - barH / 2;
            }
        }

        let h: number | Percent = barH;

        if (props.filters.length === 1) {
            h = am5.percent(90);
        }

        series.columns.template.setAll({
            strokeOpacity: 0,
            cornerRadiusBR: borderRadius,
            cornerRadiusTR: borderRadius,
            cornerRadiusBL: borderRadius,
            cornerRadiusTL: borderRadius,
            fillOpacity: 1,
            height: h,
            dy: dy
        });

        series.columns.template.adapters.add("fillOpacity", (fillOpacity, target) => {
            if (target.dataItem) {
                const dataItem = target.dataItem as DataItem<IColumnSeriesDataItem>;
                if (dataItem._settings.valueX !== undefined) {
                    if (dataItem._settings.valueX >= goalValue.value) {
                        return 1;
                    } else {
                        return 0.3;
                    }
                }
            }
            return fillOpacity;
        });

        if (i === 0 && canShowChartOpportunity.value) {
            series.bullets.push(function(root, series, dataItem) {
                const dc = dataItem.dataContext as IRenderChartData;
                if (dc.appIcon !== undefined) {
                    return am5.Bullet.new(root, {
                        locationX: 1,
                        sprite: am5.Picture.new(root, {
                            width: 16,
                            height: 16,
                            x: am5.percent(50),
                            y: am5.percent(50),
                            dx: -16,
                            dy: dy,
                            position: "absolute",
                            centerX: am5.percent(50),
                            centerY: am5.percent(50),
                            src: `${GembaseUtils.getApiUrl()}/app_icon/${dc.appIcon}?token=${JwtService.getToken()}`,
                            opacity: 1
                        })
                    });
                } else {
                    const dd = dataItem as DataItem<IColumnSeriesDataItem>;
                    if (dd._settings.valueX !== undefined) {
                        if (dd._settings.valueX >= goalValue.value) {
                            return am5.Bullet.new(root, {
                                locationX: 1,
                                sprite: am5.Picture.new(root, {
                                    width: 16,
                                    height: 16,
                                    x: am5.percent(50),
                                    y: am5.percent(50),
                                    dx: -14,
                                    dy: dy,
                                    position: "absolute",
                                    centerX: am5.percent(50),
                                    centerY: am5.percent(50),
                                    src: `${UiUtils.getIcon(PortalConstants.ICON_GAPS)}`,
                                    opacity: 1
                                })
                            });
                        }
                    }
                }
            });
        }

        series.data.setAll(rawData);
        series.appear(1000);
    }

    const rangeDataItem = yAxis.makeDataItem({
        value: goalValue.value,
        above: true,
    } as IValueAxisDataItem);

    xAxis.createAxisRange(rangeDataItem);

    rangeDataItem.get("grid")?.setAll({
        stroke: am5.color(GB_PALETTE.GRAY_750),
        strokeWidth: 2,
        strokeOpacity: 0.5,
        strokeDasharray: [5, 5],
    });

    const cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
        xAxis: xAxis
    }));

    cursor.lineX.set("visible", false);
    cursor.lineY.set("visible", false);

    yAxis.data.setAll(rawData);

    chart.appear(1000, 100);
}


function __spiderChart() {

    if (root === undefined) {
        return;
    }

    if (chartDiv.value === undefined) {
        return;
    }

    if (chartDiv.value.parentElement !== null) {
        const totalH = 450;
        chartDiv.value.parentElement.style.height = `${totalH}px`;
        chartDiv.value.parentElement.style.minHeight = `${totalH}px`;
        chartDiv.value.parentElement.style.maxHeight = `${totalH}px`;
    }

    const chart = root.container.children.push(am5radar.RadarChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none"
    }));

    const cursor = chart.set("cursor", am5radar.RadarCursor.new(root, {
        behavior: "zoomX"
    }));

    cursor.lineY.set("visible", false);

    const xRenderer = am5radar.AxisRendererCircular.new(root, {
        minGridDistance: 0,
    });

    xRenderer.labels.template.setAll({
        radius: 10,
        fontFamily: CssUtils.getCssVariableValue("--gb-font-family")
    });

    const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
        maxDeviation: 0,
        categoryField: "name",
        renderer: xRenderer,
    }));

    xAxis._settings.renderer.labels.template.setAll({
        fill: am5.color(GB_PALETTE.WHITE),
        centerX: am5.p100,
        fontSize: 12,
        fontFamily: CssUtils.getCssVariableValue("--gb-font-family"),
    });

    const yRenderer = am5radar.AxisRendererRadial.new(root, {});

    yRenderer.labels.template.setAll({
        fontWeight: "500",
        fontSize: 12,
        fill: am5.color(GB_PALETTE.WHITE),
        centerX: am5.p50,
        fontFamily: CssUtils.getCssVariableValue("--gb-font-family"),
    });

    let min = 0;
    let max = 100;

    rawData.forEach((x) => {
        x.values.forEach((y) => {
            if (min > y) {
                min = y;
            }
            if (max < y) {
                max = y;
            }
        })
    })

    const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
        renderer: yRenderer,
        min: min,
        max: max
    }));

    let tooltipText = "";

    if (goalValue.value > 0) {
        tooltipText += `<div style='font-size:10px;'>Goal: ${goalValue.value}</div>`;
    }

    tooltipText += `<div style='font-size:10px;'>${__getTooltipText(props.filters,"tooltipValue", "{name}")}</div>`;
    tooltipText += "<div style='font-size:12px; padding-top: 10px;'>{desc}</div>";

    const tooltip = am5.Tooltip.new(root, {
        pointerOrientation: "up",
        labelHTML: tooltipText,
        getFillFromSprite: false,
    });

    tooltip?._settings.background?.setAll({
        fill: am5.color(GB_PALETTE.BLACK),
        fillOpacity: 0.8,
        stroke: am5.color(GB_PALETTE.BLACK),
        strokeOpacity: 0
    });

    for (let i = 0; i < props.filters.length; ++i) {
        const series = chart.series.push(am5radar.RadarLineSeries.new(root, {
            name: `Series ${i}`,
            sequencedInterpolation: true,
            xAxis: xAxis,
            yAxis: yAxis,
            valueYField: `value${i + 1}`,
            categoryXField: "name",
            tooltip: i === 0 ? tooltip : undefined
        }));

        series.strokes.template.setAll({
            strokeWidth: 2
        });

        series.set("stroke", seriesColors[i]);

        series.bullets.push(function () {
            if (root === undefined) {
                return;
            }
            return am5.Bullet.new(root, {
                sprite: am5.Circle.new(root, {
                    radius: 5,
                    fill: seriesColors[i]
                })
            });
        });

        series.data.setAll(rawData);
        series.appear(1000);
    }

    xAxis.data.setAll(rawData);
    chart.appear(1000, 100);
}

function __getTooltipText(filters: PlayerExplorerFilterView[], values_prefix: string, category, html = true, index = 0) {
    let text = "";

    for (let i = 0; i < filters.length; ++i) {
        const x = filters[i].data;
        if (x.age !== undefined && x.females !== undefined) {
            const age = x.age.from + " - " + x.age.to;
            const g_value = x.females.value;
            const g = `${(100 - g_value)}% Males and ${g_value}% Females`;

            if (html) {
                text += `<div>S${i + 1}: Of ${g} between ${age} yo, {${values_prefix}${i+1}}% prefer ${category}.</div>`;
            } else {
                text += `S${i + 1}: Of ${g} between ${age} yo, {${values_prefix}${i+1}}% prefer ${category}.\n`;
            }
        }
    }

    return text;
}

function __getPlayingTooltipText(filters: PlayerExplorerFilterView[], values_prefix: string, category, avg: number[], median: number[]) {

    let text = "";

    for (let i = 0; i < filters.length; ++i) {
        const f = filters[i].data;
        if (f.age !== undefined && f.females !== undefined) {
            const age = f.age.from + " - " + f.age.to;
            const g_value = f.females.value;
            const g = `${(100 - g_value)}% Males and ${g_value}% Females`;
            text += `<div>S${i + 1}: Of ${g} between ${age} yo, {${values_prefix}${i+1}}% play ${category}:<br>Average playtime: ${avg[i]} hrs / week<br>Median playtime: ${median[i]} hrs / week</div>`;
        }
    }
    return text;
}

function __getSpendingTooltipText(filters: PlayerExplorerFilterView[], values_prefix: string, category, avg: number[], median: number[]) {
    let text = "";

    for (let i = 0; i < filters.length; ++i) {
        const f = filters[i].data;
        if (f.age !== undefined && f.females !== undefined) {
            const age = f.age.from + " - " + f.age.to;
            const g_value = f.females.value;
            const g = `${(100 - g_value)}% Males and ${g_value}% Females`;
            text += `<div>S${i + 1}: Of ${g} between ${age} yo, {${values_prefix}${i+1}}% spend ${category}:<br>Average spend: ${avg[i]} $ / month<br>Median spend: ${median[i]} $ / month</div>`;
        }
    }

    return text;
}

const canShowChartOpportunity = computed(() => {
    return (![
        TagsHelper.TAG_SUBCATEGORY_COMPLEXITY.toString(),
        TagsHelper.TAG_SUBCATEGORY_MULTIPLAYER.toString(),
        TagsHelper.TAG_SUBCATEGORY_PLATFORMS.toString(),
        TagsHelper.TAG_SUBCATEGORY_ACTIVITIES.toString(),
        TagsHelper.TAG_SUBCATEGORY_SOCIALS.toString(),
        TagsHelper.TAG_SUBCATEGORY_HOBBIES.toString(),
        TagsHelper.TAG_SUBCATEGORY_MOVIES.toString(),
        "best_game",
        "competitors"
    ].includes(props.chartData.id.toString()));
});

</script>
