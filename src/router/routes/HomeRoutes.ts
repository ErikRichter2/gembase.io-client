import type { RouteRecordRaw } from 'vue-router'

export enum HOME_ROUTES {
    HOME_INDEX = '/',
    PAGE_404 = '/404',
    PAGE_500 = '/500',
    HOME_LEGALS = '/legals',
    HOME_TEAM = '/team',
    HOME_PRIVACY_POLICY = '/legals/privacy',
    HOME_RESPONDENT_PRIVACY_POLICY = '/legals/respondent-privacy',
    HOME_TOS_POLICY = '/legals/tos',
    HOME_COOKIES_POLICY = '/legals/cookie-policy',
    HOME_SIGN_IN = '/sign-in',
    HOME_SIGN_UP = '/sign-up',
    HOME_CONFIRM_ORGANIZATION_INVITE = '/confirm-organization-invite',
    HOME_CONFIRM_REGISTRATION_BY_EMAIL = '/confirm-registration-by-email',
    HOME_CHANGE_PASSWORD = '/change-password',
    HOME_PASSWORD_RESET = '/password-reset',
    HOME_EMAIL_SUBSCRIPTION = '/email-subscription',
    HOME_UNSUBSCRIBE_EMAIL = '/unsubscribe-email',
}

export default [
    {
        path: HOME_ROUTES.HOME_INDEX,
        component: () => import('@/views/home/HomeLayout_v3.vue'),
        children: [
            {
                path: HOME_ROUTES.HOME_INDEX,
                component: () => import('@/views/home/HomeIndex_v3.vue'),
            },
            {
                path: HOME_ROUTES.HOME_LEGALS,
                component: () => import('@/views/legals/PageLegal.vue'),
                children: [
                    {
                        path: HOME_ROUTES.HOME_PRIVACY_POLICY,
                        component: () => import('@/views/legals/LegalUserPrivacyPolicy.vue'),
                    },
                    {
                        path: HOME_ROUTES.HOME_RESPONDENT_PRIVACY_POLICY,
                        component: () => import('@/views/legals/LegalRespondentPrivacyPolicy.vue'),
                    },
                    {
                        path: HOME_ROUTES.HOME_COOKIES_POLICY,
                        component: () => import('@/views/legals/LegalCookiePolicy.vue'),
                    },
                    {
                        path: HOME_ROUTES.HOME_TOS_POLICY,
                        component: () => import('@/views/legals/LegalGeneralTermsOfService.vue'),
                    },
                ],
            },
            {
                path: HOME_ROUTES.HOME_SIGN_IN,
                component: () => import('@/views/home/HomeSignIn.vue'),
            },
            {
                path: HOME_ROUTES.HOME_SIGN_UP,
                component: () => import('@/views/home/HomeSignUp_v2.vue'),
            },
            {
                path: HOME_ROUTES.HOME_CONFIRM_ORGANIZATION_INVITE,
                component: () =>
                    import('@/views/platform/simplePages/PlatformSimplePageConfirmRegistration.vue'),
            },
            {
                path: HOME_ROUTES.HOME_CONFIRM_REGISTRATION_BY_EMAIL,
                component: () =>
                    import('@/views/platform/simplePages/PlatformSimplePageConfirmRegistration.vue'),
            },
            {
                path: HOME_ROUTES.HOME_CHANGE_PASSWORD,
                component: () =>
                    import('@/views/platform/simplePages/PlatformSimplePageChangePassword.vue'),
            },
            {
                path: HOME_ROUTES.HOME_PASSWORD_RESET,
                component: () => import('@/views/home/HomeResetPassword.vue'),
            },
            {
                path: HOME_ROUTES.HOME_EMAIL_SUBSCRIPTION,
                component: () =>
                    import('@/views/platform/simplePages/PlatformSimplePageEmailSubscription.vue'),
            },
            {
                path: HOME_ROUTES.HOME_UNSUBSCRIBE_EMAIL,
                component: () =>
                    import('@/views/platform/simplePages/PlatformSimplePageEmailSubscription.vue'),
            },
        ],
    },
    {
        path: HOME_ROUTES.PAGE_404,
        component: () => import('@/views/platform/modules/system/__subpages/Error404.vue'),
    },
    {
        path: HOME_ROUTES.PAGE_500,
        component: () => import('@/views/platform/modules/system/__subpages/Error404.vue'),
    },
] as RouteRecordRaw[]
