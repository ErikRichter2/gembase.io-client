export enum PORTAL_ROUTES {
    PORTAL_INDEX = '/portal',
    PORTAL_SIGN_OUT = '/portal/sign-out',
    PORTAL_ACCOUNT = '/portal/account',
    PORTAL_ACCOUNT_DETAILS = '/portal/account/details',
    PORTAL_ACCOUNT_SECURITY = '/portal/account/security',
    PORTAL_ACCOUNT_LICENCES = '/portal/account/licences',
    PORTAL_ACCOUNT_BILLING = '/portal/account/billing',
    PORTAL_PLAYERS = '/portal/players',
    PORTAL_LENSES = '/portal/lenses',
    PORTAL_CREATOR = '/portal/creator',
    PORTAL_GAPS = '/portal/gaps',
    PORTAL_GAPS_RESULTS = '/portal/gaps-results',
    PORTAL_GAMES = '/portal/games',
    PORTAL_MY_APPS = '/portal/my-apps',
    PORTAL_BILLING = '/portal/billing',
    PORTAL_TOS = '/portal/tos',
    PORTAL_PROFILE_APPS = '/portal/profile-apps',
    PORTAL_GUIDE = '/portal/guide',
    PORTAL_COMPETITORS = '/portal/competitors',
    PORTAL_STUDIES = '/portal/studies',
    PORTAL_STUDIES_PREVIEW = '/portal/studies-preview',
    PORTAL_ADMIN_INDEX = '/portal/admin',
    ACCOUNT_ADMIN_USERS = '/portal/admin/users',
    ACCOUNT_ADMIN_CHANGE_DEVELOPER = '/portal/admin/change-developer',
    ACCOUNT_ADMIN_TEST_PAYMENTS = '/portal/admin/test-payments',
    ACCOUNT_ADMIN_EMAIL_COMPOSER = '/portal/admin/email-composer',
    ACCOUNT_ADMIN_GOOGLE_SHEETS = '/portal/admin/google-sheets',
    ACCOUNT_ADMIN_REQUESTED_APP_TAGS_CHANGES = '/portal/admin/request-app-tags-changes',
    ACCOUNT_ADMIN_WHITELIST_REQUEST = '/portal/admin/whitelist-request',
    ACCOUNT_ADMIN_REBUILD_PLATFORM_VALUES = '/portal/admin/rebuild-platform-values',
}

