<script setup lang="ts">
import {TooltipDataV2} from "@/models/portal/competitor/PortalCompetitorData";
import {ICompetitorAppDetailTs, ITooltipThreatScoreData} from "@/models/portal/PortalDataTypes";
import {TAppId} from "@/models/portal/apps/AppsData";
import {computed, Ref, ref} from "vue";
import {PortalCompetitorUtils} from "@/models/portal/competitor/PortalCompetitorUtils";
import AuditorAuditCompetitorDetail
    from "@/views/platform/modules/auditor/__components/__components/AuditorAuditCompetitorDetail.vue";
import PortalUiThreatScoreComponent from "@/views/platform/modules/__components/PlatformThreatScoreElement.vue";
import {EModuleId} from "@/models/portal/PortalConstants";
import {usePortalStore} from "@/models/portal/PortalStore";
import AuditorAuditSemaphoreBtn from "@/views/platform/modules/auditor/__components/__components/AuditorAuditSemaphoreBtn.vue";
import {TagsHelper} from "@/models/portal/tags/TagsHelper";
import GembaseUiWindowSubtitle from "@/views/ui/GembaseUiWindowSubtitle.vue";
import {PlatformValuesHelper} from "@/models/portal/competitor/PlatformValuesHelper";
import GembaseUtils from "@/utils/GembaseUtils";
import ClientError from "@/core/errors/ClientError";
import {
    EDiscountGroup,
    ETsGroup,
    IPlatformCalcCompetitorsAppDetail,
    IPlatformCalcCompetitorsTs,
    TsColor
} from "@/models/portal/calc/PlatformCalcData";
import GbPopup from "@/views/ui/popups/GbPopup.vue";
import InteractiveImage from "@/views/ui/img/InteractiveImage.vue";
import ThreatScoreDetailPopupTsButton from "@/views/platform/modules/__components/__components/ThreatScoreDetailPopupTsButton.vue";
import PlatformAppIcon from "@/views/platform/modules/__components/PlatformAppIcon.vue";
import GamesExplorerRouterElement
    from "@/views/platform/modules/__components/__components/GamesExplorerRouterElement.vue";

const props = defineProps<{
    tooltipData?: TooltipDataV2,
    competitorsCount?: number,
    maxCompetitorsCount?: boolean
}>();

const emits = defineEmits<{
    (event: 'onClose')
}>();

const portalStore = usePortalStore();
const defaultCompetitorsCnt = 20;

const __selectedThreat: Ref<string | undefined> = ref();
const __selectedThreatCnt = ref(0);
const __selectedDiscount = ref("");
const __competitorsCnt = ref(props.competitorsCount ?? (props.maxCompetitorsCount ? (props.tooltipData?.competitors?.competitors_count ?? defaultCompetitorsCnt) : defaultCompetitorsCnt));

