<template>
    <header-element :hamburger-visible="authStore.data.isAuthenticated" :logo-route="RoutesEnum.PORTAL_GUIDE" @on-hamburger-click="portalStore.portalSidebarOn = !portalStore.portalSidebarOn">
        <div class="gb-layout-row gap-4">
            <div v-if="authStore.data.user?.fake_login === true">
                <gb-button @click="authStore.fakeLogout()" class="gbc-bg-alert" text="Fake logout"></gb-button>
            </div>
            <div v-if="GembaseUtils.getBuildVersionAndTime() !== null">
                <div @mouseover="showBuildDetail = true" @mouseout="showBuildDetail = false" class="gbc-bg-node gb-base-shape relative text-[12px] gap-2 font-normal">
                    <div class="whitespace-nowrap pointer-events-none">
                        {{`Build ${GembaseUtils.getBuildVersionAndTime()?.version}`}}
                    </div>
                    <div v-if="showBuildDetail" class="absolute bottom-0 pointer-events-none gb-layout-tc-row">
                        <div class="absolute gbc-bg-secondary h-[100px] gb-layout p-3 rounded-3xl">
                            <div class="gb-layout-ml h-full gap-1">
                                <div class="text-yellow font-bold">
                                    Build {{GembaseUtils.getBuildVersionAndTime()?.version}} released on {{GembaseUtils.getBuildVersionAndTime()?.time}}
                                </div>
                                <div>
                                    Platform is fully operational, but  we would be grateful if you could<br>report any bugs
                                    or data inconsistencies via Chat below. Thank you!
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="gb-layout-tl-row gap-2 font-normal">
                <router-link v-if="!authStore.data.isAuthenticated" :to="useRouterStore().getRoutePath(RoutesEnum.SIGN_IN)">
                    <gb-button class="gbc-bg-primary" text="Sign In"></gb-button>
                </router-link>
                <div v-if="authStore.data.isAuthenticated" class="gb-layout-ml-row gap-2 pr-2">
                    <portal-ui-router-link :replace-if-same-page="true" :name="RoutesEnum.PORTAL_BILLING" :query="{showPlayersResearch: 'true'} as BillingQueryParams">
                        <gb-button :show-glow="true" class="gbc-bg-primary !h-[35px] !rounded-2xl !pl-[30px] !pr-[30px]" text="FREE Player research!" :icon="PortalConstants.ICON_PLAYERS"></gb-button>
                    </portal-ui-router-link>
                    <router-link :to="useRouterStore().getRoutePath(RoutesEnum.PORTAL_BILLING)">
                        <gb-button :show-glow="true" class="gbc-bg-primary !h-[35px] !rounded-2xl !pl-[30px] !pr-[30px]" :text="`Full access from $ ${PortalConstants.FULL_ACCESS_PRICE} / year!`" :icon="PortalConstants.ICON_UPGRADE_TO_PREMIUM"></gb-button>
                    </router-link>
                </div>
            </div>
        </div>
    </header-element>
    <div class="gb-sidebar gb-bg-window-gradient" :data-sidebar-maximized="portalStore.isSidebarOn()">
        <div class="gb-layout-l-between w-full h-full pt-5">
            <div class="gb-layout w-full">
                <template v-for="(item, i) in getSidebarMenuPages()" :key="i">
                    <div v-if="item.separator" class="ml-4 mr-4 w-[calc(100%-30px)] mt-2 mb-2 h-[2px] bg-white/5">
                    </div>
                    <portal-ui-router-link v-else-if="item.data?.page !== undefined" :to="item.data.page.path" active-class="active" class="gb-sidebar-menu-item-content w-full data-[wip='true']:opacity-50" :data-wip="item.data?.meta?.wip">
                        <div :id="`portal_menu_${item.id}`" class="gb-layout-ml-row gb-ui-svg-current w-full pl-4 gap-1">
                            <div class="w-[25px] h-[25px] gb-layout">
                                <gb-svg :style="{height: getIconH(item.moduleId)}" class="w-auto" :path="item.data?.meta?.icon"></gb-svg>
                            </div>
                            <div>
                                {{ item.data?.meta?.title }}
                            </div>
                        </div>
                    </portal-ui-router-link>
                    <div v-else-if="item.customItem !== undefined" class="gb-layout-ml-row gb-ui-svg-current w-full pl-5 gap-1">
                        <div class="w-[25px] h-[25px] gb-layout">
                            <portal-ui-svg class="h-full aspect-square" :icon="item.customItem.icon"></portal-ui-svg>
                        </div>
                        <div>
                            {{ item.customItem.title }}
                        </div>
                    </div>
                    <div class="w-full" v-if="(item.data?.page !== undefined || item.subpages !== undefined) && (item.data?.page === undefined || useRouterStore().isCurrentRouteChildOf(item.data.page.path))">
                        <div v-for="subpage in item.subpages">
                            <template v-if="subpage.template === 'cookies'">
                                <div class="gb-sidebar-submenu-item-content w-full">
                                    <div class="gb-layout-ml-row gb-ui-svg-current cursor-pointer w-full pl-10 gap-1" data-gt-cookie-widget-show>
                                        <portal-ui-svg class="w-[25px] h-[25px]" icon="cookies"></portal-ui-svg>
                                        <div>
                                            Cookies
                                        </div>
                                    </div>
                                </div>
                            </template>
                            <router-link v-else-if="subpage.data?.page !== undefined" :to="subpage.data.page.path" active-class="active" class="gb-sidebar-submenu-item-content w-full data-[wip='true']:opacity-50" :data-wip="subpage.data?.meta?.wip">
                                <div :id="`portal_menu_${subpage.id}`" class="gb-layout-ml-row gb-ui-svg-current w-full pl-10 gap-1">
                                    <div class="w-[25px] h-[25px] gb-layout">
                                        <gb-svg :style="{height: getIconH(subpage.moduleId)}" class="w-auto" :path="subpage.data?.meta?.icon"></gb-svg>
                                    </div>
                                    <div>
                                        {{ subpage.data?.meta?.title }}
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
import {RoutesEnum} from "@/router/RoutesEnum";
import {useAuthStore} from "@/models/auth/AuthStore";
import {usePortalStore} from "@/models/portal/PortalStore";
import HeaderElement from "@/views/platform/__components/HeaderElement.vue";
import GembaseUtils from "@/utils/GembaseUtils";
import {EBillingModuleId, EModuleId, PortalConstants} from "@/models/portal/PortalConstants";
import PortalUiSvg from "@/views/ui/svg/PortalUiSvg.vue";
import {ref} from "vue";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import PortalUiRouterLink from "@/views/ui/router/PortalUiRouterLink.vue";
import GbSvg from "@/views/ui/icons/GbSvg.vue";
import {BillingQueryParams} from "@/models/portal/billing/BillingData";
import {useRouterStore} from "@/core/router/RouterStore";
import {RouteRecordNormalized} from "vue-router";
import IGembaseRouteMeta from "@/router/IGembaseRouteMeta";
import PlatformOnboarding from "@/views/platform/__components/PlatformOnboarding.vue";

