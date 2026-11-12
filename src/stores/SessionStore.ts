import { BaseCommands } from '@/commands/base/baseCommands'
import { portalCommands } from '@/commands/portalCommands'
import { publicCommands, type IUserData } from '@/commands/publicCommands'
import ClientError from '@/errors/clientError'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useSessionStore = defineStore('session-store', () => {
    const _userData = ref<IUserData>()

    async function verifyUserIsLoggedOnServer() {
        const res = await publicCommands.getLoggedUserData()
        if (res.user_id != null) {
            _userData.value = res
        }
    }

    async function loginCredentials(params: { email: string; password_raw: string }) {
        const loginCredentialsResponse = await publicCommands.loginCredentials(params)

        if (loginCredentialsResponse.error_id === undefined) {
            BaseCommands.setAuthToken(loginCredentialsResponse.auth_token)
            _userData.value = loginCredentialsResponse.user_data
        }

        return loginCredentialsResponse.error_id
    }

    async function loginDemo() {
        if (isLogged.value) {
            return undefined
        }

        return loginCredentials({
            email: 'demo@erichter.online',
            password_raw: 'demo',
        })
    }

    async function logout() {
        await publicCommands.logout()
        BaseCommands.setAuthToken(undefined)
        _userData.value = undefined
    }

    const isLogged = computed(() => _userData.value !== undefined)
    const isAdmin = computed(() => isLogged.value && userData.value.role === `admin`)

    const isOrganization = computed(
        () => isLogged.value && userData.value.organization !== undefined,
    )
    const isOrganizationAdmin = computed(
        () => isLogged.value && userData.value.organization?.role === `admin`,
    )
    const firstName = computed(() => isLogged.value && userData.value.name.split(' ')[0])

    const userData = computed(() => {
        if (_userData.value === undefined) {
            throw new ClientError('User not logged')
        }
        return _userData.value
    })

    async function requestPasswordChange() {
        publicCommands.requestPasswordChange({ email: userData.value.email })
    }

    async function updateUser(name: string, positionRole: number, positionArea: number) {
        await portalCommands.updateUser({
            name: name,
            position_role: positionRole,
            position_area: positionArea,
        })
        userData.value.name = name
        userData.value.position_role = positionRole
        userData.value.position_area = positionArea
    }

    return {
        isLogged,
        isAdmin,
        userData,
        isOrganization,
        isOrganizationAdmin,
        firstName,
        verifyUserIsLoggedOnServer,
        loginCredentials,
        loginDemo,
        logout,
        requestPasswordChange,
        updateUser,
    }
})
