export type TAppId = string;
export type TDeveloperId = string;
export type TTagId = string;

export declare type TRequestAppTagsChangesState = "pending" | "accepted" | "rejected";

export enum EDeveloperType {
    CONCEPT = "concept",
    STORE = "store"
}

export enum AppTypeEnum {
    STORE = "store",
    CONCEPT = "concept"
}

export enum AppStoreEnum {
    CONCEPT = 3,
    GOOGLE_PLAY = 1,
    STEAM = 2
}

export enum AppPlatformEnum {
    MOBILE = 1,
    PC = 2
}

export interface AppDetail extends IAppDetailHelper, IAppStore, IAppNodeTreeView, IAppLocked {
    app_id: TAppId;
    icon?: string;
    locked: boolean;
    app_type: AppTypeEnum;
    platform: AppPlatformEnum;
    icon_local?: string;
    gallery?: AppDetailGalleryImage[];
    app_id_in_store: string;
    description: string;
    tier: number;
    growth: number;
    dev_id?: TDeveloperId;
    dev_title?: string;
    dev_store_url?: string;
    scraped_t?: number | null;
    is_demo_app?: boolean;
    rnd?: string;
    released_year: number;
    tam: number;
    rating: number;
    installs: number;
    store_url?: string
    dms_guid?: string;
    title: string;
    concept_counter?: number;
    store: AppStoreEnum;
    app_store_url: string;
    tags: TagDetail[];
    tagging_state?: TaggingState;
    tagged_t?: number | null;
    tagged_by_user: number;
    removed_from_store?: number;
}

export interface TaggingState {
    app_id: TAppId;
    state: "not_tagged" | "done" | "queue" | "working" | "retry" | "error";
    progress?: number;
    request_t?: number;
    update_t?: number;
    tagged_t?: number;
    retry_countdown?: number;
    error_data?: string | null;
    users_tags_override_request?: {
        state: TRequestAppTagsChangesState;
    }
}

export interface DevDetail {
    dev_id: TDeveloperId;
    title: string;
    dev_id_in_store: string | null;
    dev_store_url?: string;
    store: number;
    type: EDeveloperType;
}

export interface IAppIcon {
    app_id?: TAppId;
    icon?: string;
    rnd?: string;
    locked: boolean;
    removed_from_store?: number;
}

export interface IAppImageSrc {
    store_url?: string
    dms_guid?: string;
}

export interface AppDetailGalleryImage extends IAppImageSrc {
    id: number;
    img_order: number;
}

export interface IAppDetailHelper extends IAppIcon {
    title: string;
    concept_counter?: number;
    app_type: AppTypeEnum;
}

export interface IAppStore {
    store: AppStoreEnum;
    app_store_url: string;
    app_type: AppTypeEnum;
}

export interface IAppNodeTreeView extends IAppIcon {
    title: string;
}

export interface IAppLocked {
    locked: boolean;
}

export interface ITagId {
    tag_id: TTagId;
}

export interface IAppStore {
    store: AppStoreEnum;
    app_store_url: string;
    app_type: AppTypeEnum;
}

export const appPlatforms: AppPlatformEnum[] = [AppPlatformEnum.MOBILE, AppPlatformEnum.PC];

export interface IAppIcon {
    app_id?: TAppId;
    icon?: string;
    rnd?: string;
    locked: boolean;
}

export interface TagDetail {
    tag_id: TTagId;
    tag_rank: number;
}

