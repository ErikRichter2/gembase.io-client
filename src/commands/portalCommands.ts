import type {
    AppDetail,
    DevDetail,
    TaggingState,
    TAppId,
    TDeveloperId,
    TTagId,
} from '@/models/portal/apps/AppsData'
import { BaseCommands } from './base/baseCommands'
import type {
    AllowedTagsPerLockedModuleDef,
    AppDetailChanges,
    DeveloperHint,
    GamesExplorerFilterInstance,
    GamesExplorerPriceFilterDef,
    ITutorialResponse,
    PlayerExplorerChart,
    PlayerExplorerFilter,
    PlayerExplorerStatsItem,
    StoreAppSearch,
    TsParamsDef,
    UserPositionDef,
    UserRoleDef,
} from '@/models/portal/PortalDataTypes'
import type {
    GamesExplorerCompareResponseAppData,
    GamesExplorerFiltersResponseApp,
} from '@/models/portal/gamesExplorer/GamesExplorerData'
import type { TaggingContext } from '@/models/portal/tags/TaggingStore'
import type { PlatformProductDefData } from '@/models/portal/platformProduct/PlatformProductData'
import type {
    UserPositionAreaDef,
    UserPositionRoleDef,
} from '@/models/portal/definitions/DefinitionsData'
import type { InstallTier, SearchWeight } from '@/models/portal/competitor/PortalCompetitorData'
import type { IPlatformCalcAffinity } from '@/models/portal/calc/PlatformCalcData'

interface IPotentialDownloads {
    geo: { id: 'na' | 'eu' | 'latam' | 'mena' | 'apac'; ratio: number }[]
    platform: { id: 'mobile' | 'pc' | 'console'; absolute: number }[]
}

export interface IInitialData {
    state: string
    app_details: AppDetail[]
    credits: number
    unlocked_modules: number[]
    def: {
        product_nodes: PlatformProductDefData[]
        user_roles: UserRoleDef[]
        user_positions: UserPositionDef[]
        user_position_role: UserPositionRoleDef[]
        user_position_area: UserPositionAreaDef[]
        allowed_tags_per_locked_module: AllowedTagsPerLockedModuleDef[]
        advanced_filter_weights: SearchWeight[]
        install_tiers: InstallTier[]
        ts_params: TsParamsDef[]
        potential_downloads: IPotentialDownloads
    }
    tutorial: ITutorialResponse
}

export interface IGetGamesExplorerFiltersDefInput {
    prices: GamesExplorerPriceFilterDef[]
    stores: {
        id: number
        label: string
    }[]
}

export interface IGetGamesExplorerFilterAppsInput {
    state: string
    data: {
        id: string
        apps: GamesExplorerFiltersResponseApp[]
    }[]
}

export interface IGetPlayerExplorerDataInput {
    filters: PlayerExplorerFilter[]
    token: string
    show: string | undefined
}

export interface IGetPlayerExplorerDataResponse {
    charts: PlayerExplorerChart[][]
    filters: PlayerExplorerFilter[]
    stats: PlayerExplorerStatsItem[]
    show: string | undefined
}

export interface ITagStoreAppIfNotTaggedInput {
    app_id: TAppId
    tagging_context: TaggingContext
    admin_force: boolean
}

export interface ITagConceptAppInput {
    app_id: TAppId
    tagging_context: TaggingContext
}

export interface IGetDevelopersHintsInput {
    title: string
    include_concepts?: boolean
}

export interface ISetMyDeveloperInput {
    dev_id_in_store: string
    store: number
}

export interface IKpiData {
    t: number
    v: number
}

export interface IKpiDataPerApp {
    app_id: TAppId
    t: number
    v: number
}

export interface ISaveTagsFromGamesExplorerInput {
    app_id: TAppId
    tag_id: TTagId
    tag_rank: number
    b: boolean
}

export interface IAppDetailInput {
    app_id: TAppId
    include_gallery?: boolean
    force?: boolean
}

class PortalCommands extends BaseCommands {
    constructor() {
        super('/commands/portal')
    }

    getDeveloperDetails = (params: { dev_ids: TDeveloperId[] }) =>
        this.runCommand<DevDetail[]>('portal:get_developers_details', params)

    getGamesExplorerFiltersDef = () =>
        this.runCommand<IGetGamesExplorerFiltersDefInput>('portal:get_games_explorer_filters_def')

