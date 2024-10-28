<script setup lang="ts">

import {ITsGroupLogSimilarity} from "@/models/portal/PortalDataTypes";
import {usePortalStore} from "@/models/portal/PortalStore";
import {computed} from "vue";
import {PlatformProductDefData} from "@/models/portal/platformProduct/PlatformProductData";

const props = defineProps<{
    data: ITsGroupLogSimilarity
}>();

const portalStore = usePortalStore();

type TItemType = "both" | "my" | "c"

interface IFinalData {
    score: {
        type: TItemType;
        data: IFinalDataItem[];
    }[];
    sim: ITsSimItem[];
    simFinal: number;
}

interface IFinalDataItem {
    d?: PlatformProductDefData;
    cW: number;
    sW: number;
    val: number;
    valFinal: number;
}

interface ITsSimItem {
    subcategory: string;
    tsSimW: number;
    tsSimCntBoth: number;
    tsSimCntAll: number;
    data: {
        type: TItemType;
        cnt: number;
    }[];
}

const finalData = computed((): IFinalData => {
    const res: IFinalData = {
        score: [],
        sim: [],
        simFinal: 0
    };

    function getW(tagId: string): [number, number, number] {
        const cW = props.data.data.c_w.find((x) => x.tag_id === tagId)?.w ?? 0;
        const sW = props.data.data.survey_w.find((x) => x.tag_id === tagId)?.w ?? 0;
        const tsSimW = props.data.data.ts_sim_w.find((x) => x.tag_id === tagId)?.w ?? 0;
        return [cW, sW, tsSimW];
    }

    [
        {t: "both" as TItemType, arr: props.data.data.same_tags.tag_ids},
        {t: "my" as TItemType, arr: props.data.data.only_my_tags.tag_ids},
        {t: "c" as TItemType, arr: props.data.data.only_c_tags.tag_ids},
    ].forEach((x) => {
        const arr: IFinalDataItem[] = [];
        x.arr.forEach((y) => {
            const d = portalStore.getPortalDefProductItem(y);
            if (d !== undefined) {
                const w = getW(y);
                arr.push({
                    cW: w[0],
                    sW: w[1],
                    d: d,
                    valFinal: 0,
                    val: w[0] * w[1] * (x.t === "both" ? 1 : -1)
                });
                const subcategoryName = d.subcategory_client_name === null ? d.subcategory : d.subcategory_client_name;
                let s = res.sim.find((z) => z.subcategory === subcategoryName);
                if (s === undefined) {
                    s = {
                        tsSimCntBoth: 0,
                        tsSimCntAll: 0,
                        subcategory: subcategoryName,
                        data: [
                            {type: "both", cnt: 0},
                            {type: "my", cnt: 0},
                            {type: "c", cnt: 0},
                        ],
                        tsSimW: w[2]
                    }
                    res.sim.push(s)
                }
                const ss = s.data.find((z) => z.type === x.t);
                if (ss !== undefined) {
                    if (ss.type === "both") {
                        s.data.forEach((zz) => zz.cnt++);
                    } else {
                        ss.cnt++;
                    }
                }
            }
        });
        res.score.push({
            type: x.t,
            data: arr
        });
    });

    let valFinal = 0;
    res.score.forEach((x) => {
        x.data = x.data.filter((y) => y.cW * y.sW > 0);
        x.data.sort((a, b) => b.sW * b.cW - a.sW * a.cW);
        x.data.forEach((y) => {
            valFinal += y.val;
            y.valFinal = valFinal;
        });
    });

    res.sim = res.sim.filter((x) => x.tsSimW !== 0);
    res.sim.forEach((x) => {
        const both = x.data.find((y) => y.type === "both");
        const my = x.data.find((y) => y.type === "my");
        const c = x.data.find((y) => y.type === "c")

        if (both !== undefined && my !== undefined && c !== undefined) {
            x.tsSimCntAll = Math.max(my.cnt, c.cnt);
            x.tsSimCntBoth = both.cnt;

            res.simFinal += (x.tsSimCntBoth / x.tsSimCntAll) * x.tsSimW;
        }
    });

    res.simFinal = Math.round(res.simFinal);

    return res;
})

</script>

<template>
    <div class="text-[0.7em] pt-5">
        <div class="gb-layout-tl max-h-[calc(100vh-200px)] gb-ui-scroll-v p-10 pt-8">
            <div class="font-bold text-[1.2em] pb-4">Similarity TS Score:</div>
            <div class="gb-layout-row font-bold pb-2">
                <div class="w-[150px]">Subcategory</div>
                <div class="w-[100px] text-right">Both</div>
                <div class="w-[100px] text-right">My</div>
                <div class="w-[100px] text-right">Competitor</div>
                <div class="w-[70px] text-right">W</div>
                <div class="w-[150px] text-right">Calc</div>
                <div class="w-[70px] text-right">Final</div>
            </div>
            <div v-for="data in finalData.sim" class="gb-layout-row">
                <div class="w-[150px]">{{data.subcategory}}</div>
                <div class="w-[100px] text-right !font-mono">{{data.data.find((x) => x.type === 'both')?.cnt}}</div>
                <div class="w-[100px] text-right !font-mono">{{data.data.find((x) => x.type === 'my')?.cnt}}</div>
                <div class="w-[100px] text-right !font-mono">{{data.data.find((x) => x.type === 'c')?.cnt}}</div>
                <div class="w-[70px] text-right !font-mono">{{data.tsSimW}}</div>
                <div class="w-[150px] text-right !font-mono">{{data.tsSimCntBoth}} / {{data.tsSimCntAll}} * {{data.tsSimW}}</div>
                <div class="w-[70px] text-right !font-mono">{{Math.round((data.tsSimCntBoth / data.tsSimCntAll) * data.tsSimW)}}%</div>
            </div>
            <div class="w-[740px] font-bold underline text-right !font-mono">{{finalData.simFinal}}%</div>
            <div class="font-bold text-[1.2em] pb-4 pt-4">TOP50 Competitor Score:</div>
            <div class="gb-layout-row font-bold pb-2">
                <div class="w-[150px]">Label</div>
                <div class="w-[100px]">Type</div>
                <div class="w-[70px] text-right">Pool</div>
                <div class="w-[70px] text-right">Survey</div>
                <div class="w-[100px] text-right">Value</div>
                <div class="w-[100px] text-right">Final</div>
            </div>
            <div v-for="data in finalData.score" class="gb-layout">
                <div v-for="item in data.data" class="gb-layout-row">
                    <div class="w-[150px]">{{item.d?.node}}</div>
                    <div class="w-[100px]">{{data.type === "both" ? "Both" : (data.type === "my" ? "My game" : "Competitor")}}</div>
                    <div class="w-[70px] text-right !font-mono">{{item.cW}}</div>
                    <div class="w-[70px] text-right !font-mono">{{item.sW}}</div>
                    <div class="w-[100px] text-right !font-mono">{{item.val}}</div>
                    <div class="w-[100px] text-right !font-mono">{{item.valFinal}}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>