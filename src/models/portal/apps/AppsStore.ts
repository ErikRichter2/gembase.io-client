import { portalCommands, type IAppDetailInput } from '@/commands/portalCommands'
import ClientError from '@/errors/clientError'
import {
    type AppDetail,
    type DevDetail,
    type TAppId,
    type TDeveloperId,
} from '@/models/portal/apps/AppsData'
import { defineStore } from 'pinia'

export const useAppsStore = defineStore('appsStore', () => {
    const __appsDetails: Map<TAppId, AppDetail> = new Map<TAppId, AppDetail>()
    const __devsDetails: Map<TDeveloperId, DevDetail> = new Map<TDeveloperId, DevDetail>()

    function addAppDetail(appDetail: AppDetail | null) {
        if (appDetail === null) {
            return
        }
        if (hasAppDetail(appDetail.app_id)) {
            const currentAppDetail = getAppDetail(appDetail.app_id)
            if (appDetail.gallery === undefined && currentAppDetail?.gallery !== undefined) {
                appDetail.gallery = currentAppDetail.gallery
            }
        }
        __appsDetails.set(appDetail.app_id, appDetail)
    }

    function addDevDetail(devDetail: DevDetail | null) {
        if (devDetail === null) {
            return
        }
        __devsDetails.set(devDetail.dev_id, devDetail)
    }

    function hasAppDetail(appId: TAppId): boolean {
        return __appsDetails.has(appId)
    }

    function getAppDetail(appId: TAppId): AppDetail {
        const appDetail = __appsDetails.get(appId)
        if (appDetail === undefined) {
            throw new ClientError(`App ${appId} not found !`)
        }
        return appDetail
    }

    async function getAppDetailAsync(options: IAppDetailInput): Promise<AppDetail> {
        if (options.force !== true && hasAppDetail(options.app_id)) {
            const appDetail = getAppDetail(options.app_id)
            if (options.include_gallery !== true || appDetail.gallery !== undefined) {
                return appDetail
            }
        }

        const response = await portalCommands.getAppsDetails({ app_ids: [options.app_id] })
        if (response.state === 1) {
            if (response.app_details.length > 0) {
                addAppDetail(response.app_details[0])
                return response.app_details[0]
            }
        }

        throw new ClientError(`App ${options.app_id} not found`)
    }

    async function getDevsDetailsAsync(devsIds: TDeveloperId[]): Promise<DevDetail[]> {
        const res: DevDetail[] = []
        const needsUpdate: TDeveloperId[] = []

        devsIds.forEach((x) => {
            const devDetail = __devsDetails.get(x)
            if (devDetail !== undefined) {
                res.push(devDetail)
            } else {
                needsUpdate.push(x)
            }
        })

        if (needsUpdate.length > 0) {
            const response = await portalCommands.getDeveloperDetails({ dev_ids: needsUpdate })
            response.forEach((x) => {
                __devsDetails.set(x.dev_id, x)
                res.push(x)
            })
        }

        return res
    }

    return {
        getAppDetailAsync,
        getAppDetail,
        getDevsDetailsAsync,
        addDevDetail,
        addAppDetail,
        hasAppDetail,
    }
})
