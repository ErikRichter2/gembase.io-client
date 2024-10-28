import {
    AppPlatformEnum,
    AppStoreEnum
} from "@/models/portal/apps/AppsData";
import {
    NODE_CATEGORY_AUDIENCE, NODE_CATEGORY_CONTENT, NODE_CATEGORY_MECHANICS,
} from "@/models/portal/PortalDataTypes";
import {UiUtils} from "@/utils/UiUtils";
import GembaseUtils from "@/utils/GembaseUtils";
import {math} from "@amcharts/amcharts5";

export default class PortalUtils {

    static formatHistoryDiffNumber(val: number | undefined) {
        if (val === undefined) {
            return "?";
        }
        const valStr = GembaseUtils.formatNumber(val);
        return `${val > 0 ? '+' : ''}${valStr}`;
    }

    static getTitle(title: string, module_locked: boolean | undefined) {
        if (module_locked) {
            return `${title} is not available in DEMO`;
        }
        return title;
    }

    static getPlatformIconPath(platform: AppPlatformEnum | undefined): string {
        if (platform === AppPlatformEnum.MOBILE) {
            return "/static/media/gembase/ui/devices/mobile_phone.svg";
        }
        else if (platform == AppPlatformEnum.PC) {
            return "/static/media/gembase/ui/devices/gamepad.svg";
        }

        return "";
    }

    static getIconForNodeCategory(category: string): string {
        if (category === NODE_CATEGORY_CONTENT) {
            return UiUtils.getIcon("content");
        } else if (category === NODE_CATEGORY_MECHANICS) {
            return UiUtils.getIcon("mechanics");
        } else if (category === NODE_CATEGORY_AUDIENCE) {
            return UiUtils.getIcon("tam_audience");
        }
        return "";
    }

    static getStoreIcon(store: AppStoreEnum): string {
        if (store === AppStoreEnum.GOOGLE_PLAY) {
            return "google_play_logo";
        } else if (store === AppStoreEnum.STEAM) {
            return "steam_logo";
        }

        return "";
    }

    static normalizeSubcategoryWeight(value: number): number {
        return math.round(value / 100) * 100;
    }
}