const getTooltipThreatScoreData = computed((): ITooltipThreatScoreData[] => {

    if (props.tooltipData?.competitors?.ts_items === undefined ||
        props.tooltipData?.competitors?.competitor_apps_details === undefined) {
        return [];
    }

    const ts = props.tooltipData?.competitors?.ts_items;
    const appDetails = props.tooltipData?.competitors?.competitor_apps_details;

    const res: ITooltipThreatScoreData[] = [];

    const tsConstArr = [
        ["Similarity", ETsGroup.Similar], ["Size", ETsGroup.Size], ["Growth", ETsGroup.Growth],
        ["TAM", ETsGroup.TAM], ["Novelty", ETsGroup.Trend], ["Quality", ETsGroup.Quality]
    ]

    const isSingleApp = getLocalSingleAppCompetitor.value !== undefined;
    if (!isSingleApp) {
        tsConstArr.unshift(["Count", "count"]);
    }

    tsConstArr.forEach((tsConst) => {

        const gr = tsConst[1];

        function getAppDetail(__appId: TAppId) {
            const __appDetail = appDetails?.find((x) => x.app_id === __appId);
            if (__appDetail === undefined) {
                throw new ClientError(`App ${__appId} not found !`);
            }
            return __appDetail;
        }

        const rArr: ICompetitorAppDetailTs[] = [];
        const gArr: ICompetitorAppDetailTs[] = [];
        const nArr: ICompetitorAppDetailTs[] = [];
        let totalArr: ICompetitorAppDetailTs[] = [];

        if (gr === "count") {
            const sorted = [...ts];
            sorted.sort((a, b) => {
                return b.ts - a.ts;
            });
            sorted.forEach((x) => {
                if (totalArr.length < getCompetitorsCnt.value) {
                    totalArr.push({
                        gr: undefined,
                        ts: x,
                        appDetail: getAppDetail(x.app_id)
                    });
                }
            });

            let maxTs = 0;
            totalArr.forEach((x) => {
                if (x.ts.ts > maxTs) {
                    maxTs = x.ts.ts;
                }
            });

            totalArr.forEach((x) => {
                if (x.ts.ts >= 0.7 * maxTs) {
                    rArr.push(x);
                } else if (x.ts.ts < 0.4 * maxTs) {
                    gArr.push(x);
                } else {
                    nArr.push(x);
                }
            });
        } else {

            ts?.forEach((x) => {
                const tsGroup = x.ts_groups?.find((y) => y.gr === gr);
                const item = {
                    appDetail: getAppDetail(x.app_id),
                    ts: x,
                    gr: tsGroup
                }

                totalArr.push(item);
            });

            totalArr.sort((a, b) => {
                if (a.gr === undefined || b.gr === undefined) {
                    return 0;
                }
                return b.gr.raw_val - a.gr.raw_val;
            });

            totalArr = totalArr.slice(0, getCompetitorsCnt.value);

            totalArr.forEach((x) => {
                if (x.gr?.c === TsColor.Green) {
                    gArr.push(x);
                } else if (x.gr?.c === TsColor.Red) {
                    rArr.push(x);
                } else {
                    nArr.push(x);
                }
            });
        }

        if (totalArr.length === 0) {
            return [];
        }

        const r = Math.floor(rArr.length / totalArr.length * 100);
        const g = Math.floor(gArr.length / totalArr.length * 100);

        let worstColor = "g";
        if (rArr.length > 0) {
            worstColor = "r";
        } else if (nArr.length > 0) {
            worstColor = "n";
        }

        res.push({
            gr: tsConst[1],
            name: tsConst[0],
            worstColor: worstColor,
            colors: [
                {color: "r", width: r, competitors: rArr, gr: gr},
                {color: "n", width: 100 - (r + g), competitors: nArr, gr: gr},
                {color: "g", width: g, competitors: gArr, gr: gr}
            ]
        });
    });

    return res;
});

const maxCompetitorsCnt = computed(() => {
    if (props.tooltipData?.competitors !== undefined) {
        return props.tooltipData.competitors.competitors_count;
    }
    return 0;
});

const getCompetitorsCnt = computed(() => {
    return Math.max(0, Math.min(__competitorsCnt.value, maxCompetitorsCnt.value));
});

const audienceAngleName = computed(() => {
    return PortalCompetitorUtils.getNameForAudience(props.tooltipData?.competitors?.audience_detail);
});

const myAppTitle = computed(() => {
    const res = portalStore.getAppTitle(props.tooltipData?.appDetail, TagsHelper.getTagsList(props.tooltipData?.appTags));
    if (res === null || res === "") {
        return "selected attributes";
    }
    return res;
});

const getSelectedThreat = computed((): ITooltipThreatScoreData | undefined => {
    if (getTooltipThreatScoreData.value === undefined) {
        return undefined;
    }
    if (__selectedThreat.value === undefined) {
        return getTooltipThreatScoreData.value[0];
    }

    const res = getTooltipThreatScoreData.value.find((x) => x.gr === __selectedThreat.value);

    if (res === undefined) {
        return getTooltipThreatScoreData.value[0];
    }

    return res;
});

const __selectedTsColor = ref<string | undefined>();
const __forceTsColorUndefined = ref(true);

const getSelectedTsColor = computed(() => {
    if (__selectedTsColor.value === undefined) {
        if (__forceTsColorUndefined.value) {
            return undefined;
        } else {
            return getSelectedThreat.value?.worstColor;
        }
    }
    const f = getSelectedThreat.value?.colors.find((x) => x.color === __selectedTsColor.value);
    if (f === undefined || f.competitors.length === 0) {
        return getSelectedThreat.value?.worstColor;
    }

    return __selectedTsColor.value;
});