const authStore = useAuthStore();
const portalStore = usePortalStore();

const showBuildDetail = ref(false);

interface IPageData {
    page?: RouteRecordNormalized;
    meta?: IGembaseRouteMeta,
}

interface HeaderMenu {
    id?: string;
    data?: IPageData,
    template?: "cookies";
    subpages?: HeaderMenu[];
    moduleId?: EModuleId;
    separator?: boolean;
    customItem?: {
        icon: string;
        title: string;
    }
}

function getIconH(moduleId: EModuleId | undefined) {
    if (moduleId === EModuleId.GAMES_EXPLORER) {
        return "80%";
    }
    if (moduleId === EModuleId.AUDITOR) {
        return "80%";
    }
    return "100%";
}

function getPageData(name: RoutesEnum) {
    return {
        page: useRouterStore().getRouteRecord(name),
        meta: useRouterStore().getRouteMeta<IGembaseRouteMeta>(name)
    }
}

function getSidebarMenuPages(): HeaderMenu[] {
    const res: HeaderMenu[] = [];

    const accountSubpages: HeaderMenu[] = [];
    accountSubpages.push({data: getPageData(RoutesEnum.PORTAL_ACCOUNT_DETAILS)});
    accountSubpages.push({data: getPageData(RoutesEnum.PORTAL_ACCOUNT_SECURITY)});
    if (authStore.isOrganization) {
        accountSubpages.push({data: getPageData(RoutesEnum.PORTAL_ACCOUNT_LICENCES)});
    }
    accountSubpages.push({template: "cookies"});
    accountSubpages.push({data: getPageData(RoutesEnum.PORTAL_ACCOUNT_BILLING)});

    const insightModule = PortalConstants.getBillingModule(EBillingModuleId.INSIGHTS);
    const ideasModules = PortalConstants.getBillingModule(EBillingModuleId.IDEAS);

    res.push({data: getPageData(RoutesEnum.PORTAL_GUIDE)});
    res.push({moduleId: EModuleId.AUDITOR, id: RoutesEnum.PORTAL_MY_APPS, data: getPageData(RoutesEnum.PORTAL_MY_APPS)});
    res.push({
        customItem: {
            icon: insightModule.icon,
            title: insightModule.title
        },
        subpages: [
            {moduleId: EModuleId.GAMES_EXPLORER, data: getPageData(RoutesEnum.PORTAL_GAMES)},
            {data: getPageData(RoutesEnum.PLAYERS)}
        ]
    });
    res.push({
        customItem: {
            icon: ideasModules.icon,
            title: ideasModules.title
        },
        subpages: [
            {id: RoutesEnum.PORTAL_GAPS, data: getPageData(RoutesEnum.PORTAL_GAPS)},
            {id: RoutesEnum.PORTAL_STUDIES, data: getPageData(RoutesEnum.PORTAL_STUDIES)}
        ]
    });
    res.push({data: getPageData(RoutesEnum.PORTAL_LENSES)});
    res.push({data: getPageData(RoutesEnum.PORTAL_CREATOR)});
    res.push({separator: true})
    res.push({
        data: getPageData(RoutesEnum.PORTAL_ACCOUNT),
            subpages: accountSubpages
        });
    res.push({data: getPageData(RoutesEnum.SIGN_OUT)});

    if (authStore.isAdmin()) {
        res.push({separator: true});
        res.push({data: getPageData(RoutesEnum.PORTAL_ADMIN_INDEX)})
    }

    return res;
}

</script>

<style scoped>
.gb-sidebar {
  @apply gb-layout-tl text-[0.8em] fixed w-[var(--gb-ui-portal-sidebar-w)] top-[var(--gb-ui-portal-header-h)] bottom-0 border-r border-black;
}

.gb-sidebar[data-sidebar-maximized="false"] {
  @apply left-[calc(-1*var(--gb-ui-portal-sidebar-w))] duration-500;
}

.gb-sidebar[data-sidebar-maximized="true"] {
  @apply left-0 duration-500;
}

.gb-sidebar-menu-item-content {
  @apply gb-layout-tl-row font-normal pt-1 pb-1;
}

.gb-sidebar-submenu-item-content {
  @apply gb-layout-tl-row font-normal pt-1 pb-1;
}

.gb-sidebar-submenu-item-content[data-maximized="false"] {
  @apply ml-1 mr-1;
}

.gb-sidebar-menu-item-content[data-maximized="false"] {
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
