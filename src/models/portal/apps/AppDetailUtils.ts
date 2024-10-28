import {
    AppStoreEnum,
    AppTypeEnum,
    IAppDetailHelper,
    IAppIcon,
    IAppImageSrc,
    IAppStore
} from "@/models/portal/apps/AppsData";
import JwtService from "@/core/services/JwtService";
import {UiUtils} from "@/utils/UiUtils";
import GembaseUtils from "@/utils/GembaseUtils";

export class AppDetailUtils {

    static getInstallsName(appStore: IAppStore): "Owners" | "Installs" {
        if (appStore.store === AppStoreEnum.STEAM) {
            return "Owners";
        }
        return "Installs";
    }

    static getTitle(appDetail: IAppDetailHelper | undefined): string {
        if (appDetail === undefined) {
            return "";
        }
        if (appDetail.app_type === AppTypeEnum.CONCEPT) {
            return `${appDetail.title} (concept #${appDetail.concept_counter})`;
        }
        return appDetail.title;
    }

    static getConceptIcon(): string {
        return "/static/media/gembase/concept.jpg";
    }

    static getIcon(appIcon: IAppIcon | undefined | null): string {
        if (appIcon?.icon === "[LOCAL_ICON_URL]") {
            if (appIcon.app_id !== undefined) {
                const tokenSuffix = `?token=${JwtService.getToken()}`;
                const rndSuffix = appIcon.rnd !== undefined ? `&rnd=${appIcon.rnd}` : "";
                const url = `${GembaseUtils.getApiUrl()}/app_icon/${appIcon.app_id}${tokenSuffix}${rndSuffix}`;
                return url;
            }
        } else if (appIcon?.icon !== undefined && appIcon?.icon !== "") {
            return appIcon.icon;
        }

        return AppDetailUtils.getConceptIcon();
    }

    static getAppImageSrc(appImageSrc: IAppImageSrc | undefined) {
        if (appImageSrc === undefined) {
            return "";
        } else if (appImageSrc.store_url !== undefined) {
            return appImageSrc.store_url;
        } else if (appImageSrc.dms_guid !== undefined) {
            return import.meta.env.VITE_APP_API_URL + '/dms/' + appImageSrc.dms_guid + '?token=' + JwtService.getToken();
        } else {
            return "/static/media/gembase/wip.png";
        }
    }

    static getAppStoreIcon(appStore: IAppStore | undefined): string | null {
        if (appStore === undefined) {
            return null;
        }

        if (appStore.app_type === AppTypeEnum.CONCEPT) {
            return UiUtils.getIcon("home");
        }
        else {
            if (appStore.store === AppStoreEnum.GOOGLE_PLAY) {
                return "/static/media/gembase/ui/devices/mobile_phone.svg";
            }
            else if (appStore.store === AppStoreEnum.STEAM) {
                return "/static/media/gembase/ui/devices/gamepad.svg";
            }
        }

        return null;
    }

    static getAppStoreUrl(appStore: IAppStore | undefined): string {
        if (appStore === undefined) {
            return "";
        }
        return appStore.app_store_url;
    }
}
