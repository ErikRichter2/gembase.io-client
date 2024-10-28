import AppConfig from "@/config/AppConfig";
import GembaseUtils from "@/utils/GembaseUtils";

export function initSmartsupp() {
    if (AppConfig.isProd) {
        GembaseUtils.loadScript("/static/scripts/smartsupp.js")
    }
}
