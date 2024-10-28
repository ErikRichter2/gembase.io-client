import {Ref, ref} from "vue";
import {
    IAudienceAnglesInputOptions,
    ICompetitorsInputDataOptions
} from "@/models/portal/calc/PlatformCalcData";
import {TTagId} from "@/models/portal/apps/AppsData";
import {usePlatformCalcStore} from "@/models/portal/calc/PlatformCalcStore";
import GembaseUtils from "@/utils/GembaseUtils";
import {PlatformValuesHelper} from "@/models/portal/competitor/PlatformValuesHelper";
import {AuditorTunerHistory, AuditorTunerHistoryItem} from "@/models/portal/auditor/tuner/AuditorTunerData";
import {PlatformCalcRequestToken} from "@/models/portal/calc/PlatformCalcRequestToken";

export const useAuditorTuner = () => {

    const tunerHistory: Ref<AuditorTunerHistory> = ref<AuditorTunerHistory>({
        items: []
    });

    const tunerIndex: Ref<number> = ref(0);

    const __calcForTunerRequestToken = new PlatformCalcRequestToken();

    const calc = (
        serviceContext: string,
        calcInput: ICompetitorsInputDataOptions & IAudienceAnglesInputOptions,
        tagId: TTagId | undefined = undefined
    ) => {
        __calcForTunerRequestToken.recreate();

        const tunerItem: AuditorTunerHistoryItem = {
            tags: calcInput.tag_details ?? [],
            tagId: tagId,
            calcRequestGuid: __calcForTunerRequestToken.guid
        }

        tunerHistory.value.items.push(tunerItem);
        tunerIndex.value = tunerHistory.value.items.length - 1;

        usePlatformCalcStore().competitors({
            context: serviceContext,
            requestToken: __calcForTunerRequestToken,
            input: calcInput,
            responseCallback: {
                done: callbackData => {
                    if (callbackData.response.payload?.result_data === undefined) {
                        return;
                    }
                    const tunerItem = tunerHistory.value.items.find(
                        (x) => x.calcRequestGuid === __calcForTunerRequestToken.guid
                    );
                    if (tunerItem !== undefined) {
                        tunerItem.competitors = callbackData.response.payload.result_data;
                        __refreshTunerDiffs(tunerIndex.value);
                    }
                }
            }
        });
    }

    const reset = (fromIndex = 0) => {
        fromIndex += 1;

        if (tunerIndex.value > fromIndex) {
            tunerIndex.value = fromIndex;
        }
        if (tunerIndex.value < tunerHistory.value.items.length - 1) {
            tunerHistory.value.items = tunerHistory.value.items.slice(0, fromIndex);
        }
    }

    const setHistoryIndex = (index: number) => {
        tunerIndex.value = index;
        __refreshTunerDiffs(index);
    }

    function __refreshTunerDiffs(currentIndex: number) {
        function calcRatio(v1: number, v2: number) {
            let res = 0;
            if (v2 > v1) {
                res = -(Math.round(v2 / v1));
            } else if (v2 < v1) {
                res = Math.round(v1 / v2);
            }
            return res;
        }

        tunerHistory.value.items.forEach((x) => {
            x.ts = PlatformValuesHelper.competitorsTsValueFromResponse(x.competitors);
        });

        for (let i = 0; i < tunerHistory.value.items.length; ++i) {
            if (i > 0) {
                const a1 = tunerHistory.value.items[i].competitors?.audience_detail?.audience_stats;
                const a2 = tunerHistory.value.items[i - 1].competitors?.audience_detail?.audience_stats;
                if (a1 !== undefined && a2 !== undefined) {
                    const diffAudience = a1.total_audience - a2.total_audience;
                    const diffAudienceRatio = calcRatio(a1.total_audience, a2.total_audience);
                    tunerHistory.value.items[i].diff_audience = diffAudienceRatio;

                    const formatted = GembaseUtils.formatNumber(Math.abs(diffAudience));
                    if (diffAudience < 0) {
                        tunerHistory.value.items[i].audienceTitle = `Audience reduced by ${formatted}`;
                    } else if (diffAudience > 0) {
                        tunerHistory.value.items[i].audienceTitle = `Audience increased by ${formatted}`;
                    } else {
                        tunerHistory.value.items[i].audienceTitle = `Audience without change`;
                    }
                }
                const c1 = tunerHistory.value.items[i].competitors;
                const c2 = tunerHistory.value.items[i - 1].competitors;
                if (c1 !== undefined && c2 !== undefined) {
                    const ts1 = tunerHistory.value.items[i].ts ?? 0;
                    const ts2 = tunerHistory.value.items[i - 1].ts ?? 0;

                    const diffTs = ts1 - ts2;
                    tunerHistory.value.items[i].diff_ts = diffTs;
                    if (diffTs < 0) {
                        tunerHistory.value.items[i].tsTitle = `Threat score reduced by ${diffTs}%`;
                    } else if (diffTs > 0) {
                        tunerHistory.value.items[i].tsTitle = `Threat score increased by ${diffTs}%`;
                    } else {
                        tunerHistory.value.items[i].tsTitle = `Threat score without change`;
                    }
                }
            }
        }

        if (currentIndex > 0 && tunerHistory.value.items.length > 0) {
            const c0 = tunerHistory.value.items[0].competitors;
            const ci = tunerHistory.value.items[currentIndex].competitors;
            const a0 = c0?.audience_detail?.audience_stats;
            const ai = ci?.audience_detail?.audience_stats;
            if (c0 !== undefined && ci !== undefined) {
                if (a0 !== undefined && ai !== undefined) {
                    const audienceTotalRaw = ai.total_audience - a0.total_audience;
                    tunerHistory.value.audienceDiff = calcRatio(ai.total_audience, a0.total_audience);
                    const formatted = GembaseUtils.formatNumber(Math.abs(audienceTotalRaw));
                    if (audienceTotalRaw < 0) {
                        tunerHistory.value.audienceTitle = `Audience reduced by ${formatted}`;
                    } else if (audienceTotalRaw > 0) {
                        tunerHistory.value.audienceTitle = `Audience increased by ${formatted}`;
                    } else {
                        tunerHistory.value.audienceTitle = `Audience without change`;
                    }
                }
                const ts0 = tunerHistory.value.items[0].ts ?? 0;
                const tsi = tunerHistory.value.items[currentIndex].ts ?? 0;
                tunerHistory.value.tsDiff = tsi - ts0;
                if (tunerHistory.value.tsDiff < 0) {
                    tunerHistory.value.tsTitle = `Threat score reduced by ${tunerHistory.value.tsDiff}%`;
                } else if (tunerHistory.value.tsDiff > 0) {
                    tunerHistory.value.tsTitle = `Threat score increased by ${tunerHistory.value.tsDiff}%`;
                } else {
                    tunerHistory.value.tsTitle = `Threat score without change`;
                }
            }
        }
    }
    return { calc, reset, setHistoryIndex, tunerIndex, tunerHistory }
}