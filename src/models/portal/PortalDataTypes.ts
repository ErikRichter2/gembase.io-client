import {IPlatformProductNode, TagsViewTagData} from "@/models/portal/platformProduct/PlatformProductData";
import {IEndpointResponse} from "@/core/requests/EndpointRequest";
import {GamesExplorerSelectedItem} from "@/models/portal/gamesExplorer/GamesExplorerData";
import {
    AdvancedFilterData,
} from "@/models/portal/competitor/PortalCompetitorData";
import {EBillingModuleId} from "@/models/portal/PortalConstants";
import {TutorialData} from "@/models/portal/tutorial/TutorialStore";
import {
    AppDetailGalleryImage, DevDetail,
    IAppDetailHelper, IAppIcon,
    IAppLocked, IAppStore,
    TagDetail,
    TAppId,
    TDeveloperId, TTagId
} from "@/models/portal/apps/AppsData";
import {
    IPlatformCalcAffinity,
    IPlatformCalcCompetitorsAppDetail,
    IPlatformCalcCompetitorsTs,
    IPlatformCalcCompetitorsTsGroup,
} from "@/models/portal/calc/PlatformCalcData";
import {RangeSliderData} from "@/models/ui/RangeSliderData";
import {SliderData} from "@/models/ui/SliderData";


export interface DeveloperHint {
    dev_id_in_store: string;
    store: number;
    title: string;
}

export interface AppDetailChanges {
    icon?: string;
    title?: string;
    description?: string;
    removed_images?: number[];
    wasChange?: boolean;
    tags?: TagDetail[];
}

export interface AppGalleryChanges {
    added_images: {
        id: number;
        file: File;
    }[];
    gallery: AppDetailGalleryImage[];
    wasChange?: boolean;
}

export interface StoreAppSearch extends IAppDetailHelper {
    app_id?: TAppId;
    store: number;
    app_id_in_store: string;
}

export interface IAppNodeTreeView extends IAppIcon {
    title: string;
}

export interface IAppStoreButton extends IAppStore, IAppLocked {}

export interface PromptDef {
    initialized: boolean,
    data: PromptDefData[]
}

export interface PromptDefData {
    name: string,
    categories: PromptDefCategory[]
}

export interface PromptDefCategory {
    name: string,
    tags: {
        id: TTagId,
        name: string,
        examples: string
    }[]
}

export interface PortalCommandResponse extends IEndpointResponse {
    credits?: number;
}

export const CHART_TEMPLATE_BEHAVIORS = "behaviors";

export interface PlayerExplorerChart {
    id: string;
    group?: string;
    template?: string;
    locked: boolean;
    name: string;
    goal_value?: number;
    data: PlayerExplorerChartItemData[];
    chart_min?: number;
    chart_max?: number;
    chart_extra?: number;
    avg?: number[];
    median?: number[];
}

export interface PlayerExplorerChartItemData {
    id: string;
    name: string;
    values: number[];
    category: string;
    desc: string;
    locked?: boolean;
    qmin?: number;
    q25?: number;
    q50?: number;
    q75?: number;
    qmax?: number;
    feature_pool_id?: string;
}

export interface PlayerExplorerFilterView {
    data: PlayerExplorerFilter;
}

export interface PlayerExplorerFilter {
    id: string;
    age?: RangeSliderData;
    females?: SliderData;
    spending?: {
        active: string[],
        items: PlayerExplorerFilterSpendingGroup[]
    };
    surveys?: PlayerExplorerSelectFilter;
    loved?: {
        tag_ids: TTagId[]
    },
    not_hated?: {
        tag_ids: TTagId[]
    }
}

export interface PlayerExplorerFilterSpendingGroup {
    id: string;
    label: string;
    from: number;
    to: number;
}

export interface PlayerExplorerSelectFilter {
    items: {
        gr?: string,
        opt: {
            id: string,
            label: string
        }[]
    }[];
    active: string;
}

export interface PlayerExplorerSliderFilter {
    min: number;
    max: number;
    value: number;
}

export class PlayerExplorerStatsItem {
    full_rows = 0;
    filtered_rows = 0;
    full_females = 0;
    filtered_females = 0;
    filtered_age: number[] = [];
    full_age: number[] = [];
}