const tsDesc = computed(() => {
    if (getSelectedThreat.value === undefined) {
        return "";
    }

    if (getSelectedThreat.value?.gr === "count") {
        return `There are ${props.tooltipData?.competitors?.competitors_pool_cnt} comparable ${audienceAngleName.value} games in total. ${currentCompetitors.value?.length} of them with ${currentCompetitorsTsMedian.value}% Threat Score.`;
    }

    const isSingleApp = getLocalSingleAppCompetitor.value !== undefined;
    const cnt = currentCompetitors.value?.length;
    const singleAppGr = singleCompetitorTs.value?.ts_groups?.find(
        (x) => x.gr === getSelectedThreat.value?.gr
    );
    const medianArr: number[] = [];
    const releasedYearsMedianArr: number[] = [];
    const currentYear = GembaseUtils.currentYear();
    let maxReleasedYears = 0;
    currentCompetitors.value?.forEach((x) => {
        if (x.gr !== undefined) {
            medianArr.push(x.gr.ts_raw);
        }
        if (getSelectedThreat.value?.gr === "trend") {
            if (x.gr?.released !== undefined) {
                const releasedYears = currentYear - x.gr.released;
                releasedYearsMedianArr.push(releasedYears);
                if (releasedYears > maxReleasedYears) {
                    maxReleasedYears = releasedYears;
                }
            }
        }
    });
    const m = GembaseUtils.median(medianArr);
    const mr = GembaseUtils.median(releasedYearsMedianArr);
    const paramsArr = portalStore.tsParams.filter((x) => x.param === getSelectedThreat.value?.gr);
    paramsArr.sort((a, b) => b.v3 - a.v3);
    const p = paramsArr.find((x) => m >= x.v3);

    let noveltySuffix = `with median release of ${mr} years ago.`;
    if (getSelectedTsColor.value !== undefined) {
        if (maxReleasedYears === 0) {
            noveltySuffix = `released less than 1 year ago.`;
        } else if (maxReleasedYears <= 3) {
            noveltySuffix = `released more than 1 year and less than 3 years ago.`;
        } else {
            noveltySuffix = `released more than 3 years ago (median ${mr} years).`;
        }
    }

    function toLowerExceptTAM(str: string | undefined): string | undefined {
        return str?.toLowerCase().replaceAll("tam", "TAM");
    }

    if (getSelectedThreat.value.gr === "similar") {
        return isSingleApp ?
            `${singleCompetitorApp.value?.title} has a ${m}% similar attributes compared to ${myAppTitle.value}` :
            `There are ${cnt} comparable ${audienceAngleName.value} games with ${m}% similar attributes (median) like ${myAppTitle.value}.`;
    } else if (getSelectedThreat.value.gr === "size") {
        return isSingleApp ?
            `${singleCompetitorApp.value?.title} has a ${singleAppGr?.ts_name?.toLowerCase()} compared to ${myAppTitle.value}` :
            `There are ${cnt} comparable ${audienceAngleName.value} games of ${p?.name.toLowerCase()} (median) compared to ${myAppTitle.value}.`;
    } else if (getSelectedThreat.value.gr === "growth") {
        return isSingleApp ?
            `${singleCompetitorApp.value?.title} has a ${singleAppGr?.ts_name?.toLowerCase()} compared to ${myAppTitle.value}` :
            `There are ${cnt} comparable ${audienceAngleName.value} games of ${p?.name.toLowerCase()} (median) compared to ${myAppTitle.value}.`;
    } else if (getSelectedThreat.value.gr === "tam") {
        return isSingleApp ?
            `${singleCompetitorApp.value?.title} has a ${toLowerExceptTAM(singleAppGr?.ts_name)} Revenues compared to ${myAppTitle.value}` :
            `There are ${cnt} comparable ${audienceAngleName.value} games with ${toLowerExceptTAM(p?.name)} Revenues (median) compared to ${myAppTitle.value}.`;
    } else if (getSelectedThreat.value.gr === "trend") {
        return isSingleApp ?
            `${singleCompetitorApp.value?.title} was released ${currentYear - (singleAppGr?.released ?? 0)} years ago` :
            `There are ${cnt} comparable ${audienceAngleName.value} games ${noveltySuffix}`;
    } else if (getSelectedThreat.value.gr === "quality") {
        return isSingleApp ?
            `${singleCompetitorApp.value?.title} has a ${singleAppGr?.ts_name?.toLowerCase()} (reviews)` :
            `There are ${cnt} comparable ${audienceAngleName.value} games of ${p?.name} (median) .`;
    }

    return "";
});

