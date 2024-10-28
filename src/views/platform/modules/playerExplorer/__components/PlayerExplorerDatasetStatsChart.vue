<template>
    <div class="gb-inner-window w-full h-full">
        <div ref="chartDiv" class="w-full h-full"></div>
    </div>
</template>

<script setup lang="ts">
import {onMounted, watch, ref, computed} from "vue";
import {PlayerExplorerStatsItem} from "@/models/portal/PortalDataTypes";
import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import {GB_PALETTE} from "@/tailwind/gembaseTwPalette";
import CssUtils from "@/utils/CssUtils";
import * as am5xy from "@amcharts/amcharts5/xy";
import {DataItem} from "@amcharts/amcharts5";
import {IColumnSeriesDataItem} from "@amcharts/amcharts5/.internal/charts/xy/series/ColumnSeries";
import {playerExplorerGroupsColorsCss} from "@/models/portal/playerExplorer/PlayerExplorerStore";

const props = defineProps<{
    stats: PlayerExplorerStatsItem[],
    updateFiltersRequest: number
}>();

const chartDiv = ref<HTMLElement>();

let series: any = {};
let root: am5.Root | undefined = undefined;

onMounted(render);

watch(() => props.updateFiltersRequest, render);

function render() {
    if (chartDiv.value === undefined) {
        return;
    }

    root?.dispose();
    root = undefined;
    series = {};

    if (props.stats.length === 0) {
        return;
    }

    root = am5.Root.new(chartDiv.value);

    root.setThemes([am5themes_Animated.new(root)]);

    const mainContainer = am5.Container.new(root, {
        layout: root.verticalLayout,
        width: 200,
        height: 400,
        paddingLeft: 0,
        marginLeft: 0,
        paddingRight: 0,
        marginRight: 0,
        paddingTop: 10,
    });

    root.container.children.push(mainContainer);

    showSizeChart(mainContainer);
    showGenderChart(mainContainer);
    showAgeChart(mainContainer);

    for (const key in statsData.value) {
        const it = statsData.value[key];
        for (let j = 0; j < it.length; ++j) {
            for (let i = 0; i < series[key].length; ++i) {
                series[key][i].data.setIndex(j, it[j]);
            }
        }
    }
}

const statsData = computed(() => {

    const data = {
        'size': [] as any[],
        'females': [] as any[],
        'males': [] as any[]
    }

    if (props.stats.length > 0) {
        for (let i = 0; i < props.stats[0].filtered_age.length; ++i) {
            data[`age_${i}`] = [] as any[];
        }
    }

    for (let i = props.stats.length - 1; i >= 0; --i) {
        const d = props.stats[i];

        data['size'].push(
            {
                'name': i,
                'value1': Math.round(d.filtered_rows / d.full_rows * 100),
                'value2': 100,
                'rows_effective': d.filtered_rows,
                'rows_original': d.full_rows
            });

        data['females'].push(
            {
                'name': i,
                'value1': d.filtered_females,
                'value2': 100,
                'original': d.full_females
            });

        data['males'].push(
            {
                'name': i,
                'value1': 100 - d.filtered_females,
                'value2': 100,
                'original': 100 - d.full_females
            });

        for (let j = 0; j < d.filtered_age.length; ++j) {
            data['age_' + j].push(
                {
                    'name': i,
                    'value1': d.filtered_age[j],
                    'value2': 100,
                    'original': d.full_age[j]
                });
        }
    }

    return data;
});

