import {RouteRecordRaw} from "vue-router";
import IGembaseRouteMeta from "@/router/IGembaseRouteMeta";
import {RoutesEnum} from "@/router/RoutesEnum";

export const homeRoutes: RouteRecordRaw[] = [{
    name: "gembase-home",
    path: "/",
    meta: {
        title: "Gembase"
    } as IGembaseRouteMeta,
    component: () => import("@/views/home/HomeLayout_v3.vue"),
    children: [
        {
            name: RoutesEnum.HOME_INDEX,
            path: "/",
            meta: {
                title: "Gembase",
            } as IGembaseRouteMeta,
            component: () => import("@/views/home/HomeIndex_v3.vue"),
        },
        {
            name: "legals",
            path: "/legals",
            component: () => import("@/views/legals/PageLegal.vue"),
            children: [
                {
                    name: RoutesEnum.HOME_PRIVACY_POLICY,
                    path: "/privacy",
                    component: () => import("@/views/legals/LegalUserPrivacyPolicy.vue"),
                },
                {
                    name: RoutesEnum.HOME_RESPONDENT_PRIVACY_POLICY,
                    path: "/respondent-privacy",
                    component: () => import("@/views/legals/LegalRespondentPrivacyPolicy.vue"),
                },
                {
                    name: RoutesEnum.HOME_COOKIES_POLICY,
                    path: "/cookie-policy",
                    component: () => import("@/views/legals/LegalCookiePolicy.vue"),
                },
                {
                    name: RoutesEnum.HOME_TOS_POLICY,
                    path: "/tos",
                    component: () => import("@/views/legals/LegalGeneralTermsOfService.vue"),
                },
            ]
        },
        {
            name: RoutesEnum.SIGN_IN,
            path: "/sign-in",
            meta: {
                title: "Sign In",
            } as IGembaseRouteMeta,
            component: () => import("@/views/home/HomeSignIn.vue"),
        },
        {
            name: RoutesEnum.SIGN_UP,
            path: "/sign-up",
            meta: {
                title: "Sign Up",
            } as IGembaseRouteMeta,
            component: () => import("@/views/home/HomeSignUp_v2.vue"),
        },
        {
            name: "confirm-organization-invite",
            path: "/confirm-organization-invite",
            meta: {
                title: "Gembase"
            } as IGembaseRouteMeta,
            component: () => import("@/views/platform/simplePages/PlatformSimplePageConfirmRegistration.vue"),
        },
        {
            name: "confirm-registration-by-email",
            path: "/confirm-registration-by-email",
            meta: {
                title: "Gembase"
            } as IGembaseRouteMeta,
            component: () => import("@/views/platform/simplePages/PlatformSimplePageConfirmRegistration.vue"),
        },
        {
            name: "change-password",
            path: "/change-password",
            meta: {
                title: "Gembase"
            } as IGembaseRouteMeta,
            component: () => import("@/views/platform/simplePages/PlatformSimplePageChangePassword.vue"),
        },
        {
            name: RoutesEnum.PASSWORD_RESET_REQUEST,
            path: "/password-reset",
            meta: {
                title: "Password Reset",
            } as IGembaseRouteMeta,
            component: () => import("@/views/home/HomeResetPassword.vue"),
        },
        {
            name: "EMAIL_SUBSCRIPTION",
            path: "/email-subscription",
            meta: {
                title: "Email subscription",
            } as IGembaseRouteMeta,
            component: () => import("@/views/platform/simplePages/PlatformSimplePageEmailSubscription.vue"),
        },
        {
            name: "UNSUBSCRIBE_EMAIL",
            path: "/unsubscribe-email",
            meta: {
                title: "Unsubscribe Email",
            } as IGembaseRouteMeta,
            component: () => import("@/views/platform/simplePages/PlatformSimplePageEmailSubscription.vue"),
        },
    ]
}];
