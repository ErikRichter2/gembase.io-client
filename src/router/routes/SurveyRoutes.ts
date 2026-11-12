import { type RouteRecordRaw } from 'vue-router'

export const SURVEY_INDEX = '/'

export default [
    {
        path: SURVEY_INDEX,
        component: () => import('@/views/survey/v2/SurveyV2.vue'),
    },
] as RouteRecordRaw[]
