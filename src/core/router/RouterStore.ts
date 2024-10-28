import {defineStore} from "pinia";
import {
    createRouter,
    createWebHistory,
    LocationQuery,
    RouteLocationNormalized, RouteLocationNormalizedLoaded,
    RouteRecordNormalized,
    RouteRecordRaw
} from "vue-router";
import {App, Ref} from "vue";
import ClientError from "@/core/errors/ClientError";
import {IQueryData} from "@/core/router/query/QueryData";
import {IGbRouteMeta} from "@/core/router/IGbRouteMeta";

declare type TGembaseRoute = string | symbol | null | undefined;

const __router = createRouter({
    history: createWebHistory(),
    routes: [],
    scrollBehavior: (to: RouteLocationNormalized, from: RouteLocationNormalized, savedPosition) => {
        if (to.hash) {
            return {
                el: to.hash,
                behavior: 'smooth',
            }
        }
    }
});

export const vueRouterInstance = __router;

export const useRouterStore = defineStore('routerStore', {
    actions: {
        init(app: App) {

            __router.addRoute({
                path: "/:pathMatch(.*)*",
                redirect: "/404",
            });

            __router.beforeEach(__beforeEachGuard)

            app.use(__router);

            return __router.isReady();
        },
        getQueryKey(key: string): string | undefined {
            const queryValue = this.currentRoute.value.query[key];
            if (typeof queryValue === "string") {
                return queryValue;
            }
            return undefined;
        },
        addRoutes(routes: RouteRecordRaw[]) {
            routes.forEach((x) => {
                __router.addRoute(x);
            });
        },
        getRouteRecordOrUndefined(route: TGembaseRoute): RouteRecordNormalized | undefined {
            let routeRecord = __router.getRoutes().find(
                (x) => x.name === route
            );

            if (routeRecord === undefined) {
                routeRecord = __router.getRoutes().find((x) => x.path === route);
            }

            return routeRecord;
        },
        getRouteRecord(route: TGembaseRoute): RouteRecordNormalized {
            const routeRecord = this.getRouteRecordOrUndefined(route);

            if (routeRecord === undefined) {
                throw new ClientError(`Route ${String(route)} not found`);
            }

            return routeRecord;
        },
        getRouteMeta<META extends IGbRouteMeta>(route: TGembaseRoute): META | undefined {
            const routeRecord = this.getRouteRecord(route);
            if (routeRecord.meta === undefined || routeRecord.meta === null) {
                return undefined;
            }
            return routeRecord.meta as META;
        },
        getCurrentRouteMeta<META extends IGbRouteMeta>(): META | undefined {
            return this.getRouteMeta<META>(__router.currentRoute.value.path);
        },
        getRoutePath(route: TGembaseRoute): string {
            return this.getRouteRecord(route).path;
        },
        getFullUrl(route: TGembaseRoute) {
            return location.protocol + '//' + location.host + this.getRoutePath(route);
        },
        async to(route: TGembaseRoute, options?: {
            replace?: boolean,
            reloadPage?: boolean
        }) {
            const routeRecord = this.getRouteRecord(route);
            if (options?.reloadPage) {
                location.replace(this.getFullUrl(route));
            }
            else if (options?.replace) {
                await __router.replace(routeRecord);
            } else {
                await __router.push(routeRecord);
            }
        },
        go(delta: number) {
            __router.go(delta);
        },
        async setQueryData(query: IQueryData, options?: {
            replace?: boolean
        }) {
            const locationQuery: LocationQuery = {};

            for (const k in query) {
                const v = query[k];
                if (v !== undefined) {
                    locationQuery[k] = v;
                }
            }

            await this.setQuery(locationQuery, options);
        },
        async setQuery(query: LocationQuery, options?: {
            replace?: boolean
        }) {
            if (options?.replace) {
                await __router.replace({
                    query: query
                });
            } else {
                await __router.push({
                    query: query
                });
            }
        },
        removeQueryKey(key: string | string[]) {
            if (typeof key === "string") {
                delete this.currentRoute.value.query[key];
            } else {
                key.forEach((x) => delete this.currentRoute.value.query[x]);
            }
        },
        isCurrentRoute(routeName: string | undefined): boolean {
            return __router.currentRoute.value.name === routeName;
        },
        isCurrentRouteChildOf(route: TGembaseRoute) {
            const routeRecord = this.getRouteRecordOrUndefined(route);
            if (routeRecord === undefined) {
                return false;
            }
            return __router.currentRoute.value.path.includes(routeRecord.path);
        },
        getMergeQueryWithCurrent(query: IQueryData): LocationQuery {
            const res: LocationQuery = {};

            for (const k in this.currentRoute.value.query) {
                res[k] = this.currentRoute.value.query[k];
            }

            for (const k in query) {
                const val = query[k];
                if (val !== undefined) {
                    res[k] = val;
                }
            }

            return res;
        },
        async back() {
            await __router.back();
        },
    },
    getters: {
        currentRoute(): Ref<RouteLocationNormalizedLoaded> {
            return __router.currentRoute;
        }
    }
});

async function __beforeEachGuard(to: RouteLocationNormalized, from: RouteLocationNormalized): Promise<void> {
    const t = (to.meta as IGbRouteMeta).beforeEach;
    if (t !== undefined) {
        await t(to, from);
    }
}
