<template>
    <header-element
        :hamburger-visible="sessionStore.isLogged"
        :logo-route="PORTAL_ROUTES.PORTAL_GUIDE"
        @on-hamburger-click="portalStore.portalSidebarOn = !portalStore.portalSidebarOn"
    >
        <div class="gb-layout-row gap-4">
            <div class="gb-layout-tl-row gap-2 font-normal">
                <router-link v-if="!sessionStore.isLogged" :to="HOME_ROUTES.HOME_SIGN_IN">
                    <gb-button class="gbc-bg-primary" text="Sign In"></gb-button>
                </router-link>
                <div v-if="sessionStore.isLogged" class="gb-layout-ml-row gap-2 pr-2">
                    <portal-ui-router-link
                        :replace-if-same-page="true"
                        :path="PORTAL_ROUTES.PORTAL_BILLING"
                        :query-records="{ showPlayersResearch: 'true' } as BillingQueryParams"
                    >
                        <gb-button
                            :show-glow="true"
                            class="gbc-bg-primary !h-[35px] !rounded-2xl !pl-[30px] !pr-[30px]"
                            text="FREE Player research!"
                            :icon="PortalConstants.ICON_PLAYERS"
                        ></gb-button>
                    </portal-ui-router-link>
                    <router-link :to="PORTAL_ROUTES.PORTAL_BILLING">
                        <gb-button
                            :show-glow="true"
                            class="gbc-bg-primary !h-[35px] !rounded-2xl !pl-[30px] !pr-[30px]"
                            :text="`Full access from $ ${PortalConstants.FULL_ACCESS_PRICE} / year!`"
                            :icon="PortalConstants.ICON_UPGRADE_TO_PREMIUM"
                        ></gb-button>
                    </router-link>
                </div>
            </div>
        </div>
    </header-element>
    <div
        class="gb-sidebar gb-bg-window-gradient"
        :data-sidebar-maximized="portalStore.isSidebarOn()"
    >
        <div class="gb-layout-l-between w-full h-full pt-5">
            <div class="gb-layout w-full">
                <template v-for="(item, i) in menuDef" :key="i">
                    <div
                        v-if="item.separator"
                        class="ml-4 mr-4 w-[calc(100%-30px)] mt-2 mb-2 h-[2px] bg-white/5"
                    ></div>
                    <portal-ui-router-link
                        v-else-if="item.path !== undefined"
                        :path="item.path"
                        active-class="active"
                        class="gb-sidebar-menu-item-content w-full data-[wip='true']:opacity-50"
                        :data-wip="item.wip"
                    >
                        <div
                            :id="`portal_menu_${item.title}`"
                            class="gb-layout-ml-row gb-ui-svg-current w-full pl-4 gap-1"
                        >
                            <div class="w-[25px] h-[25px] gb-layout">
                                <gb-svg
                                    :style="{ height: getIconH(item.moduleId) }"
                                    class="w-auto"
                                    :icon="item.icon"
                                ></gb-svg>
                            </div>
                            <div>
                                {{ item.title }}
                            </div>
                        </div>
                    </portal-ui-router-link>
                    <div
                        class="w-full"
                        v-if="item.children !== undefined && item.children.length > 0"
                    >
                        <div v-for="(subpage, i) in item.children" :key="i">
                            <template v-if="subpage.template === 'cookies'">
                                <div class="gb-sidebar-submenu-item-content w-full">
                                    <div
                                        class="gb-layout-ml-row gb-ui-svg-current cursor-pointer w-full pl-10 gap-1"
                                        data-gt-cookie-widget-show
                                    >
                                        <portal-ui-svg
                                            class="w-[25px] h-[25px]"
                                            icon="cookies"
                                        ></portal-ui-svg>
                                        <div>Cookies</div>
                                    </div>
                                </div>
                            </template>
                            <router-link
                                v-else-if="subpage.path !== undefined"
                                :to="subpage.path"
                                active-class="active"
                                class="gb-sidebar-submenu-item-content w-full data-[wip='true']:opacity-50"
                                :data-wip="subpage.wip"
                            >
                                <div
                                    :id="`portal_menu_${subpage.title}`"
                                    class="gb-layout-ml-row gb-ui-svg-current w-full pl-10 gap-1"
                                >
                                    <div class="w-[25px] h-[25px] gb-layout">
                                        <gb-svg
                                            :style="{ height: getIconH(subpage.moduleId) }"
                                            class="w-auto"
                                            :icon="subpage.icon"
                                        ></gb-svg>
                                    </div>
                                    <div>
                                        {{ subpage.title }}
                                    </div>
                                </div>
                            </router-link>
                        </div>
                    </div>
                </template>
            </div>
            <div class="gb-layout w-full pb-1 text-center text-gray-600 text-[0.8em]">
                <platform-onboarding class="mb-1"></platform-onboarding>
                <div>{{ GembaseUtils.copyright() }}</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { usePortalStore } from '@/models/portal/PortalStore'