function showAgeBracketChart(ageContainer: am5.Container, title: string, index: number) {
    if (root === undefined) {
        return;
    }

    const sizeContainer = am5.Container.new(root, {
        width: am5.percent(100),
        layout: root.verticalLayout,
        paddingLeft: 0,
        marginLeft: 0,
        paddingRight: 0,
        marginRight: 0,
        paddingTop: 0,
        paddingBottom: 0,
    });

    ageContainer.children.push(sizeContainer);

    sizeContainer.children.push(am5.Label.new(root, {
        text: title,
        fontSize: 10,
        fontWeight: "500",
        textAlign: "left",
        y: 0,
        x: am5.percent(0),
        centerX: am5.percent(0),
        paddingTop: 0,
        paddingBottom: 0,
        fill: am5.color(GB_PALETTE.WHITE),
        fontFamily: CssUtils.getCssVariableValue("--gb-font-family")
    }));

    const chart = sizeContainer.children.push(am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        layout: root.verticalLayout,
        focusable: true,
        width: am5.percent(100),
        height: 40,
        paddingLeft: 0,
        marginLeft: 0,
        paddingRight: 0,
        marginRight: 0,
        arrangeTooltips: false,
        paddingTop: 0,
        paddingBottom: 0,
    }));

    const xRenderer = am5xy.AxisRendererX.new(root, {});

    xRenderer.labels.template.setAll({
        visible: false,
    });

    xRenderer.grid.template.set("visible", false);

    const xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
        renderer: xRenderer,
        min: 0,
        max: 100,
    }));

    const yRenderer = am5xy.AxisRendererY.new(root, {});

    yRenderer.labels.template.setAll({
        visible: false,
    });

    yRenderer.grid.template.set("visible", false);

    const yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
        categoryField: "name",
        renderer: yRenderer
    }));

    const series1 = chart.series.push(
        am5xy.ColumnSeries.new(root, {
            name: "Dataset 1",
            xAxis: xAxis,
            yAxis: yAxis,
            valueXField: "value2",
            categoryYField: "name",
            fill: am5.color(GB_PALETTE.GREEN_GEM),
            clustered: false,
            tooltip: am5.Tooltip.new(root, {
                // @ts-ignore
                getFillFromObject: false,
            }),
        })
    );

    const series2 = chart.series.push(
        am5xy.ColumnSeries.new(root, {
            name: "Dataset 2",
            xAxis: xAxis,
            yAxis: yAxis,
            valueXField: "value1",
            categoryYField: "name",
            fill: am5.color(GB_PALETTE.DIM_OCEAN),
            clustered: false,
            interpolationDuration: 500,
            interpolationEasing: am5.ease.linear,
        })
    );

    const seriesOrig = chart.series.push(
        am5xy.LineSeries.new(root, {
            xAxis: xAxis,
            yAxis: yAxis,
            valueXField: "original",
            categoryYField: "name"
        })
    );

    seriesOrig.strokes.template.setAll({
        visible: false
    });

    // Add bullets
    seriesOrig.bullets.push(() => {
        if (root === undefined) {
            return;
        }
        return am5.Bullet.new(root, {
            sprite: am5.Triangle.new(root, {
                fill: am5.color(GB_PALETTE.WHITE),
                rotation: 180,
                width: 8,
                height: 8,
                centerY: am5.percent(10)
            })
        });
    });

    series1.columns.template.setAll({
        width: am5.percent(90),
        tooltipY: 0,
        shadowColor: am5.color(GB_PALETTE.BLACK),
        shadowBlur: 0,
        shadowOffsetX: 1,
        shadowOffsetY: 1,
        fillOpacity: 0.3,
        height: 5
    });

    series1.columns.template.adapters.add("tooltipHTML", (text) => {
        const d = statsData.value['age_' + index];
        text = "<b>Age: " + title + "</b><br>";
        for (let i = 0; i < d.length; ++i) {
            text += `● Original ${i + 1}: ${d[i]['original']}%<br>`;
            text += `● Selected ${i + 1}: ${d[i]['value1']}%<br>`;
        }
        return `<div style='font-size:12px; color: black;'>${text}</div>`;
    });

    series2.columns.template.setAll({
        width: am5.percent(50),
        tooltipY: 0,
        shadowColor: am5.color(GB_PALETTE.BLACK),
        shadowBlur: 0,
        shadowOffsetX: 1,
        shadowOffsetY: 1,
        height: 5,
    });

    series1.columns.template.adapters.add("fill", (fill, target) => {
        if (target.dataItem) {
            const dataItem = target.dataItem as DataItem<IColumnSeriesDataItem>;
            if (dataItem._settings.categoryY !== undefined) {
                const ix = parseInt(dataItem._settings.categoryY);
                return am5.color(playerExplorerGroupsColorsCss[ix]);
            }
        }
        return fill;
    });

    series2.columns.template.adapters.add("fill", (fill, target) => {
        if (target.dataItem) {
            const dataItem = target.dataItem as DataItem<IColumnSeriesDataItem>;
            if (dataItem._settings.categoryY !== undefined) {
                const ix = parseInt(dataItem._settings.categoryY);
                return am5.color(playerExplorerGroupsColorsCss[ix]);
            }
        }
        return fill;
    });

    const cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
        xAxis: xAxis,
        // @ts-ignore
        maxTooltipDistance: -1,
    }));
    cursor.lineY.set("visible", false);

    const data_key = 'age_' + index;
    const d = statsData.value[data_key];

    series[data_key] = [series1, series2, seriesOrig]

    series1.data.setAll(d);
    series2.data.setAll(d);
    seriesOrig.data.setAll(d);
    yAxis.data.setAll(d);

    series1.appear(0);
    series2.appear(1000);
    seriesOrig.appear(0);

    chart.appear(1000, 100);
}