export interface PlayerExplorerCheckboxGroupFilter {
    items: {
        id: string,
        label:string
    }[];
    active: string[];
}

export interface GamesExplorerFilterInstance extends GamesExplorerFilterData {
    id: string;
}

export interface GamesExplorerPriceFilterDef {
    tier: number;
    from: number;
    to: number;
    label: string;
}

export interface GamesExplorerFilterDef {
    prices: RangeSliderData;
    stores: {
        id: number,
        label: string
    }[];
    tier: RangeSliderData;
}

export interface GamesExplorerFilterData {
    tag_ids: TTagId[];
    dev_ids: TDeveloperId[];
    prices?: RangeSliderData;
    stores: number[];
    tier?: RangeSliderData;
    my_apps?: boolean;
    advanced_filter_data?: AdvancedFilterData;
}

export interface GamesExplorerCompareViewData {
    header: string;
    locked?: boolean;
    rows: {
        title: string;
        tooltip?: string;
        values?: GamesExplorerCompareViewDataValue[];
        locked?: number;
    }[];
}

export interface GamesExplorerCompareViewDataValue {
    b?: boolean;
    s?: string;
    l?: boolean; // loading
    tagsViewTagData?: TagsViewTagData;
    tagDetail?: TagDetail[];
    tagId?: TTagId;
    item?: GamesExplorerSelectedItem;
    canChange?: boolean;
    calcItem?: IPlatformCalcAffinity;
    tagDef?: IPlatformProductNode;
    title?: string;
    click?: (item: GamesExplorerCompareViewDataValue) => void;
}

export interface UserPositionDef {
    id: number;
    position: string;
    position_area: number;
    position_role: number;
}

export interface UserRoleDef {
    id: number;
    name: string;
}

export interface AllowedTagsPerLockedModuleDef {
    tag_id: TTagId;
    module_id: EBillingModuleId;
    is_set: number;
    is_loved: number;
    is_changeable: number;
}

export interface UiTam {
    tam: number;
    loved: number;
    max: number;
}

export const NODE_CATEGORY_CONTENT = "Content";
export const NODE_CATEGORY_MECHANICS = "Mechanics";
export const NODE_CATEGORY_AUDIENCE = "Audience";
export const TAG_RANK_PRIMARY = 1;
export const TAG_RANK_SECONDARY = 2;
export const TAG_RANK_TERTIARY = 3;
export const TAG_RANK_NONE = 0;

export const TAG_SUBCATEGORY_GENRE = 'Genre';

export interface ITutorialResponse {
    tutorial: TutorialData,
    app_id: TAppId,
    gaps: {
        tag_ids: TTagId[]
    }
}

export interface TsParamsDef {
    param: string;
    v3: number;
    name: string;
}

export interface ICompetitorAppDetailTs {
    appDetail: IPlatformCalcCompetitorsAppDetail,
    ts: IPlatformCalcCompetitorsTs,
    gr?: IPlatformCalcCompetitorsTsGroup
}

export interface ITooltipThreatScoreData {
    gr: string;
    name: string;
    worstColor: string;
    colors: ITooltipThreatScoreColorData[];
}

export interface ITooltipThreatScoreColorData {
    gr: string;
    color: string;
    width: number;
    competitors: ICompetitorAppDetailTs[];
}

export interface DevDetailFilter {
    devId: TDeveloperId;
    devDetail?: DevDetail;
}

export interface DevDetailsFilter {
    filterId: string;
    devDetails: DevDetailFilter[];
}

export interface ITsGroupLogSimilarity {
    competitor?: IPlatformCalcCompetitorsAppDetail,
    data: {
        same_tags: {
            tag_ids: TTagId[]
        },
        only_my_tags: {
            tag_ids: TTagId[]
        },
        only_c_tags: {
            tag_ids: TTagId[]
        },
        c_w: {
            tag_id: TTagId,
            w: number
        }[],
        survey_w: {
            tag_id: TTagId,
            w: number
        }[],
        ts_sim_w: {
            tag_id: TTagId,
            w: number
        }[]
    }
}

export interface InteractiveSpiderChartItem {
    id: number;
    label: string;
    value: number;
}

export interface InteractiveSpiderChart {
    min: number;
    max: number;
    items: InteractiveSpiderChartItem[];
}
