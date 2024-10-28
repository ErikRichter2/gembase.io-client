import {defineStore} from "pinia";
import {
    RegistrationConfirmDef,
    RegistrationQueryParams,
    RegistrationUserData
} from "@/models/portal/registration/RegistrationData";
import EndpointRequest from "@/core/requests/EndpointRequest";
import {RoutesEnum} from "@/router/RoutesEnum";
import ClientError from "@/core/errors/ClientError";
import {recaptchaModel} from "@/models/external/recaptcha/RecaptchaModel";
import {useAuthStore} from "@/models/auth/AuthStore";
import GembaseUtils from "@/utils/GembaseUtils";
import {LoginCredentialsResponse} from "@/models/auth/AuthResponse";
import {useRouterStore} from "@/core/router/RouterStore";
import {useRouterQuery} from "@/core/router/query/RouterQueryComposable";

const authStore = useAuthStore();

export const useRegistrationStore = defineStore('registrationStore', {
    state: () => ({
        registrationConfirmDef: undefined as RegistrationConfirmDef | undefined,
        show: "password" as "password" | "personal" | "whitelist_pending",
        routerQuery: useRouterQuery<RegistrationQueryParams>()
    }),
    actions: {
        async getEmailSubscriptionState() {
            return await EndpointRequest.process2<boolean>("registration:get_email_subscription_state", {
                request_guid: this.routerQuery.query.request
            });
        },
        async setEmailSubscription(subscribed: boolean) {
            await EndpointRequest.process2<number>("registration:set_email_subscription_state", {
                request_guid: this.routerQuery.query.request,
                subscribed: subscribed
            });
        },
        async getChangePasswordData() {
            const data = await EndpointRequest.process2<{
                email?: string
            }>("registration:get_change_password_data", {
                request_guid: this.routerQuery.query.request
            });
            if (data !== undefined && data !== null && data.email !== undefined) {
                return data.email;
            } else {
                return undefined;
            }
        },
        async changePassword(password: string) {
            const recaptchaToken = await recaptchaModel.execute("change_password");

            await EndpointRequest.process2<{
                state: "ok"
            }>("registration:change_password", {
                request_guid: this.routerQuery.query.request,
                password: password,
                recaptcha_token: recaptchaToken
            });

            await useRouterStore().to(RoutesEnum.SIGN_IN);
        },
        async getRegistrationConfirmDef() {
            let test = false;
            if (this.routerQuery.query.test !== undefined) {
                test = true;
            }
            this.registrationConfirmDef = await EndpointRequest.process2<RegistrationConfirmDef>("registration:get_registration_confirm_def", {
                request_guid: this.routerQuery.query.request,
                test: test,
                email: this.routerQuery.query.email
            });
            if (this.registrationConfirmDef.state === "whitelist_pending") {
                this.show = "whitelist_pending";
            } else if (this.registrationConfirmDef.state === "platform") {
                await useRouterStore().to(RoutesEnum.PORTAL_GUIDE);
            } else if (this.registrationConfirmDef.state === "register") {
                this.show = "password";
            } else {
                throw new ClientError(`Unknown response`);
            }
        },
        async confirmRegistration(data: RegistrationUserData) {
            const response = await EndpointRequest.process2<{
                state: "created" | "updated" | "error",
                login_data?: LoginCredentialsResponse
            }>("registration:confirm_registration_request", {
                request_guid: this.routerQuery.query.request,
                name: data.name,
                position_role: data.position_role,
                position_area: data.position_area,
                password: data.password
            });

            if (response.state === "created") {
                if (response.login_data !== undefined) {
                    await authStore.setUser(response.login_data.user_data, response.login_data.client_token);
                }
                await useRouterStore().to(RoutesEnum.PORTAL_GUIDE);
            } else if (response.state === "updated") {
                useRouterStore().to(RoutesEnum.PORTAL_GUIDE, {reloadPage: true});
            } else {
                await useRouterStore().to(RoutesEnum.HOME_INDEX);
            }
        },
        async registerByEmail(email: string) {
            if (!GembaseUtils.isValidEmail(email)) {
                return;
            }

            if (!authStore.isLogged) {
                const recaptchaToken = await recaptchaModel.execute("register");
                await EndpointRequest.process2("registration:by_email", {
                    email: email,
                    recaptcha_token: recaptchaToken
                });
            } else {
                await EndpointRequest.process2("registration:invite_by_user", {
                    email: email
                });
            }
        },
        async confirmTos() {
            const response = await EndpointRequest.process2<{
                state: "ok"
            }>("registration:confirm_tos");
            if (response.state === "ok") {
                authStore.data.user.tos_agree_t = GembaseUtils.serverTimestamp();
                await useRouterStore().to(RoutesEnum.PORTAL_GUIDE);
            }
        }
    }
});