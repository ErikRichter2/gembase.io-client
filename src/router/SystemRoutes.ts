import {RouteRecordRaw} from "vue-router";
import IGembaseRouteMeta from "@/router/IGembaseRouteMeta";
import {RoutesEnum} from "@/router/RoutesEnum";

export const systemRoutes: RouteRecordRaw = {
    name: "system-view",
    path: "/",
    meta: {
        title: "Gembase",
    } as IGembaseRouteMeta,
    component: () => import("@/views/platform/modules/system/PlatformModuleSystem.vue"),
    children: [
        {
            name: RoutesEnum.ERROR_404,
            path: "/404",
            meta: {
                title: "Gembase",
            } as IGembaseRouteMeta,
            component: () => import("@/views/platform/modules/system/__subpages/Error404.vue"),
        },
        {
            name: RoutesEnum.ERROR_500,
            path: "/500",
            meta: {
                title: "Gembase",
            } as IGembaseRouteMeta,
            component: () => import("@/views/platform/modules/system/__subpages/Error500.vue"),
        }
    ]
}