interface IStrengthSection {
    group: string;
    name: string;
    desc: string;
    worstColor: string;
    percentage: string;
}

const strengthSections = computed((): IStrengthSection[] => {
    if (props.tooltipData?.competitors?.discounts === undefined) {
        return [];
    }

    const res: IStrengthSection[] = [];

    [["Experience", "calc_exp"], ["Quality", "calc_qua_angle"], ["Performance", "calc_rev"]].forEach((x) => {
        res.push({
            group: x[1],
            name: x[0],
            desc: "",
            worstColor: "g",
            percentage: ""
        });
    })

    res.forEach((section) => {

        const gr = props.tooltipData?.competitors?.discounts?.find((x) => x.gr === section.group);

        if (gr !== undefined && gr.locked !== true) {
            section.worstColor = gr.c;
            section.percentage = `-${gr.ts_perc.toString()}`;

            if (section.group === EDiscountGroup.Experience) {
                section.desc = `${props.tooltipData?.competitors?.company_title} has ${gr.ts_raw} years of relevant experience with ${audienceAngleName.value} games`;
            } else if (section.group === EDiscountGroup.Quality) {
                let text = `${props.tooltipData?.competitors?.company_title} has created games of ${PlatformValuesHelper.qualityFullText(props.tooltipData?.competitors?.qua_full)} quality but not ${audienceAngleName.value}`;
                if ((props.tooltipData?.competitors?.quality_portfolio ?? 0) > 0) {
                    text = `${props.tooltipData?.competitors?.company_title} has created ${audienceAngleName.value} games of ${PlatformValuesHelper.qualityFullText(props.tooltipData?.competitors?.qua_full)} quality`
                }
                section.desc = text;
            } else if (section.group === EDiscountGroup.Revenues) {
                section.desc = `${props.tooltipData?.competitors?.company_title} has earned ${PlatformValuesHelper.discountValueName(gr)} revenues last year`;
            }
        }
    });

    return res;
});

const getSelectedDiscount = computed(() => {
    if (__selectedDiscount.value === "") {
        return strengthSections.value[0];
    }
    return strengthSections.value.find((x) => x.group === __selectedDiscount.value);
});

const selectedCompetitor = ref<IPlatformCalcCompetitorsAppDetail>();

const getSelectedCompetitor = computed(() => {
    let appId: TAppId | undefined = undefined;

    const arr = currentCompetitors.value;

    if (arr !== undefined && arr.length > 0) {
        appId = arr[0].appDetail.app_id;

        if (selectedCompetitor.value !== undefined) {
            const found = arr.find((x) => x.appDetail.app_id === selectedCompetitor.value?.app_id);
            if (found) {
                appId = selectedCompetitor.value.app_id;
            }
        }

        const c = props.tooltipData?.competitors?.competitor_apps_details?.find((x) => x.app_id === appId);
        return c;
    }

    return undefined
});

function onSelectCompetitor(appId: TAppId) {
    props.tooltipData?.competitors?.competitor_apps_details?.forEach((x) => {
        if (x.app_id === appId) {
            selectedCompetitor.value = x;
            return;
        }
    });
}

function generateGamesExplorerQuery() {
    const appDetails: IPlatformCalcCompetitorsAppDetail[] = [];
    currentCompetitors.value?.forEach((x) => {
        appDetails.push(x.appDetail);
    });
    if (props.tooltipData?.competitors !== undefined && props.tooltipData?.competitors.audience_detail !== undefined) {
        return PortalCompetitorUtils.generateGamesExplorerQuery(
            appDetails,
            props.tooltipData?.competitors.audience_detail,
            props.tooltipData?.appDetail
        );
    }
    return undefined
}

const currentCompetitors = computed((): ICompetitorAppDetailTs[] | undefined => {
    const res: ICompetitorAppDetailTs[] = [];
    getSelectedThreat.value?.colors.forEach((x) => {
        if (x.color === getSelectedTsColor.value || getSelectedTsColor.value === undefined) {
            res.push(...x.competitors);
        }
    });
    return res;
});

