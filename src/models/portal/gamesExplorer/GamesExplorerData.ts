import {
    IAppIcon,
    TAppId,
    TDeveloperId,
    TagDetail, AppTypeEnum
} from "@/models/portal/apps/AppsData";
import {
    GamesExplorerFilterData,
    GamesExplorerFilterInstance,
} from "@/models/portal/PortalDataTypes";

export enum GamesExplorerSelectedItemTypeEnum {
    APP,
    CONCEPT,
    OPPORTUNITY
}

export interface GamesExplorerSelectedItem {
    id: string;
    type: GamesExplorerSelectedItemTypeEnum;
}

export interface GamesExplorerCompareResponseAppData extends GamesExplorerFiltersResponseApp {
    installs: string;
    installs_raw: number;
    growth: string;
    growth_raw: number;
    rating: string;
    rating_raw: number;
    tam: string;
    tam_raw: number;
    novelty_raw: number;
    total_audience: string;
    total_audience_raw: number;
    tags: TagDetail[];
    released_year: string;
    scraped_t?: number | null;
    tagged_t: number | null | undefined;
    app_id: TAppId;
    revenue?: number;
}

export interface GamesExplorerFilterView {
    filter: GamesExplorerFilterInstance;
    apps: GamesExplorerFiltersResponseApp[];
}

export interface GamesExplorerFiltersResponseApp extends IAppIcon {
    item: GamesExplorerSelectedItem;
    title: string;
    store: number;
    dev_id?: TDeveloperId;
    dev_title?: string;
    app_id_in_store: string | undefined;
    app_type: AppTypeEnum;
}


export interface GamesExplorerQueryData {
    filters?: GamesExplorerFilterData[];
    selectedItems?: GamesExplorerSelectedItem[];
    initialSelectAllFilteredApps?: boolean;
}
