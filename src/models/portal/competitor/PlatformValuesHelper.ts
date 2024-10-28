import GembaseUtils from "@/utils/GembaseUtils";
import {
    EDiscountGroup,
    ETsGroup,
    IPlatformCalcCompetitors,
    IPlatformCalcCompetitorsDiscount,
    IPlatformCalcCompetitorsTsGroup,
    TsColor
} from "@/models/portal/calc/PlatformCalcData";

export class PlatformValuesHelper {

    static discountValueName(discount: IPlatformCalcCompetitorsDiscount) {
        if (discount.gr === EDiscountGroup.Quality) {
            if (discount.c == TsColor.Red) {
                return "medium";
            }
            if (discount.c == TsColor.Green) {
                return "excellent";
            }
            return "high"
        }
        if (discount.gr === EDiscountGroup.Revenues) {
            if (discount.c == TsColor.Red) {
                return "moderate";
            }
            if (discount.c == TsColor.Green) {
                return "exceptional";
            }
            return "substantial"
        }
        return "";
    }

    static qualityFullText(quality: number | undefined) {
        if (quality === undefined) {
            return "medium"
        }
        if (quality < 6) {
            return "low";
        }
        if (quality > 8) {
            return "high";
        }
        return "medium";
    }

    static tsName(data: IPlatformCalcCompetitorsTsGroup) {
        if (data.gr === ETsGroup.Similar) {
            return `${data.ts_raw}% similar`;
        }

        return data.ts_name;
    }

    static tsGroupAltText(data: IPlatformCalcCompetitorsTsGroup) {
        switch (data.gr) {
            case ETsGroup.Size:
                return `${GembaseUtils.formatNumber(data.installs)} WW installs`;
            case ETsGroup.Growth:
                return `${GembaseUtils.formatNumber(data.growth)} WW installs / year`;
            case ETsGroup.Quality:
                return `${GembaseUtils.formatRating(data.rating)}`;
            case ETsGroup.Trend:
                return `Released ${data.released}`;
            case ETsGroup.TAM:
                return `$${GembaseUtils.formatNumber(data.tam)} TAM Revenues`;
            default:
                return undefined;
        }
    }

    static competitorsTsValueFromResponse(data: IPlatformCalcCompetitors | undefined) {
        if (data === undefined) {
            return 0;
        }

        const tsArr: number[] = [];
        data.ts_items?.forEach((x) => {
            tsArr.push(x.ts);
        });
        return PlatformValuesHelper.competitorsTsValue(tsArr);
    }

    static competitorsTsValue(values: number[]): number {
        if (values.length === 0) {
            return 0;
        }

        const avg = PlatformValuesHelper.competitorsTop3AvgValue(values);
        const m = GembaseUtils.median(values);

        // ROUND(MAX(1,AVERAGE(TOP3_TS))*(1+(LOG(COMPETITORS_COUNT)*LOG(MAX(1,MEDIAN(TOP_X_VISIBLE_TS))))/4))

        const res = Math.round(Math.max(1.0, avg)*(1+(Math.log10(values.length)*Math.log10(Math.max(1.0,m)))/4));
        return res;
    }

    static competitorsTop3AvgValue(values: number[]): number {
        values.sort((a, b) => b - a);

        let avg = 0;
        const cnt = Math.min(values.length, 3);

        if (cnt === 0) {
            return 0
        }

        for (let i = 0; i < cnt; ++i) {
            avg += values[i];
        }

        avg = avg / cnt;
        return avg;
    }
}