import { defineStore } from 'pinia'
import {
    type RegistrationConfirmDef,
    type RegistrationQueryParams,
    type RegistrationUserData,
} from '@/models/portal/registration/RegistrationData'
import GembaseUtils from '@/utils/GembaseUtils'
import { ref } from 'vue'
import { useQueryModel } from '@/router/queryModelComposable'
import { usersCommands } from '@/commands/usersCommands'
import router from '@/router'
import ClientError from '@/errors/clientError'
import { useSessionStore } from '@/stores/SessionStore'
import { BaseCommands } from '@/commands/base/baseCommands'
import { HOME_ROUTES } from '@/router/routes/HomeRoutes'
import { PORTAL_ROUTES } from '@/router/routes/PortalRoutes'

export const useRegistrationStore = defineStore('registrationStore', () => {
    const registrationConfirmDef = ref<RegistrationConfirmDef>()
    const show = ref<'password' | 'personal' | 'whitelist_pending'>('password')
    const query = useQueryModel<RegistrationQueryParams>({}).query
    const sessionStore = useSessionStore()

    async function getEmailSubscriptionState() {
        return await usersCommands.getEmailSubscriptionState({ request_guid: query.value.request! })
    }

    async function setEmailSubscription(subscribed: boolean) {
        await usersCommands.setEmailSubscriptionState({
            subscribed: subscribed,
        })
    }

    async function getChangePasswordData() {
        const data = await usersCommands.getChangePasswordData({
            request_guid: query.value.request!,
        })
        if (data !== undefined && data !== null && data.email !== undefined) {
            return data.email
        } else {
            return undefined
        }
    }

    async function changePassword(password: string) {
        await usersCommands.changePassword({
            request_guid: query.value.request!,
            password: password,
        })

        await router.push(HOME_ROUTES.HOME_SIGN_IN)
    }

    async function getRegistrationConfirmDef() {
        registrationConfirmDef.value = await usersCommands.getRegistrationConfirmDef({
            request_guid: query.value.request!,
            email: query.value.email!,
        })
        if (registrationConfirmDef.value.state === 'whitelist_pending') {
            show.value = 'whitelist_pending'
        } else if (registrationConfirmDef.value.state === 'platform') {
            await router.push(PORTAL_ROUTES.PORTAL_HOME)
        } else if (registrationConfirmDef.value.state === 'register') {
            show.value = 'password'
        } else {
            throw new ClientError(`Unknown response`)
        }
    }

    async function confirmRegistration(data: RegistrationUserData) {
        const response = await usersCommands.confirmRegistrationRequest({
            request_guid: query.value.request!,
            name: data.name,
            position_role: data.position_role,
            position_area: data.position_area,
            password: data.password,
        })

        if (response.state === 'created') {
            if (response.login_data !== undefined) {
                BaseCommands.setAuthToken(response.login_data.auth_token)
                await sessionStore.verifyUserIsLoggedOnServer()
            }
            await router.push(PORTAL_ROUTES.PORTAL_HOME)
        } else if (response.state === 'updated') {
            router.push({ path: PORTAL_ROUTES.PORTAL_HOME, query: { reload_page: 'true' } })
        } else {
            await router.push(HOME_ROUTES.HOME_INDEX)
        }
    }

    async function registerByEmail(email: string) {
        if (!GembaseUtils.isValidEmail(email)) {
            return
        }

        if (!useSessionStore().isLogged) {
            await usersCommands.registrationByEmail({
                email: email,
            })
        } else {
            await usersCommands.registrationByInvite({
                email: email,
            })
        }
    }

    async function confirmTos() {
        const response = await usersCommands.confirmTos()
        if (response.state === 'ok') {
            sessionStore.userData.tos_agree_t = GembaseUtils.serverTimestamp()
            await router.push(PORTAL_ROUTES.PORTAL_HOME)
        }
    }

    return {
        confirmTos,
        registerByEmail,
        confirmRegistration,
        getRegistrationConfirmDef,
        changePassword,
        getChangePasswordData,
        setEmailSubscription,
        getEmailSubscriptionState,
        show,
        registrationConfirmDef,
    }
})
