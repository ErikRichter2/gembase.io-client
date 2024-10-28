import {RoutesEnum} from "@/router/RoutesEnum";
import {LocationQueryRaw} from "vue-router";
import ClientError from "@/core/errors/ClientError";

export declare type TBillingId = string;

export enum EModuleId {
    AUDITOR = 1,
    TUNER = 2,
    GAPS = 3,
    GAMES_EXPLORER = 4,
    PLAYERS_EXPLORER = 5,
    LENSES = 6,
    STUDIES = 7,
    CREATOR = 8
}

export enum EBillingModuleId {
    AUDIT = 1,
    INSIGHTS = 2,
    IDEAS = 3
}

export interface PortalModuleDef {
    id: EModuleId;
    desc: string;
    label: string;
    shortDesc: string;
    icon: string;
    route?: string;
    query?: LocationQueryRaw;
    hidden?: boolean;
    concepting?: boolean;
    liveops?: boolean;
    callToAction: string;
    wip?: boolean;
    iconScale?: number;
}

export interface IBillingModule {
    id: EBillingModuleId;
    icon: string;
    title: string;
    desc: string;
    homePageDesc?: string;
    modules: EModuleId[];
    iconScale?: number;
}

export class PortalConstants {

    public static FULL_ACCESS_PRICE = "3,250";

    public static CHAR_ELLIPSIS = "…";

    public static ICON_AUDITOR = "auditor";
    public static ICON_TUNER = "potential";
    public static ICON_GAPS = "market_gaps";
    public static ICON_GAMES = "games";
    public static ICON_PLAYERS = "tam_audience";
    public static ICON_STUDIES = "test_concepts";
    public static ICON_LENSES = "earth-globe";
    public static ICON_CREATOR = "creator";
    public static ICON_DOLLAR = "currency_dollar";
    public static ICON_EURO = "currency_euro";
    public static ICON_NEXT = "next";
    public static ICON_CHECK_SINGLE = "check_single";
    public static ICON_CHAT = "message_us";
    public static ICON_EMAIL = "email";
    public static ICON_FILE = "file";
    public static ICON_RED_CARPET = "red-carpet";
    public static ICON_RECEIPT = "receipt";
    public static ICON_UPGRADE_TO_PREMIUM = PortalConstants.ICON_RED_CARPET;
    public static ICON_CARD_RELOAD = 'flip_card';
    public static ICON_LICENCE = 'free_access';
    public static ICON_THREAT_SCORE = "threat_score";
    public static ICON_COMPETITORS = "competitors";
    public static ICON_SIMILARITY = "transparency";
    public static ICON_INSTALLS = "download";
    public static ICON_TAM = "overlapping";

    public static MAIL_CONTACT = "contact@gembase.io"