const currentCompetitorsTsMedian = computed((): number => {
    const arr: number[] = [];

    currentCompetitors.value?.forEach((x) => {
        arr.push(x.ts.ts);
    });

    const m = PlatformValuesHelper.competitorsTsValue(arr);
    return m;
});

const currentCompetitorsTop3AvgTs = computed((): number => {
    const arr: number[] = [];

    currentCompetitors.value?.forEach((x) => {
        arr.push(x.ts.ts);
    });

    const m = PlatformValuesHelper.competitorsTop3AvgValue(arr);
    return Math.round(m);
});

const tsMedianTooltip = computed(() => {
    return `Threat Score considers Competitive Index and number of competitors.`;
});

const singleCompetitorApp = computed((): IPlatformCalcCompetitorsAppDetail | undefined => {
    if (props.tooltipData?.competitors !== undefined && getLocalSingleAppCompetitor.value !== undefined) {
        const appDetail = props.tooltipData.competitors?.competitor_apps_details?.find(
            (x) => x.app_id === getLocalSingleAppCompetitor.value);
        if (appDetail !== undefined) {
            return appDetail;
        }
    }
    return undefined;
});

const singleCompetitorTs = computed((): IPlatformCalcCompetitorsTs | undefined => {
    if (getLocalSingleAppCompetitor.value !== undefined) {
        const ts = props.tooltipData?.competitors?.ts_items?.find(
            (x) => x.app_id === getLocalSingleAppCompetitor.value);
        return ts;
    }
    return undefined;
});

const isLocalSingleAppCompetitor: Ref<TAppId | undefined> = ref();

const getLocalSingleAppCompetitor = computed((): TAppId | undefined => {
    if (isLocalSingleAppCompetitor.value !== undefined) {
        return isLocalSingleAppCompetitor.value;
    }
    return props.tooltipData?.singleAppCompetitor;
});

const getSingleAppPercentage = computed(() => {
    const c = props.tooltipData?.competitors?.ts_items?.find(
        (x) => x.app_id === getLocalSingleAppCompetitor.value
    );
    if (c !== undefined) {
        const ts = c.ts_groups?.find((x) => x.gr === getSelectedThreat.value?.gr);
        if (ts !== undefined) {
            return `+${ts.ts_perc.toString()}%`
        }
    }
    return "";
});

function onTsSingleApp(appId: TAppId | undefined) {
    isLocalSingleAppCompetitor.value = appId;
    //prepareViewData();
}

function onClose() {
    if (isLocalSingleAppCompetitor.value !== undefined) {
        isLocalSingleAppCompetitor.value = undefined;
        //prepareViewData();
    } else {
        emits("onClose");
    }
}

function onSelectThreatGroup(data: ITooltipThreatScoreData) {
    __selectedThreat.value = data.gr;
    __selectedTsColor.value = data.worstColor;
    __forceTsColorUndefined.value = false;
}

function onToggleTsColor(color: string) {
    if (__selectedTsColor.value === color) {
        __selectedTsColor.value = undefined;
        __forceTsColorUndefined.value = true;
    } else {
        __forceTsColorUndefined.value = false;
        __selectedTsColor.value = color;
    }
}

</script>

