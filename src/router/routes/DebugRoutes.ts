import {RouteRecordRaw} from "vue-router";
import IGembaseRouteMeta from "@/router/IGembaseRouteMeta";

export const debugRoutes: RouteRecordRaw[] = [
    {
        name: "gpt4",
        path: "/gpt4",
        meta: {
            title: "GPT4",
        } as IGembaseRouteMeta,
        component: () => import("@/views/debug/Gpt4.vue"),
    },
    {
        name: "people-explorer",
        path: "/people-explorer",
        meta: {
            title: "People Explorer",
        } as IGembaseRouteMeta,
        component: () => import("@/views/platform/modules/playerExplorer/PlayerExplorer.vue"),
    }
];