    getGamesExplorerFilterApps = (params: { filters: GamesExplorerFilterInstance[] }) =>
        this.runCommand<IGetGamesExplorerFilterAppsInput>(
            'portal:get_games_explorer_filter_apps',
            params,
        )

    getGamesExplorerCompareAppsData = (params: { app_ids: TAppId[] }) =>
        this.runCommand<GamesExplorerCompareResponseAppData[]>(
            'portal:get_games_explorer_compare_apps_data',
            params,
        )

    getPlayerExplorerData = (params: IGetPlayerExplorerDataInput) =>
        this.runCommand<IGetPlayerExplorerDataResponse>('portal:get_player_explorer_data', params)

    getTaggingState = (params: { app_id: TAppId }) =>
        this.runCommand<TaggingState>('portal:get_tagging_state', params)

    tagStoreAppIfNotTagged = (params: ITagStoreAppIfNotTaggedInput) =>
        this.runCommand<TaggingState>('portal:tag_store_app_if_not_tagged', params)

    tagConceptApp = (params: ITagConceptAppInput) =>
        this.runCommand<TaggingState>('portal:tag_concept_app', params)

    resetTutorial = () => this.runCommand<TaggingState>('portal:reset_tutorial')

    getDevelopersHints = (params: IGetDevelopersHintsInput) =>
        this.runCommand<DeveloperHint[]>('admin:get_developers_hints', params)

    setMyDeveloper = (params: ISetMyDeveloperInput) =>
        this.runCommand('admin:set_my_developer', params)

    getAppHistoryKpis = (params: { app_id: TAppId; kpi: string; interval: string }) =>
        this.runCommand<IKpiData[]>('portal:get_app_history_kpis', params)

    saveTagsFromGamesExplorer = (params: ISaveTagsFromGamesExplorerInput[]) =>
        this.runCommand('admin:save_tags_from_games_explorer', params)

    getGamesExplorerKpiHistData = (params: { app_ids: TAppId[]; kpi: string; interval: string }) =>
        this.runCommand<IKpiDataPerApp[]>('portal:get_games_explorer_kpi_hist_data', params)

    searchGooglePlayApps = (params: { app_title: string; search_in_concepts?: boolean }) =>
        this.runCommand<StoreAppSearch[]>('portal:search_google_play_apps', params)

    getInitialData = () => this.runCommand<IInitialData>('portal:get_initial_data')

    addAppFromStoreToMyApps = (params: { app_id_in_store: string; store: number }) =>
        this.runCommand<AppDetail>('portal:add_app_from_store_to_my_apps', params)

    removeAppFromMyApps = (params: { app_id: TAppId }) =>
        this.runCommand<AppDetail>('portal:remove_app_from_my_apps', params)

    scrapApp = (params: { app_id_in_store: string; store: number }) =>
        this.runCommand<AppDetail>('portal:scrap_app', params)

    scrapDev = (params: { dev_id_in_store: string; store: number }) =>
        this.runCommand<{
            state: string
            dev_detail: DevDetail
        }>('portal:scrap_dev', params)

    getAppsDetails = (params: { app_ids: TAppId[] }) =>
        this.runCommand<{
            state: number
            app_details: AppDetail[]
        }>('portal:get_apps_details', params)

    getOpportunityDetail = (params: { uuid: string }) =>
        this.runCommand<IPlatformCalcAffinity | undefined>('portal:get_opportunity_detail', params)

    createConceptAsCopy = (params: { app_id: TAppId }) =>
        this.runCommand<AppDetail>('portal:create_concept_as_copy', params)

    createConceptAppFromTemp = (params: { app_detail_changes?: AppDetailChanges }) =>
        this.runCommand<AppDetail>('portal:create_concept_app_from_temp', params)

    updateUser = (params: { name: string; position_role: number; position_area: number }) =>
        this.runCommand('portal:update_user', params)

    saveConceptApp = (
        files: File[],
        params: { app_id: TAppId; app_detail_changes?: AppDetailChanges },
    ) => this.runCommandWithFiles<AppDetail>('portal:save_concept_app', files, params)

    saveConceptAppIcon = (
        files: File[],
        params: { app_id: TAppId; app_detail_changes?: AppDetailChanges },
    ) => this.runCommandWithFiles<AppDetail>('portal:save_concept_app_icon', files, params)
}

export const portalCommands = new PortalCommands()