<template>
    <gb-popup close-id="threat_score_tooltip_close" @close="onClose">
        <div  class="min-w-[850px]">
            <div v-if="tooltipData?.competitors?.competitors_count === 0" class="gb-layout-tl min-w-[700px]">
                <div class="gb-layout-m-between pl-3 pr-3 pt-5 pb-2 font-bold gap-2">
                    <div class="gb-layout-ml-row gap-2">
                        <div>
                            There are no competitors with {{audienceAngleName}} attribute
                        </div>
                    </div>
                </div>
                <div class="gb-layout-tl">
                    <div class="gb-window">
                        <div class="gb-layout-tl gap-2">
                            <div class="pl-2 pr-2 gb-layout-tl gap-1">
                                <div class="gb-layout-m-between">
                                    <div class="text-[0.7em] leading-[0.9em] h-[30px]">
                                        This may be an opportunity if you are able to execute new concept and there is big enough addressable market.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else-if="singleCompetitorApp !== undefined" class="gb-layout-tl">
                <div class="gb-layout-m-between w-full font-bold gap-2 pl-3 pr-3 pt-6 pb-3">
                    <div class="gb-layout-ml-row gap-2">
                        <platform-app-icon class="!w-[50px] aspect-square !rounded !border-black !border" :app-icon="singleCompetitorApp"></platform-app-icon>
                        <div>
                            Competitive Index of {{singleCompetitorApp.title}}
                        </div>
                    </div>
                    <portal-ui-threat-score-component :total="true" :single-version="true" :readonly="true" class="text-[1em] !h-[40px] !w-[120px]" :show-icon="true" :threat-score="singleCompetitorTs?.ts"></portal-ui-threat-score-component>
                </div>
                <div class="gb-layout-tl w-full">
                    <div class="pl-3 font-bold pt-1">Game's threats</div>
                    <div class="gb-bg-inner-window gb-layout-tl p-3 w-full">
                        <div class="gb-layout-tl gap-2 w-full">
                            <div class="gb-layout-tl-row gap-1">
                                <template v-for="tsGroup in getTooltipThreatScoreData" :key="tsGroup.gr">
                                    <auditor-audit-semaphore-btn @click="onSelectThreatGroup(tsGroup)" class="text-[0.7em] font-bold" :selected="getSelectedThreat?.gr === tsGroup.gr" :interactive="true" :color="tsGroup.worstColor" :name="tsGroup.name"></auditor-audit-semaphore-btn>
                                </template>
                            </div>
                            <div v-if="getSelectedThreat !== undefined" class="gb-layout-t-between w-full gap-2">
                                <div class="text-[0.7em] leading-[0.9em] h-[30px]">{{tsDesc}}</div>
                                <portal-ui-threat-score-component :single-version="true" :color="TsColor.Red" :readonly="true" class="text-[0.8em] !h-[30px] !w-[90px]" :show-icon="true" :formatted-threat-score="getSingleAppPercentage"></portal-ui-threat-score-component>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="gb-layout-tl w-full">
                    <div class="pl-3 font-bold pt-3">
                        Strengths of {{tooltipData?.competitors?.company_title}}
                    </div>
                    <div class="gb-bg-inner-window gb-layout-tl p-3 w-full">
                        <div class="gb-layout-tl gap-2 w-full">
                            <div class="gb-layout-tl-row gap-1">
                                <template v-for="section in strengthSections" :key="section.group">
                                    <auditor-audit-semaphore-btn @click="__selectedDiscount = section.group" class="text-[0.7em] font-bold" :selected="getSelectedDiscount?.group === section.group" :interactive="true" :color="section.worstColor" :name="section.name"></auditor-audit-semaphore-btn>
                                </template>
                            </div>
                            <div class="gb-layout-t-between w-full">
                                <div class="text-[0.7em] leading-[0.9em] h-[30px]">{{getSelectedDiscount?.desc}}</div>
                                <portal-ui-threat-score-component :strength="true" :company-title="tooltipData?.competitors?.company_title" :single-version="true" :color="TsColor.Green" :readonly="true" class="text-[0.8em] !h-[30px] !w-[90px]" :show-icon="true" :formatted-threat-score="`${getSelectedDiscount?.percentage}%`"></portal-ui-threat-score-component>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="gb-layout-tl w-full">
                <div class="gb-layout-tl w-full">
                    <div class="gb-layout-ml-row pl-3 pt-2 pb-3 gap-2 font-bold">
                        <div>
                            Examine threats of top
                        </div>
                        <input type="number" :min="0" :max="maxCompetitorsCnt" :value="getCompetitorsCnt" @input="(x) => __competitorsCnt = parseInt((x.target as HTMLInputElement).value)" class="w-[50px] !h-[25px]">
                        <div>
                            {{PortalCompetitorUtils.getNameForAudience(tooltipData?.competitors?.audience_detail)}} competitors
                        </div>
                    </div>
                    <div class="gb-bg-inner-window gb-layout-tl p-3 w-full">
                        <div class="gb-layout-tl gap-2 w-full">
                            <div class="gb-layout-t-between w-full gap-[2px]">
                                <template v-for="tsGroup in getTooltipThreatScoreData" :key="tsGroup.gr">
                                    <threat-score-detail-popup-ts-button class="grow" :ts-name="tsGroup.name" :data="tsGroup" :selected="getSelectedThreat?.gr === tsGroup.gr" @click="() => {onSelectThreatGroup(tsGroup); __selectedThreatCnt++}"></threat-score-detail-popup-ts-button>
                                </template>
                            </div>
                            <div class="w-full h-[20px] gb-layout-tl-row rounded-2xl gb2-mask">
                                <div v-for="item in getSelectedThreat?.colors" :key="`${item.color}__${item.width}`" class="gbc-bg-ts-bar gb-layout-row h-full gb-ts-bar-bg text-[0.7em] cursor-pointer" @click="onToggleTsColor(item.color)" :data-color="item.color" :data-selected="item.color === getSelectedTsColor?.toString() ? 'true' : ''" :style="{width: `${item.width}%`}">
                                    {{item.width === 0 ? '' : `${item.width}%`}}
                                </div>
                            </div>
                            <div class="pl-2 pr-2 gb-layout-tl gap-1 w-full">
                                <div class="min-h-[30px]">
                                    <div v-if="getSelectedThreat !== undefined" class="text-[0.7em] leading-[0.9em] h-[30px]">
                                        {{tsDesc}}
                                    </div>
                                    <gembase-ui-window-subtitle v-else-if="__selectedThreatCnt === 0" :blink="true" close-id="auditor-ts-tooltip">
                                    <span>
                                        Select filter above to display specific competitors.
                                    </span>
                                    </gembase-ui-window-subtitle>
                                </div>
                                <div class="gb-layout-m-between w-full">
                                    <div class="gb-layout-tl-row gap-1 w-full">
                                        <div class="gb-layout-tl-row overflow-scroll overflow-x-auto overflow-y-hidden max-w-[600px] gap-2">
                                            <div class="w-fit gb-layout-tl-row gap-[2px]">
                                                <div v-for="c in currentCompetitors" :key="c.appDetail.app_id" class="w-[30px] aspect-square">
                                                    <interactive-image @click="onSelectCompetitor(c.appDetail.app_id)" class="h-full w-auto rounded-md" data-fade-state="in">
                                                        <platform-app-icon :default-black-border="true" v-if="tooltipData?.competitors !== undefined" :app-icon="c.appDetail" :selected="getSelectedCompetitor?.app_id === c.appDetail.app_id"></platform-app-icon>
                                                    </interactive-image>
                                                </div>
                                            </div>
                                        </div>
                                        <games-explorer-router-element id="auditor_audit_games_explorer_btn" v-if="generateGamesExplorerQuery() !== undefined" :demo="portalStore.isModuleLocked(EModuleId.GAMES_EXPLORER)" :query="generateGamesExplorerQuery()!!"></games-explorer-router-element>
                                    </div>
                                    <portal-ui-threat-score-component :readonly="true" class="text-[1em] !h-[40px] !w-[120px]" :show-icon="true" :threat-score="currentCompetitorsTsMedian" :data-tooltip="tsMedianTooltip"></portal-ui-threat-score-component>
                                </div>
                            </div>
                            <auditor-audit-competitor-detail @on-ts-single-app="onTsSingleApp" :selected-competitor="getSelectedCompetitor" :competitors="tooltipData?.competitors"></auditor-audit-competitor-detail>
                        </div>
                    </div>
                </div>
                <div class="gb-layout-tl w-full">
                    <div class="pl-3 font-bold pt-3">
                        Strengths of {{tooltipData?.competitors?.company_title}}
                    </div>
                    <div class="gb-bg-inner-window gb-layout-tl p-3 w-full">
                        <div class="gb-layout-tl w-full gap-2">
                            <div class="gb-layout-tl-row gap-1">
                                <template v-for="section in strengthSections" :key="section.group">
                                    <auditor-audit-semaphore-btn @click="__selectedDiscount = section.group" class="text-[0.7em] font-bold" :selected="getSelectedDiscount?.group === section.group" :interactive="true" :color="section.worstColor" :name="section.name"></auditor-audit-semaphore-btn>
                                </template>
                            </div>
                            <div class="text-[0.7em] pl-2 pr-2">
                                {{getSelectedDiscount?.desc}}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </gb-popup>
</template>

<style scoped>
  .gb-ts-bar-bg {
    @apply text-white font-normal data-[selected="true"]:text-yellow data-[selected="true"]:font-bold;
  }
</style>
