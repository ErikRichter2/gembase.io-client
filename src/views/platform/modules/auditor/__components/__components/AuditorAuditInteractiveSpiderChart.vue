<script setup lang="ts">
import {InteractiveSpiderChart, InteractiveSpiderChartItem} from "@/models/portal/PortalDataTypes";
import {onMounted, ref, watch} from "vue";
import {GB_PALETTE} from "@/tailwind/gembaseTwPalette";
import {math} from "@amcharts/amcharts5";
import {TwRawColor} from "@/tailwind/gembaseTwData";
import GembaseUtils from "@/utils/GembaseUtils";
import PortalUtils from "@/models/portal/PortalUtils";

const props = defineProps<{
    data: InteractiveSpiderChart
}>();

const emits = defineEmits<{
    (event: "onValueChange", id: number, value: number)
}>();

const renderContainer = ref<HTMLDivElement>();
const renderCanvas = ref<HTMLCanvasElement>();

onMounted(() => {
    createChart();
});

watch(() => props.data.items.length, () => {
    createChart();
});

interface DataPerEl {
    angle: number;
    value: number;
    item: InteractiveSpiderChartItem;
    renderPosX: number;
    renderPosY: number;
}

function createChart() {
    if (renderContainer.value === undefined) {
        return;
    }

    const rect = renderContainer.value.getBoundingClientRect();
    const halfH = rect.height / 2;
    const halfW = rect.width / 2;
    const centerClientX = rect.left + halfW;
    const centerClientY = rect.top + halfH;
    const radius = Math.min(halfW, halfH) * 0.9;
    const maxRadius = radius * 0.8;
    const minRadius = radius * 0.2;
    const renderData: DataPerEl[] = [];
    const buttonSize = 14;

    let draggedEl: DataPerEl | undefined = undefined;
    let mouseOverEl: DataPerEl | undefined = undefined;

    function normalizeAngle(angle: number): number {
        if (angle < 0) {
            return 360 + angle;
        }
        else if (angle >= 360) {
            return angle - 360;
        }
        return angle;
    }

    function hit(e: MouseEvent): DataPerEl | undefined {
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        const halfB = buttonSize / 2;

        return renderData.find((x) =>
            px >= x.renderPosX - halfB &&
            px <= x.renderPosX + halfB &&
            py >= x.renderPosY - halfB &&
            py <= x.renderPosY + halfB);
    }

    if (renderCanvas.value !== undefined) {
        renderCanvas.value.width = rect.width;
        renderCanvas.value.height = rect.height;

        renderCanvas.value.addEventListener('mousedown', function(e) {
            draggedEl = hit(e);
        });

        renderCanvas.value.addEventListener('mouseup', function() {
            if (draggedEl !== undefined) {
                emits("onValueChange", draggedEl.item.id, PortalUtils.normalizeSubcategoryWeight(draggedEl.value));
                draggedEl = undefined;
                doRenderCanvas();
            }
        });

        renderCanvas.value.addEventListener('mousemove', function(e) {

            mouseOverEl = hit(e);
            document.body.style.cursor = mouseOverEl !== undefined ? "pointer" : "default";

            if (draggedEl !== undefined) {
                const diffMinX = e.clientX - (centerClientX ?? e.clientX);
                const diffMinY = e.clientY - (centerClientY ?? e.clientY);

                let diff = Math.sqrt(Math.pow(diffMinX, 2) + Math.pow(diffMinY, 2));
                if (diff > maxRadius) {
                    diff = maxRadius;
                }
                if (diff < minRadius) {
                    diff = minRadius;
                }

                const clientAngle = normalizeAngle(Math.atan2(diffMinY, diffMinX) * 180 / Math.PI);
                const fromAngle = normalizeAngle(draggedEl.angle - 90);
                const toAngle = normalizeAngle(draggedEl.angle + 90);

                if (toAngle < fromAngle) {
                    if (toAngle <= clientAngle && clientAngle <= fromAngle) {
                        diff = minRadius;
                    }
                } else {
                    if (clientAngle >= toAngle || clientAngle <= fromAngle) {
                        diff = minRadius;
                    }
                }

                draggedEl.value = props.data.min + ((diff - minRadius) / (maxRadius - minRadius)) * (props.data.max - props.data.min);
                draggedEl.renderPosY = halfH + diff * math.sin(draggedEl.angle);
                draggedEl.renderPosX = halfW + diff * math.cos(draggedEl.angle);
            }

            doRenderCanvas();
        });
    }

    const ctx = renderCanvas.value?.getContext("2d");

    function doRenderCanvas() {
        if (ctx === null || ctx === undefined) {
            return;
        }

        ctx.clearRect(0, 0, rect.width, rect.height);

        const lineStrokeColor = TwRawColor.fromHex(GB_PALETTE.WHITE, 20).toCssRgb();

        renderData.forEach((k) => {
            const cosAngle = math.cos(k.angle);
            const sinAngle = math.sin(k.angle);
            const textRotation = k.angle * math.PI / 180 - math.PI / 2;
            const ratio = (k.value - props.data.min) / (props.data.max - props.data.min);

            ctx.beginPath();
            ctx.strokeStyle = lineStrokeColor;
            ctx.moveTo(halfW + minRadius * cosAngle, halfH + minRadius * sinAngle);
            ctx.lineTo(halfW + maxRadius * cosAngle, halfH + maxRadius * sinAngle);
            ctx.stroke();

            const isUpper = k.angle >= 180 && k.angle <= 360;

            let l = radius;
            if (!isUpper) {
                l += 10;
            }

            ctx.save();
            ctx.translate(halfW + l * cosAngle, halfH + l * sinAngle);
            ctx.rotate(textRotation);
            ctx.textAlign = "center";
            if (isUpper) {
                ctx.scale(-1, -1);
            }
            ctx.fillStyle = GB_PALETTE.WHITE;
            ctx.font = "12px montserrat";
            ctx.fillText(k.item.label,0,0);
            ctx.restore();

            ctx.save();
            ctx.translate(halfW + (l - 15) * cosAngle, halfH + (l - 15) * sinAngle);
            ctx.rotate(textRotation);
            ctx.textAlign = "center";
            if (isUpper) {
                ctx.scale(-1, -1);
            }
            ctx.fillStyle = GB_PALETTE.WHITE;
            ctx.font = "14px montserrat";
            ctx.fillText(`${PortalUtils.normalizeSubcategoryWeight(k.value)}`,0,0);
            ctx.restore();

            ctx.save();
            ctx.beginPath();
            ctx.arc(k.renderPosX, k.renderPosY, (buttonSize + 4 * ratio) / 2, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.fillStyle = GembaseUtils.interpolateColor(
                GB_PALETTE.OCEAN,
                GB_PALETTE.MAGENTA,
                ratio
            );
            if (mouseOverEl === k) {
                ctx.filter = "brightness(150%)"
            }
            ctx.fill();
            ctx.restore();
        });
    }

    for (let i = 0; i < props.data.items.length; ++i) {
        const angle = normalizeAngle(360 / props.data.items.length * i - 90);
        const radiusVal = minRadius + (maxRadius - minRadius) * (props.data.items[i].value / (props.data.max - props.data.min));

        renderData.push({
            renderPosX: halfW + radiusVal * math.cos(angle),
            renderPosY: halfH + radiusVal * math.sin(angle),
            value: props.data.items[i].value,
            angle: angle,
            item: props.data.items[i]
        });
    }

    doRenderCanvas();
}

</script>

<template>
    <div ref="renderContainer" class="relative w-full h-full">
        <canvas ref="renderCanvas" class="absolute"></canvas>
    </div>
</template>
