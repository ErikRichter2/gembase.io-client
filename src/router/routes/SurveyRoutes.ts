import {RouteRecordRaw} from "vue-router";
import IGembaseRouteMeta from "@/router/IGembaseRouteMeta";
import {RoutesEnum} from "@/router/RoutesEnum";

export const surveyRoutes: RouteRecordRaw[] = [
    {
        name: RoutesEnum.SURVEY,
        path: "/survey",
        meta: {
            title: "Survey",
        } as IGembaseRouteMeta,
        component: () => import("@/views/survey/v2/SurveyV2.vue"),
    },
];