function showAgeChart(mainContainer: am5.Container) {

    if (root === undefined) {
        return;
    }

    const sizeContainer = am5.Container.new(root, {
        width: am5.percent(100),
        layout: root.verticalLayout,
        paddingLeft: 0,
        marginLeft: 0,
        paddingRight: 0,
        marginRight: 0,
    });

    mainContainer.children.push(sizeContainer);

    sizeContainer.children.push(am5.Label.new(root, {
        text: "Age",
        fontSize: 14,
        fontWeight: "500",
        textAlign: "left",
        y: 0,
        x: am5.percent(0),
        centerX: am5.percent(0),
        paddingTop: 0,
        paddingBottom: 0,
        fill: am5.color(GB_PALETTE.WHITE),
        fontFamily: CssUtils.getCssVariableValue("--gb-font-family")
    }));

    const ageContainer = am5.Container.new(root, {
        width: am5.percent(100),
        layout: root.horizontalLayout,
        paddingLeft: 0,
        marginLeft: 0,
        paddingRight: 0,
        marginRight: 0,
    });

    sizeContainer.children.push(ageContainer);

    showAgeBracketChart(ageContainer, "0-29", 0);
    showAgeBracketChart(ageContainer, "30-45", 1);
    showAgeBracketChart(ageContainer, "46+", 2);
}

function showSizeChart(mainContainer: am5.Container) {

    if (root === undefined) {
        return;
    }

    const sizeContainer = am5.Container.new(root, {
        width: am5.percent(100),
        layout: root.verticalLayout,
        paddingLeft: 0,
        marginLeft: 0,
        paddingRight: 0,
        marginRight: 0,
    });

    mainContainer.children.push(sizeContainer);

    sizeContainer.children.push(am5.Label.new(root, {
        text: "Selected size",
        fontSize: 14,
        fontWeight: "500",
        textAlign: "left",
        y: 0,
        x: am5.percent(0),
        centerX: am5.percent(0),
        paddingTop: 0,
        paddingBottom: 0,
        fill: am5.color(GB_PALETTE.WHITE),
        fontFamily: CssUtils.getCssVariableValue("--gb-font-family")
    }));

    const chart = sizeContainer.children.push(am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        layout: root.verticalLayout,
        focusable: true,
        width: am5.percent(100),
        height: 60,
        paddingLeft: 0,
        marginLeft: 0,
        paddingRight: 0,
        marginRight: 0,
        arrangeTooltips: false,
        paddingTop: 10,
    }));

    const xRenderer = am5xy.AxisRendererX.new(root, {});

    xRenderer.labels.template.setAll({
        visible: false,
    });

    xRenderer.grid.template.set("visible", false);

    const xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
        renderer: xRenderer,
        min: 0,
        max: 100,
    }));

    const yRenderer = am5xy.AxisRendererY.new(root, {});

    yRenderer.labels.template.setAll({
        visible: false,
    });

    yRenderer.grid.template.set("visible", false);

    const yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
        categoryField: "name",
        renderer: yRenderer
    }));

    const series1 = chart.series.push(
        am5xy.ColumnSeries.new(root, {
            name: "Dataset 1",
            xAxis: xAxis,
            yAxis: yAxis,
            valueXField: "value2",
            categoryYField: "name",
            fill: am5.color(GB_PALETTE.GREEN_GEM),
            clustered: false,
            interpolationDuration: 2000,
            interpolationEasing: am5.ease.inOut(am5.ease.elastic),
            sequencedInterpolation: true,
            tooltip: am5.Tooltip.new(root, {}),
        })
    );

    const series2 = chart.series.push(
        am5xy.ColumnSeries.new(root, {
            name: "Dataset 2",
            xAxis: xAxis,
            yAxis: yAxis,
            valueXField: "value1",
            categoryYField: "name",
            fill: am5.color(GB_PALETTE.DIM_OCEAN),
            clustered: false,
            interpolationDuration: 500,
            interpolationEasing: am5.ease.linear,
        })
    );

    series1.columns.template.setAll({
        width: am5.percent(90),
        tooltipY: 0,
        shadowColor: am5.color(GB_PALETTE.BLACK),
        shadowBlur: 0,
        shadowOffsetX: 1,
        shadowOffsetY: 1,
        fillOpacity: 0.3,
        height: 5,
    });

    series1.columns.template.adapters.add("tooltipHTML", (text) => {
        const d = statsData.value['size'];
        text = "<b>Dataset rows:</b><br>";
        for (let i = 0; i < d.length; ++i) {
            text += `● Original ${i + 1}: ${d[i]['rows_original']}<br>`;
            text += `● Selected ${i + 1}: ${d[i]['rows_effective']} (${d[i]['value1']})<br>`;
        }
        return `<div style='font-size:12px; color: black;'>${text}</div>`;
    });

    series2.columns.template.setAll({
        width: am5.percent(50),
        tooltipY: 0,
        shadowColor: am5.color(GB_PALETTE.BLACK),
        shadowBlur: 0,
        shadowOffsetX: 1,
        shadowOffsetY: 1,
        height: 5,
    });

    series1.columns.template.adapters.add("fill", (fill, target) => {
        if (target.dataItem) {
            const dataItem = target.dataItem as DataItem<IColumnSeriesDataItem>;
            if (dataItem._settings.categoryY !== undefined) {
                const ix = parseInt(dataItem._settings.categoryY);
                return am5.color(playerExplorerGroupsColorsCss[ix]);
            }
        }
        return fill;
    });

    series2.columns.template.adapters.add("fill", (fill, target) => {
        if (target.dataItem) {
            const dataItem = target.dataItem as DataItem<IColumnSeriesDataItem>;
            if (dataItem._settings.categoryY !== undefined) {
                const ix = parseInt(dataItem._settings.categoryY);
                return am5.color(playerExplorerGroupsColorsCss[ix]);
            }
        }
        return fill;
    });

    series['size'] = [series1, series2];

    const d = statsData.value['size'];
    series1.data.setAll(d);
    series2.data.setAll(d);
    yAxis.data.setAll(d);

    series1.appear(0);
    series2.appear(1000);
    chart.appear(100, 100);
}

