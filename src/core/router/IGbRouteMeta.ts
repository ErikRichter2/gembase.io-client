import {RouteLocationNormalized, RouteMeta} from "vue-router";

export interface IGbRouteMeta extends RouteMeta {
    beforeEach?: (to: RouteLocationNormalized, from: RouteLocationNormalized) => void;
}