export default [
    {
        path: PORTAL_ROUTES.PORTAL_INDEX,
        component: () => import('@/views/platform/PlatformLayout.vue'),
        meta: { requiresAuth: true },
        children: [
            {
                path: PORTAL_ROUTES.PORTAL_INDEX,
                redirect: PORTAL_ROUTES.PORTAL_GUIDE,
            },
            {
                path: PORTAL_ROUTES.PORTAL_SIGN_OUT,
                component: () =>
                    import('@/views/platform/simplePages/PlatformSimplePageSignOut.vue'),
            },
            {
                path: PORTAL_ROUTES.PORTAL_GUIDE,
                component: () => import('@/views/platform/simplePages/PlatformSimplePageGuide.vue'),
            },
            {
                path: PORTAL_ROUTES.PORTAL_PLAYERS,
                component: () =>
                    import('@/views/platform/modules/playerExplorer/PlayerExplorer.vue'),
            },
            {
                path: PORTAL_ROUTES.PORTAL_GAPS,
                component: () => import('@/views/platform/modules/gaps/PlaformModuleGaps.vue'),
            },
            {
                path: PORTAL_ROUTES.PORTAL_GAMES,
                component: () => import('@/views/platform/modules/gamesExplorer/GamesExplorer.vue'),
            },
            {
                path: PORTAL_ROUTES.PORTAL_STUDIES,
                component: () =>
                    import('@/views/platform/modules/studies/PlatformModuleStudies.vue'),
            },
            {
                path: PORTAL_ROUTES.PORTAL_LENSES,
                component: () =>
                    import('@/views/platform/simplePages/PlatformSimplePageComingSoon.vue'),
            },
            {
                path: PORTAL_ROUTES.PORTAL_CREATOR,
                component: () =>
                    import('@/views/platform/simplePages/PlatformSimplePageComingSoon.vue'),
            },
            {
                path: PORTAL_ROUTES.PORTAL_MY_APPS,
                component: () =>
                    import('@/views/platform/modules/auditor/PlatformModuleAuditor.vue'),
            },
            {
                path: PORTAL_ROUTES.PORTAL_BILLING,
                component: () => import('@/views/platform/modules/billing/PlatformBilling.vue'),
            },
            {
                path: PORTAL_ROUTES.PORTAL_ACCOUNT,
                component: () =>
                    import('@/views/platform/modules/account/PlatformModuleAccount.vue'),
                children: [
                    {
                        path: PORTAL_ROUTES.PORTAL_ACCOUNT_DETAILS,
                        component: () =>
                            import('@/views/platform/modules/account/__subpages/AccountDetails.vue'),
                    },
                    {
                        path: PORTAL_ROUTES.PORTAL_ACCOUNT_SECURITY,
                        component: () =>
                            import('@/views/platform/modules/account/__subpages/AccountSecurity.vue'),
                    },
                    {
                        path: PORTAL_ROUTES.PORTAL_ACCOUNT_LICENCES,
                        component: () =>
                            import('@/views/platform/modules/account/__subpages/AccountLicences.vue'),
                    },
                    {
                        path: PORTAL_ROUTES.PORTAL_ACCOUNT_BILLING,
                        component: () =>
                            import('@/views/platform/modules/account/__subpages/AccountBilling.vue'),
                    },
                ],
            },
            {
                path: PORTAL_ROUTES.PORTAL_ADMIN_INDEX,
                component: () => import('@/views/platform/modules/admin/PlatformModuleAdmin.vue'),
                children: [
                    {
                        path: PORTAL_ROUTES.ACCOUNT_ADMIN_USERS,
                        component: () =>
                            import('@/views/platform/modules/admin/__subpages/AdminUsers.vue'),
                    },
                    {
                        path: PORTAL_ROUTES.ACCOUNT_ADMIN_CHANGE_DEVELOPER,
                        component: () =>
                            import('@/views/platform/modules/admin/__subpages/AdminChangeDeveloper.vue'),
                    },
                    {
                        path: PORTAL_ROUTES.ACCOUNT_ADMIN_TEST_PAYMENTS,
                        component: () =>
                            import('@/views/platform/modules/admin/__subpages/AdminTestPayments.vue'),
                    },
                    {
                        path: PORTAL_ROUTES.ACCOUNT_ADMIN_EMAIL_COMPOSER,
                        component: () =>
                            import('@/views/platform/modules/admin/__subpages/AdminEmailComposer.vue'),
                    },
                    {
                        path: PORTAL_ROUTES.ACCOUNT_ADMIN_GOOGLE_SHEETS,
                        component: () =>
                            import('@/views/platform/modules/admin/__subpages/AdminGoogleSheets.vue'),
                    },
                    {
                        path: PORTAL_ROUTES.ACCOUNT_ADMIN_REQUESTED_APP_TAGS_CHANGES,
                        component: () =>
                            import('@/views/platform/modules/admin/__subpages/AdminRequestedAppTagsChanges.vue'),
                    },
                    {
                        path: PORTAL_ROUTES.ACCOUNT_ADMIN_WHITELIST_REQUEST,
                        component: () =>
                            import('@/views/platform/modules/admin/__subpages/AdminWhitelistRequest.vue'),
                    },
                    {
                        path: PORTAL_ROUTES.ACCOUNT_ADMIN_REBUILD_PLATFORM_VALUES,
                        component: () =>
                            import('@/views/platform/modules/admin/__subpages/AdminRebuildPlatformValues.vue'),
                    },
                ],
            },
        ],
    },
    {
        path: PORTAL_ROUTES.PORTAL_STUDIES_PREVIEW,
        component: () =>
            import('@/views/platform/modules/studies/__subpages/StudiesSurveyPreview.vue'),
    },
]
