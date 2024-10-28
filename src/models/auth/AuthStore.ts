import {defineStore} from "pinia";
import JwtService from "@/core/services/JwtService";
import UserData from "@/models/user/UserData";
import EndpointRequest from "@/core/requests/EndpointRequest";
import ClientError from "@/core/errors/ClientError";
import {RoutesEnum} from "@/router/RoutesEnum";
import GembaseUtils from "@/utils/GembaseUtils";
import {LoginCredentialsResponse, LoginTokenResponse} from "@/models/auth/AuthResponse";
import {useRouterStore} from "@/core/router/RouterStore";
import {RouteLocationNormalized} from "vue-router";
import IGembaseRouteMeta from "@/router/IGembaseRouteMeta";
import ServerConfigData from "@/models/auth/ServerConfigData";
import {setHeapUserData} from "@/models/external/heap/Heap";

const routerStore = useRouterStore();

export const useAuthStore = defineStore('authStore', {
    state: () => ({
        data: {} as {
            wasTokenAutoAuth: boolean;
            isAuthenticated: boolean;
            firebaseInitialized: boolean;
            user: UserData;
            landingPageAfterSignIn: string | symbol | null | undefined;
            serverConfig: ServerConfigData[];
            pendingRegistrationGuid?: string;
        },
        hideAdminFlag: false
    }),
    actions: {
        async tryAuth() {
            if (this.data.isAuthenticated) {
                return;
            }
            if (this.data.wasTokenAutoAuth) {
                return;
            }
            this.data.wasTokenAutoAuth = true;
            await this.loginToken();
        },
        async loginToken() {
            if (this.data.isAuthenticated) {
                return;
            }

            this.clearUser();
            const response = await EndpointRequest.process2<LoginTokenResponse>("auth:login_token")
            if (response.state === "ok") {
                await this.setUser(response.user_data);
            } else {
                this.clearUser()
            }
        },
        async loginCredentials(credentials) {
            await Promise.resolve(EndpointRequest.process2<LoginCredentialsResponse>(`auth:login_credentials`, credentials)
                .then(async response => {
                    await this.setUser(response.user_data, response.client_token);
                }));
        },
        async setUser(user: UserData, clientToken?: string) {
            if (user === undefined ||
                user === null) {
                throw new ClientError("Could not login - please reload");
            }
            if (clientToken !== undefined) {
                JwtService.saveToken(clientToken);
            }
            this.data.isAuthenticated = true;
            this.data.user = user;
            setHeapUserData(user);
        },
        hideAdmin() {
            this.hideAdminFlag = true;
        },
        clearUser(destroy_token = false) {
            this.data.isAuthenticated = false;
            if (destroy_token) {
                JwtService.destroyToken();
            }
        },
        async logout() {
            this.data.wasTokenAutoAuth = false;
            const token = JwtService.getToken();
            if (token !== null) {
                await EndpointRequest.process2("auth:logout");
            }
            this.clearUser(true);
            window.location.assign(GembaseUtils.getRootUrl());
        },
        async fakeLogout() {
            await EndpointRequest.process2("auth:fake_logout");
            useRouterStore().to(RoutesEnum.PORTAL_GUIDE, {reloadPage: true});
        },
        isAdmin(): boolean {
            return this.hideAdminFlag === false && this.data.isAuthenticated && (this.data.user.role === 1 || this.data.user.role === 3);
        },
        getDefaultRoute(): string {
            if (this.data.landingPageAfterSignIn !== null &&
                this.data.landingPageAfterSignIn !== undefined) {
                const r = this.data.landingPageAfterSignIn;
                this.data.landingPageAfterSignIn = null;
                return r as string;
            }

            return RoutesEnum.PORTAL_GUIDE;
        },
        async onBeforeEachRoute(to: RouteLocationNormalized, from: RouteLocationNormalized): Promise<boolean> {
            const meta = to.meta as IGembaseRouteMeta;

            if (meta.requiresAuth) {
                await this.tryAuth();
                if (!this.data.isAuthenticated) {
                    this.data.landingPageAfterSignIn = to.name;
                    await routerStore.to(RoutesEnum.SIGN_IN);
                    return true;
                }
            }

            if (meta.admin) {
                await this.tryAuth();
                if (!this.isAdmin()) {
                    if (meta.user !== this.data.user.guid) {
                        await routerStore.to(RoutesEnum.PORTAL_GUIDE);
                        return true;
                    }
                }
            }

            return false;
        },
        async updateUser(name: string, positionRole: number, positionArea: number) {
            await EndpointRequest.process2("portal:update_user", {
                name: name,
                position_role: positionRole,
                position_area: positionArea
            });
            this.data.user.name = name;
            this.data.user.position_role = positionRole;
            this.data.user.position_area = positionArea;
        },
        async requestPasswordChange() {
            await EndpointRequest.process2("portal:request_password_change");
        }
    },
    getters: {
        isOrganization(): boolean {
            return this.data.user?.organization !== null;
        },
        isOrganizationAdmin(): boolean {
            return this.data.user?.organization?.role === "admin";
        },
        firstName(): string {
            const arr = this.data.user.name.split(" ");
            return arr[0];
        },
        isLogged(): boolean {
            return this.data.isAuthenticated;
        }
    }
});

// used in AuthRoutesGuard
export function getBeforeEachRouteGuard(): (to: RouteLocationNormalized, from: RouteLocationNormalized) => void {
    return useAuthStore().onBeforeEachRoute;
}
