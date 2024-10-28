import {AppDetail, DevDetail, TAppId, TDeveloperId} from "@/models/portal/apps/AppsData";
import {defineStore} from "pinia";
import EndpointRequest from "@/core/requests/EndpointRequest";
import ClientError from "@/core/errors/ClientError";

const __appsDetails: Map<TAppId, AppDetail> = new Map<TAppId, AppDetail>();
const __devsDetails: Map<TDeveloperId, DevDetail> = new Map<TDeveloperId, DevDetail>();

export const useAppsStore = defineStore('appsStore', {
    state: () => ({
    }),
    actions: {
        addAppDetail(appDetail: AppDetail | null) {
            if (appDetail === null) {
                return;
            }
            if (this.hasAppDetail(appDetail.app_id)) {
                const currentAppDetail = this.getAppDetail(appDetail.app_id);
                if (appDetail.gallery === undefined && currentAppDetail?.gallery !== undefined) {
                    appDetail.gallery = currentAppDetail.gallery;
                }
            }
            __appsDetails.set(appDetail.app_id, appDetail);
        },
        addDevDetail(devDetail: DevDetail | null) {
            if (devDetail === null) {
                return;
            }
            __devsDetails.set(devDetail.dev_id, devDetail);
        },
        hasAppDetail(appId: TAppId): boolean {
            return __appsDetails.has(appId);
        },
        getAppDetail(appId: TAppId): AppDetail {
            const appDetail = __appsDetails.get(appId);
            if (appDetail === undefined) {
                throw new ClientError(`App ${appId} not found !`)
            }
            return appDetail;
        },
        async getAppDetailAsync(options: {
            appId: TAppId,
            includeGallery?: boolean,
            force?: boolean
        }): Promise<AppDetail> {

            if (options.force !== true && this.hasAppDetail(options.appId)) {
                const appDetail = this.getAppDetail(options.appId);
                if (options.includeGallery !== true || appDetail.gallery !== undefined) {
                    return appDetail;
                }
            }

            const response = await EndpointRequest.process2<{
                state: number,
                app_details: AppDetail[]
            }>("portal:get_app_details", {
                app_id: options.appId,
                include_gallery: options.includeGallery
            });

            if (response.state === 1) {
                this.addAppDetail(response.app_details[0]);
                return response.app_details[0];
            }

            throw new ClientError(`App ${options.appId} not found`);
        },
        async getDevsDetailsAsync(devsIds: TDeveloperId[]): Promise<DevDetail[]> {
            const res: DevDetail[] = [];
            const needsUpdate: TDeveloperId[] = [];

            devsIds.forEach((x) => {
                const devDetail = __devsDetails.get(x);
                if (devDetail !== undefined) {
                    res.push(devDetail);
                } else {
                    needsUpdate.push(x);
                }
            });

            if (needsUpdate.length > 0) {

                const response = await EndpointRequest.process2<DevDetail[]>("portal:get_developers_details", {
                    dev_ids: needsUpdate
                });

                response.forEach((x) => {
                    __devsDetails.set(x.dev_id, x);
                    res.push(x);
                });
            }

            return res;
        },
    },
    getters: {
    }
});