function showGenderChartPerGender(females: boolean, gender_container: am5.Container) {

    if (root === undefined) {
        return;
    }

    const tile = females ? "Females" : "Males";

    const container = am5.Container.new(root, {
        width: am5.percent(50),
        layout: root.verticalLayout,
        paddingLeft: 0,
        marginLeft: 0,
        paddingRight: 0,
        marginRight: 0,
    });

    gender_container.children.push(container);

    container.children.push(am5.Label.new(root, {
        text: tile,
        fontSize: 10,
        fontWeight: "500",
        textAlign: "left",
        y: 0,
        x: am5.percent(0),
        centerX: am5.percent(0),
        paddingTop: 0,
        paddingBottom: 0,
        fill: am5.color(GB_PALETTE.WHITE),
        fontFamily: CssUtils.getCssVariableValue("--gb-font-family")
    }));

    const chart = container.children.push(am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        layout: root.verticalLayout,
        focusable: true,
        width: am5.percent(100),
        height: 70,
        paddingLeft: 0,
        marginLeft: 0,
        paddingRight: 0,
        marginRight: 0,
        arrangeTooltips: false,
    }));

    const xRenderer = am5xy.AxisRendererX.new(root, {});

    xRenderer.labels.template.setAll({
        visible: false,
    });

    xRenderer.grid.template.set("visible", false);

    const xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
        renderer: xRenderer,
        min: 0,
        max: 100,
    }));

    const yRenderer = am5xy.AxisRendererY.new(root, {});

    yRenderer.labels.template.setAll({
        visible: false,
    });

    yRenderer.grid.template.set("visible", false);

    const yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
        categoryField: "name",
        renderer: yRenderer
    }));

    const series1 = chart.series.push(
        am5xy.ColumnSeries.new(root, {
            name: "Dataset 1",
            xAxis: xAxis,
            yAxis: yAxis,
            valueXField: "value2",
            categoryYField: "name",
            fill: am5.color(GB_PALETTE.GREEN_GEM),
            clustered: false,
            tooltip: am5.Tooltip.new(root, {
                // @ts-ignore
                getFillFromObject: false,
            })
        })
    );

    const series2 = chart.series.push(
        am5xy.ColumnSeries.new(root, {
            name: "Dataset 2",
            xAxis: xAxis,
            yAxis: yAxis,
            valueXField: "value1",
            categoryYField: "name",
            fill: am5.color(GB_PALETTE.DIM_OCEAN),
            clustered: false,
            interpolationDuration: 500,
            interpolationEasing: am5.ease.linear,
        })
    );

    series1.columns.template.adapters.add("tooltipHTML", (text) => {
        const d = statsData.value['females'];
        text = "<b>Gender:</b><br>";
        for (let i = 0; i < d.length; ++i) {
            text += `● Original ${i + 1}: M: ${(100 - d[i]['original'])}%, F: ${(d[i]['original'])}%<br>`;
            text += `● Selected ${i + 1}: M: ${(100 - d[i]['value1'])}%, F: ${(d[i]['value1'])}%<br>`;
        }
        return `<div style='font-size:12px; color: black;'>${text}</div>`;
    });

    const seriesOrig = chart.series.push(
        am5xy.LineSeries.new(root, {
            xAxis: xAxis,
            yAxis: yAxis,
            valueXField: "original",
            categoryYField: "name"
        }));

    seriesOrig.strokes.template.setAll({
        visible: false
    });

    // Add bullets
    seriesOrig.bullets.push(() => {
        if (root === undefined) {
            return;
        }
        return am5.Bullet.new(root, {
            sprite: am5.Triangle.new(root, {
                fill: am5.color(GB_PALETTE.WHITE),
                rotation: 180,
                width: 8,
                height: 8,
                centerY: am5.percent(10)
            })
        });
    });

    series1.columns.template.setAll({
        width: am5.percent(90),
        tooltipY: 0,
        shadowColor: am5.color(GB_PALETTE.BLACK),
        shadowBlur: 0,
        shadowOffsetX: 1,
        shadowOffsetY: 1,
        fillOpacity: 0.3,
        height: 5,
    });


    series2.columns.template.setAll({
        width: am5.percent(50),
        tooltipY: 0,
        shadowColor: am5.color(GB_PALETTE.BLACK),
        shadowBlur: 0,
        shadowOffsetX: 1,
        shadowOffsetY: 1,
        height: 5,
    });

    series1.columns.template.adapters.add("fill", (fill, target) => {
        if (target.dataItem) {
            const dataItem = target.dataItem as DataItem<IColumnSeriesDataItem>;
            if (dataItem._settings.categoryY !== undefined) {
                const ix = parseInt(dataItem._settings.categoryY);
                return am5.color(playerExplorerGroupsColorsCss[ix]);
            }
        }
        return fill;
    });

    series2.columns.template.adapters.add("fill", (fill, target) => {
        if (target.dataItem) {
            const dataItem = target.dataItem as DataItem<IColumnSeriesDataItem>;
            if (dataItem._settings.categoryY !== undefined) {
                const ix = parseInt(dataItem._settings.categoryY);
                return am5.color(playerExplorerGroupsColorsCss[ix]);
            }
        }
        return fill;
    });

    const cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
        xAxis: xAxis,
        // @ts-ignore
        maxTooltipDistance: -1,
    }));
    cursor.lineY.set("visible", false);

    const data_key = females ? 'females' : 'males';

    series[data_key] = [series1, series2, seriesOrig];

    const d = statsData.value[data_key];

    series1.data.setAll(d);
    series2.data.setAll(d);
    seriesOrig.data.setAll(d);
    yAxis.data.setAll(d);

    series1.appear(0);
    series2.appear(1000);
    seriesOrig.appear(0);

    chart.appear(100, 100);

}

function showGenderChart(mainContainer: am5.Container) {

    if (root === undefined) {
        return;
    }

    const gender_container = am5.Container.new(root, {
        width: am5.percent(100),
        //height: 300,
        layout: root.verticalLayout,
        paddingLeft: 0,
        marginLeft: 0,
        paddingRight: 0,
        marginRight: 0,
    });

    const gender_chart_container = am5.Container.new(root, {
        width: am5.percent(100),
        //height: 300,
        layout: root.horizontalLayout,
        paddingLeft: 0,
        marginLeft: 0,
        paddingRight: 0,
        marginRight: 0,
    });

    gender_container.children.push(am5.Label.new(root, {
        text: "Gender",
        fontSize: 14,
        fontWeight: "500",
        textAlign: "left",
        y: 0,
        x: am5.percent(0),
        centerX: am5.percent(0),
        paddingTop: 0,
        paddingBottom: 0,
        fill: am5.color(GB_PALETTE.WHITE),
        fontFamily: CssUtils.getCssVariableValue("--gb-font-family")
    }));

    gender_container.children.push(gender_chart_container);

    mainContainer.children.push(gender_container);

    showGenderChartPerGender(false, gender_chart_container);
    showGenderChartPerGender(true, gender_chart_container);
}

</script>
