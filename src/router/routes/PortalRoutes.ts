import {RouteRecordRaw} from "vue-router";
import IGembaseRouteMeta from "@/router/IGembaseRouteMeta";
import {RoutesEnum} from "@/router/RoutesEnum";
import {EModuleId} from "@/models/portal/PortalConstants";
import AuthRoutesGuard from "@/models/auth/AuthRoutesGuard";


const UserKyle = "3b99ec6e-c45c-408d-ac17-bae7d2ab1114";

export const portalRoutes: RouteRecordRaw[] = [{
    name: "gembase-app",
    path: "/platform",
    meta: {
        title: "Gembase.io",
        beforeEach: AuthRoutesGuard.beforeEach
    } as IGembaseRouteMeta,
    component: () => import("@/views/platform/PlatformLayout.vue"),
    children: [
        {
            path: "/platform",
            redirect: "/platform/home"
        },
        {
            name: RoutesEnum.SIGN_OUT,
            path: "/platform/sign-out",
            meta: {
                title: "Sign Out",
                icon: "/static/media/gembase/home/v2/icons/sign_out.svg",
            } as IGembaseRouteMeta,
            component: () => import("@/views/platform/simplePages/PlatformSimplePageSignOut.vue"),
        },
        {
            name: RoutesEnum.PORTAL_GUIDE,
            path: "/platform/home",
            meta: {
                title: "Home",
                icon: "/static/media/gembase/home/v2/icons/home.svg",
                requiresAuth: true
            } as IGembaseRouteMeta,
            component: () => import("@/views/platform/simplePages/PlatformSimplePageGuide.vue"),
        },
        {
            name: RoutesEnum.PLAYERS,
            path: "/platform/players",
            meta: {
                title: "Players",
                icon: "/static/media/gembase/home/v2/icons/tam_audience.svg",
                requiresAuth: true
            } as IGembaseRouteMeta,
            component: () => import("@/views/platform/modules/playerExplorer/PlayerExplorer.vue"),
        },
        {
            name: RoutesEnum.PORTAL_GAPS,
            path: "/platform/gaps",
            meta: {
                title: "Gaps",
                icon: "/static/media/gembase/home/v2/icons/market_gaps.svg",
                requiresAuth: true
            } as IGembaseRouteMeta,
            component: () => import("@/views/platform/modules/gaps/PlaformModuleGaps.vue"),
        },
        {
            name: RoutesEnum.PORTAL_GAMES,
            path: "/platform/games",
            meta: {
                title: "Games",
                icon: "/static/media/gembase/home/v2/icons/games.svg",
                requiresAuth: true
            } as IGembaseRouteMeta,
            component: () => import("@/views/platform/modules/gamesExplorer/GamesExplorer.vue"),
        },
        {
            name: RoutesEnum.PORTAL_STUDIES,
            path: "/platform/studies",
            meta: {
                title: "Studies",
                icon: "/static/media/gembase/home/v2/icons/test_concepts.svg",
                requiresAuth: true
            } as IGembaseRouteMeta,
            component: () => import("@/views/platform/modules/studies/PlatformModuleStudies.vue"),
        },
        {
            name: RoutesEnum.PORTAL_LENSES,
            path: "/platform/lenses",
            meta: {
                title: "Lenses",
                icon: "/static/media/gembase/home/v2/icons/earth-globe.svg",
                requiresAuth: true,
                wip: true,
                moduleId: EModuleId.LENSES
            } as IGembaseRouteMeta,
            component: () => import("@/views/platform/simplePages/PlatformSimplePageComingSoon.vue"),
        },
        {
            name: RoutesEnum.PORTAL_CREATOR,
            path: "/platform/creator",
            meta: {
                title: "Creator",
                icon: "/static/media/gembase/home/v2/icons/creator.svg",
                requiresAuth: true,
                wip: true,
                moduleId: EModuleId.CREATOR
            } as IGembaseRouteMeta,
            component: () => import("@/views/platform/simplePages/PlatformSimplePageComingSoon.vue"),
        },
        {
            name: RoutesEnum.PORTAL_MY_APPS,
            path: "/platform/auditor",
            meta: {
                title: "Auditor",
                icon: "/static/media/gembase/home/v2/icons/auditor.svg",
                requiresAuth: true
            } as IGembaseRouteMeta,
            component: () => import("@/views/platform/modules/auditor/PlatformModuleAuditor.vue"),
        },
        {
            name: RoutesEnum.PORTAL_BILLING,
            path: "/platform/billing",
            meta: {
                title: "Billing",
                icon: "/static/media/gembase/home/v2/icons/my_apps.svg",
                requiresAuth: true
            } as IGembaseRouteMeta,
            component: () => import("@/views/platform/modules/billing/PlatformBilling.vue")
        },
        {
            name: RoutesEnum.PORTAL_ACCOUNT,
            path: "/platform/account",
            meta: {
                title: "Account",
                icon: "/static/media/gembase/home/v2/icons/settings.svg",
            } as IGembaseRouteMeta,
            component: () => import("@/views/platform/modules/account/PlatformModuleAccount.vue"),
            children: [
                {
                    name: RoutesEnum.PORTAL_ACCOUNT_DETAILS,
                    path: "/platform/account/details",
                    meta: {
                        title: "Details",
                        icon: "/static/media/gembase/home/v2/icons/user.svg",
                    } as IGembaseRouteMeta,
                    component: () => import("@/views/platform/modules/account/__subpages/AccountDetails.vue"),
                },
                {
                    name: RoutesEnum.PORTAL_ACCOUNT_SECURITY,
                    path: "/platform/account/security",
                    meta: {
                        title: "Security",
                        icon: "/static/media/gembase/home/v2/icons/privacy-policy.svg",
                    } as IGembaseRouteMeta,
                    component: () => import("@/views/platform/modules/account/__subpages/AccountSecurity.vue"),
                },
                {
                    name: RoutesEnum.PORTAL_ACCOUNT_LICENCES,
                    path: "/platform/account/licences",
                    meta: {
                        title: "Users",
                        icon: "/static/media/gembase/home/v2/icons/free_access.svg",
                    } as IGembaseRouteMeta,
                    component: () => import("@/views/platform/modules/account/__subpages/AccountLicences.vue"),
                },
                {
                    name: RoutesEnum.PORTAL_ACCOUNT_BILLING,
                    path: "/platform/account/billing",
                    meta: {
                        title: "Billing",
                        wip: true,
                        icon: "/static/media/gembase/home/v2/icons/receipt.svg",
                    } as IGembaseRouteMeta,
                    component: () => import("@/views/platform/modules/account/__subpages/AccountBilling.vue"),
                },
            ]
        },
        {
            name: RoutesEnum.PORTAL_ADMIN_INDEX,
            path: "/admin",
            meta: {
                title: "Admin",
                icon: "/static/media/gembase/home/v2/icons/admin.svg",
                admin: true,
            } as IGembaseRouteMeta,
            component: () => import("@/views/platform/modules/admin/PlatformModuleAdmin.vue"),
            children: [
                {
                    name: RoutesEnum.ACCOUNT_ADMIN_USERS,
                    path: "/admin/users",
                    meta: {
                        user: UserKyle,
                    } as IGembaseRouteMeta,
                    component: () => import("@/views/platform/modules/admin/__subpages/AdminUsers.vue"),
                },
                {
                    name: RoutesEnum.ACCOUNT_ADMIN_CHANGE_DEVELOPER,
                    path: "/admin/change-developer",
                    component: () => import("@/views/platform/modules/admin/__subpages/AdminChangeDeveloper.vue"),
                },
                {
                    name: RoutesEnum.ACCOUNT_ADMIN_TEST_PAYMENTS,
                    path: "/admin/test-payments",
                    component: () => import("@/views/platform/modules/admin/__subpages/AdminTestPayments.vue"),
                },
                {
                    name: RoutesEnum.ACCOUNT_ADMIN_EMAIL_COMPOSER,
                    path: "/admin/email-composer",
                    meta: {
                        user: UserKyle,
                    } as IGembaseRouteMeta,
                    component: () => import("@/views/platform/modules/admin/__subpages/AdminEmailComposer.vue"),
                },
                {
                    name: RoutesEnum.ACCOUNT_ADMIN_GOOGLE_SHEETS,
                    path: "/admin/google-sheets",
                    component: () => import("@/views/platform/modules/admin/__subpages/AdminGoogleSheets.vue"),
                },
                {
                    name: RoutesEnum.ACCOUNT_ADMIN_REQUESTED_APP_TAGS_CHANGES,
                    path: "/admin/requested-app-labels-changes",
                    component: () => import("@/views/platform/modules/admin/__subpages/AdminRequestedAppTagsChanges.vue"),
                },
                {
                    name: RoutesEnum.ACCOUNT_ADMIN_WHITELIST_REQUEST,
                    path: "/admin/whitelist-request",
                    component: () => import("@/views/platform/modules/admin/__subpages/AdminWhitelistRequest.vue"),
                },
                {
                    name: RoutesEnum.ACCOUNT_ADMIN_REBUILD_PLATFORM_VALUES,
                    path: "/admin/rebuild-platform-values",
                    component: () => import("@/views/platform/modules/admin/__subpages/AdminRebuildPlatformValues.vue"),
                },
            ]
        }
    ]},
    {
        name: RoutesEnum.PORTAL_STUDIES_PREVIEW,
        path: "/studies/survey-preview",
        meta: {
            title: "Studies - Survey Preview",
        } as IGembaseRouteMeta,
        component: () => import("@/views/platform/modules/studies/__subpages/StudiesSurveyPreview.vue"),
    }]