import HeaderElement from '@/views/platform/__components/HeaderElement.vue'
import GembaseUtils from '@/utils/GembaseUtils'
import { EBillingModuleId, EModuleId, PortalConstants } from '@/models/portal/PortalConstants'
import PortalUiSvg from '@/views/ui/svg/PortalUiSvg.vue'
import GbButton from '@/views/ui/buttons/GbButton.vue'
import PortalUiRouterLink from '@/views/ui/router/PortalUiRouterLink.vue'
import GbSvg from '@/views/ui/icons/GbSvg.vue'
import { type BillingQueryParams } from '@/models/portal/billing/BillingData'
import PlatformOnboarding from '@/views/platform/__components/PlatformOnboarding.vue'
import { PORTAL_ROUTES } from '@/router/routes/PortalRoutes'
import { HOME_ROUTES } from '@/router/routes/HomeRoutes'
import { useSessionStore } from '@/stores/SessionStore'

const sessionStore = useSessionStore()
const portalStore = usePortalStore()

function getIconH(moduleId: EModuleId | undefined) {
    if (moduleId === EModuleId.GAMES_EXPLORER) {
        return '80%'
    }
    if (moduleId === EModuleId.AUDITOR) {
        return '80%'
    }
    return '100%'
}

interface IPageData {
    title: string
    path?: string
    icon?: string
    moduleId?: number
    children?: IPageData[]
    separator?: boolean
    template?: string
    wip?: boolean
}

const menuDef: IPageData[] = []

menuDef.push({ title: `Home`, path: PORTAL_ROUTES.PORTAL_GUIDE, icon: `home` })

menuDef.push({
    title: `Auditor`,
    path: PORTAL_ROUTES.PORTAL_MY_APPS,
    moduleId: EModuleId.AUDITOR,
    icon: `auditor`,
})

const insightModule = PortalConstants.getBillingModule(EBillingModuleId.INSIGHTS)
menuDef.push({
    title: insightModule.title,
    icon: insightModule.icon,
    children: [
        { moduleId: EModuleId.GAMES_EXPLORER, title: `Games Explorer`, icon: `` },
        { title: `Players`, icon: `` },
    ],
})

const ideasModules = PortalConstants.getBillingModule(EBillingModuleId.IDEAS)
menuDef.push({
    title: ideasModules.title,
    icon: ideasModules.icon,
    children: [
        { path: PORTAL_ROUTES.PORTAL_GAPS, title: `Gaps`, icon: `market_gaps` },
        { path: PORTAL_ROUTES.PORTAL_STUDIES, title: `Studies`, icon: `test_concepts` },
    ],
})

menuDef.push({ title: `Lenses`, path: PORTAL_ROUTES.PORTAL_LENSES, icon: `earth-globe` })
menuDef.push({ title: `Creator`, path: PORTAL_ROUTES.PORTAL_CREATOR, icon: `creator` })

menuDef.push({ title: ``, separator: true })

const accountSubpages: IPageData[] = []
menuDef.push({
    title: `Account`,
    path: PORTAL_ROUTES.PORTAL_ACCOUNT,
    children: accountSubpages,
    icon: `settings`,
})

accountSubpages.push({ title: `Details`, path: PORTAL_ROUTES.PORTAL_ACCOUNT_DETAILS, icon: `user` })
accountSubpages.push({
    title: `Security`,
    path: PORTAL_ROUTES.PORTAL_ACCOUNT_SECURITY,
    icon: `privacy-policy`,
})

if (sessionStore.isOrganization) {
    accountSubpages.push({ title: `Licences`, path: PORTAL_ROUTES.PORTAL_ACCOUNT_LICENCES })
}
accountSubpages.push({ title: ``, template: 'cookies' })
accountSubpages.push({
    title: `Billing`,
    path: PORTAL_ROUTES.PORTAL_ACCOUNT_BILLING,
    icon: `my_apps`,
})

menuDef.push({ title: `Sign Out`, path: PORTAL_ROUTES.PORTAL_SIGN_OUT, icon: `sign_out` })

if (sessionStore.isAdmin) {
    menuDef.push({ title: ``, separator: true })
    menuDef.push({ title: `Admin`, path: PORTAL_ROUTES.PORTAL_ADMIN_INDEX })
}
</script>

<style scoped>
.gb-sidebar {
    @apply gb-layout-tl text-[0.8em] fixed w-[var(--gb-ui-portal-sidebar-w)] top-[var(--gb-ui-portal-header-h)] bottom-0 border-r border-black;
}

.gb-sidebar[data-sidebar-maximized='false'] {
    @apply left-[calc(-1*var(--gb-ui-portal-sidebar-w))] duration-500;
}

.gb-sidebar[data-sidebar-maximized='true'] {
    @apply left-0 duration-500;
}

.gb-sidebar-menu-item-content {
    @apply gb-layout-tl-row font-normal pt-1 pb-1;
}

.gb-sidebar-submenu-item-content {
    @apply gb-layout-tl-row font-normal pt-1 pb-1;
}

.gb-sidebar-submenu-item-content[data-maximized='false'] {
    @apply ml-1 mr-1;
}

.gb-sidebar-menu-item-content[data-maximized='false'] {
    @apply ml-1 mr-1;
}

.gb-sidebar-menu-item-content.active {
    @apply bg-light-violet;
}

.gb-sidebar-submenu-item-content.active {
    @apply bg-light-violet;
}

.gb-sidebar-menu-item-content:hover {
    @apply !text-orange;
}

.gb-sidebar-submenu-item-content:hover {
    @apply !text-orange;
}
</style>
