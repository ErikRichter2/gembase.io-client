import {RouteLocationNormalized} from "vue-router";

export default class AuthRoutesGuard {
    private static _guard: ((to: RouteLocationNormalized, from: RouteLocationNormalized) => void) | null = null;

    static async beforeEach(to, from) {
        if (AuthRoutesGuard._guard === null) {
            await import("@/models/auth/AuthStore").then((authStore) => {
                AuthRoutesGuard._guard = authStore.getBeforeEachRouteGuard();
            });
        }

        if (AuthRoutesGuard._guard !== null) {
            await AuthRoutesGuard._guard(to, from);
        }
    }
}
