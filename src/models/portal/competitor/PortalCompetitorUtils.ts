import {
    TooltipDataV2,
} from "@/models/portal/competitor/PortalCompetitorData";
import {AppDetail, AppTypeEnum, TAppId, TTagId} from "@/models/portal/apps/AppsData";
import {usePortalStore} from "@/models/portal/PortalStore";
import {
    GamesExplorerSelectedItem,
    GamesExplorerSelectedItemTypeEnum
} from "@/models/portal/gamesExplorer/GamesExplorerData";
import {LocationQuery} from "vue-router";
import {useGamesExplorerStore} from "@/models/portal/gamesExplorer/GamesExplorerStore";
import {useAuthStore} from "@/models/auth/AuthStore";
import {useAppsStore} from "@/models/portal/apps/AppsStore";
import {
    IPlatformCalcAudienceAngleDetail,
    IPlatformCalcCompetitors, IPlatformCalcCompetitorsAppDetail
} from "@/models/portal/calc/PlatformCalcData";
import GembaseUtils from "@/utils/GembaseUtils";
import {AuditorQueryParams} from "@/models/portal/auditor/AuditorData";
import {useRouterStore} from "@/core/router/RouterStore";

export class PortalCompetitorUtils {

    static getNameForAudience(data: IPlatformCalcAudienceAngleDetail | undefined) {
        if (data === undefined) {
            return "";
        }

        const portalStore = usePortalStore();

        if (data.tag_ids.length === 1) {
            const def = portalStore.getPortalDefProductItem(data.tag_ids[0]);
            return def?.node;
        } else {
            const def1 = portalStore.getPortalDefProductItem(data.tag_ids[0]);
            const def2 = portalStore.getPortalDefProductItem(data.tag_ids[1]);

            if (def1?.subcategory === "Topics") {
                if (def1?.adj !== null && def1?.adj !== "") {
                    return `${def1?.adj} ${def2?.node}`;
                } else {
                    return `${def1?.node} ${def2?.node}`;
                }
            }

            if (def2?.subcategory === "Topics") {
                if (def2?.adj !== null && def2?.adj !== "") {
                    return `${def2?.adj} ${def1?.node}`;
                } else {
                    return `${def2?.node} ${def1?.node}`;
                }
            }

            if (def1?.adj !== null && def1?.adj !== "") {
                return `${def1?.adj} ${def2?.node}`;
            } else if (def2?.adj !== null && def2?.adj !== "") {
                return `${def2?.adj} ${def1?.node}`;
            } else {
                return `${def1?.node} ${def2?.node}`;
            }
        }
    }

    static getTooltipDataForTopAppsV2(
        options: {
            competitors: IPlatformCalcCompetitors,
            myAppTitle?: string,
            myAppId?: TAppId,
            singleAppCompetitor?: TAppId
        }
    ): TooltipDataV2
    {
        if (options.competitors.company_title === null) {
            options.competitors.company_title = useAuthStore().data.user.dev_detail.title;
        }

        let gamesExplorerItem: GamesExplorerSelectedItem | undefined = undefined;
        let myAppDetail: AppDetail | undefined = undefined;

        if (options.myAppId !== undefined) {

            gamesExplorerItem = {
                id: options.myAppId,
                type: GamesExplorerSelectedItemTypeEnum.APP
            }

            myAppDetail = useAppsStore().getAppDetail(options.myAppId);
            if (myAppDetail.app_type === AppTypeEnum.CONCEPT) {
                gamesExplorerItem.type = GamesExplorerSelectedItemTypeEnum.CONCEPT;
            }
        }

        return {
            competitors: options.competitors,
            appDetail: myAppDetail,
            appTags: [],
            singleAppCompetitor: options.singleAppCompetitor
        }
    }

    static generateGamesExplorerQuery(
        competitors: IPlatformCalcCompetitorsAppDetail[],
        audienceAngleData: IPlatformCalcAudienceAngleDetail,
        appDetail?: AppDetail
    ): LocationQuery | undefined {
        const tagsIds: TTagId[] = audienceAngleData !== undefined ? GembaseUtils.copy(audienceAngleData.tag_ids) : [];
        const items: GamesExplorerSelectedItem[] = [];

        const query: AuditorQueryParams = useRouterStore().currentRoute.value.query as AuditorQueryParams;

        if (appDetail?.app_id !== undefined) {
            items.push({
                type: appDetail.app_type === AppTypeEnum.CONCEPT ? GamesExplorerSelectedItemTypeEnum.CONCEPT : GamesExplorerSelectedItemTypeEnum.APP,
                id: appDetail.app_id
            });
        } else if (query.opportunity !== undefined) {
            items.push({
                type: GamesExplorerSelectedItemTypeEnum.OPPORTUNITY,
                id: query.opportunity
            });
        }

        competitors.forEach((x) => {
            if (!x.locked) {
                items.push({
                    type: GamesExplorerSelectedItemTypeEnum.APP,
                    id: x.app_id
                });
            }
        });

        return useGamesExplorerStore().generateUrlQuery({
            filters: [{
                dev_ids: [],
                tag_ids: tagsIds,
                stores: []
            }],
            selectedItems: items
        });
    }
}