    public static modules: PortalModuleDef[] = [
        {
            id: EModuleId.AUDITOR,
            desc: "Explore market sizes, competitors and audiences of any game or a concept",
            label: "Auditor",
            icon: PortalConstants.ICON_AUDITOR,
            route: RoutesEnum.PORTAL_MY_APPS,
            shortDesc: "Audit game’s potential",
            concepting: true,
            liveops: true,
            callToAction: "Show me game's potential"
        },
        {
            id: EModuleId.TUNER,
            desc: "Change attributes of your game to boost demand and reduce competition",
            label: "Tuner",
            icon: PortalConstants.ICON_TUNER,
            route: RoutesEnum.PORTAL_MY_APPS,
            query: {"audit": "1"},
            shortDesc: "Boost game's potential",
            concepting: true,
            liveops: true,
            callToAction: "Show me a potential boost"
        },
        {
            id: EModuleId.GAPS,
            desc: "Uncover concepts and attribute combinations missing in the market",
            label: "Gaps",
            icon: PortalConstants.ICON_GAPS,
            route: RoutesEnum.PORTAL_GAPS,
            shortDesc: "Discover opportunities",
            concepting: true,
            callToAction: "Show me an opportunity",
            iconScale: 1.5
        },
        {
            id: EModuleId.GAMES_EXPLORER,
            desc: "Compare attributes of various competitive games",
            label: "Games",
            icon: PortalConstants.ICON_GAMES,
            route: RoutesEnum.PORTAL_GAMES,
            shortDesc: "Understand competitors",
            concepting: true,
            liveops: true,
            callToAction: "Show me competitive insights"
        },
        {
            id: EModuleId.PLAYERS_EXPLORER,
            desc: "Understand which attributes are relevant for various consumer segments",
            label: "Players",
            icon: PortalConstants.ICON_PLAYERS,
            route: RoutesEnum.PLAYERS,
            shortDesc: "Understand consumers",
            concepting: true,
            liveops: true,
            callToAction: "Show me audience insights"
        },
        {
            id: EModuleId.STUDIES,
            desc: "Validate market potential of hundreds of ideas with real players",
            label: "Studies",
            icon: PortalConstants.ICON_STUDIES,
            route: RoutesEnum.PORTAL_STUDIES,
            shortDesc: "Test ideas at scale",
            concepting: true,
            callToAction: "Show me a test of ideas",
            iconScale: 1.4
        },
        {
            id: EModuleId.LENSES,
            desc: "Design your mechanics to satisfy players’ needs",
            label: "Lenses",
            icon: PortalConstants.ICON_LENSES,
            route: RoutesEnum.PORTAL_LENSES,
            shortDesc: "Guide game design",
            concepting: true,
            liveops: true,
            callToAction: "Show me design directions",
            wip: true
        },
        {
            id: EModuleId.CREATOR,
            desc: "Generate market driven visuals for UA creatives or game concepts",
            label: "Creator",
            icon: PortalConstants.ICON_CREATOR,
            route: RoutesEnum.PORTAL_CREATOR,
            hidden: true,
            shortDesc: "Generate tailored creatives",
            concepting: true,
            liveops: true,
            callToAction: "Show me tailored creatives",
            wip: true
        }
    ];

    public static billingModules: IBillingModule[] = [
        {
            id: EBillingModuleId.AUDIT,
            icon: PortalConstants.ICON_AUDITOR,
            title: "Auditor",
            desc: "Boost demand for your game while avoiding competition",
            homePageDesc: "Explore market sizes, competitors and audiences of any game or a concept. Change attributes of your game to boost demand and reduce competition.",
            modules: [EModuleId.AUDITOR, EModuleId.TUNER]
        },
        {
            id: EBillingModuleId.INSIGHTS,
            icon: "my_apps",
            title: "Insights",
            desc: "Understand various players and games in detail",
            homePageDesc: "Compare attributes of various competitive games. Understand which attributes are relevant for various consumer segments.",
            modules: [EModuleId.GAMES_EXPLORER, EModuleId.PLAYERS_EXPLORER],
            iconScale: 1.2
        },
        {
            id: EBillingModuleId.IDEAS,
            icon: "generate_pool",
            title: "Ideas",
            desc: "Discover and quickly test hundreds of ideas with real players",
            homePageDesc: "Uncover concepts and attribute combinations missing in the market. Validate market potential of hundreds of ideas with real players.",
            modules: [EModuleId.GAPS, EModuleId.STUDIES],
            iconScale: 1.2
        },
    ]

    public static getModule(id: EModuleId) {
        const m = PortalConstants.modules.find((x) => x.id === id);
        if (m === undefined) {
            throw new ClientError(`Module ${id} not found`);
        }
        return m;
    }

    public static getBillingModule(id: EBillingModuleId) {
        const m = PortalConstants.billingModules.find((x) => x.id === id);
        if (m === undefined) {
            throw new ClientError(`Billing module ${id} not found`);
        }
        return m;
    }

    public static getBillingModuleForModule(moduleId: EModuleId): EBillingModuleId {
        const m = PortalConstants.billingModules.find((x) => x.modules.includes(moduleId));

        if (m === undefined) {
            throw new ClientError(`Billing module ${moduleId} not found`);
        }

        return m.id;
    }
}
