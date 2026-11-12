<script setup lang="ts">
import { onMounted, ref } from 'vue'
import GbButton from '@/views/ui/buttons/GbButton.vue'
import PortalUiRouterLink from '@/views/ui/router/PortalUiRouterLink.vue'
import GembaseUiSelect from '@/views/ui/GembaseUiSelect.vue'
import { usePortalStore } from '@/models/portal/PortalStore'
import { type SelectOptionItem } from '@/views/ui/UiData'
import { type DeveloperHint } from '@/models/portal/PortalDataTypes'
import { useAppsStore } from '@/models/portal/apps/AppsStore'
import PlatformDeveloperSearch from '@/views/platform/modules/__components/PlatformDeveloperSearch.vue'
import { useFullscreenLoading } from '@/models/ui/FullscreenLoadingComposable'
import { useQueryModel } from '@/router/queryModelComposable'
import { adminCommands, type IConfirmWhitelistEmailInput } from '@/commands/adminCommands'
import ClientError from '@/errors/clientError'
import { PORTAL_ROUTES } from '@/router/routes/PortalRoutes'

const emailRequestState = ref<'blocked' | 'email_whitelisted' | 'ok' | undefined>()
const email = ref<string>()
const requestId = ref<string>()
const userName = ref('')
const startupTitle = ref('')
const existingDev = ref<DeveloperHint>()
const isExistingDev = ref(true)
const devId = ref()
const userPositionArea = ref(0)
const userPositionRole = ref(0)
const confirmed = ref(false)
const positionRoleItems = ref<Array<SelectOptionItem>>([])
const positionAreaItems = ref<Array<SelectOptionItem>>([])

const portalStore = usePortalStore()
const fullscreenLoading = useFullscreenLoading()

const query = useQueryModel<{
    email?: string
    userName?: string
    devId?: string
    requestId?: string
}>({}).query

onMounted(async () => {
    positionRoleItems.value.length = 0
    positionAreaItems.value.length = 0

    portalStore.userPositionRoleDef.forEach((x) => {
        positionRoleItems.value.push({
            id: x.id.toString(),
            value: x.value,
        })
    })

    portalStore.userPositionAreaDef.forEach((x) => {
        positionAreaItems.value.push({
            id: x.id.toString(),
            value: x.value,
        })
    })

    email.value = query.value.email
    userName.value = query.value.userName ?? ``
    devId.value = query.value.devId
    requestId.value = query.value.requestId

    if (email.value !== undefined) {
        emailRequestState.value = await adminCommands.whitelistEmailRequest({
            email: email.value,
        })
    }

    if (devId.value != undefined) {
        const devsDetails = await useAppsStore().getDevsDetailsAsync([devId.value])
        const devDetail = devsDetails.find((x) => x.dev_id === devId.value)

        if (devDetail === undefined) {
            throw new ClientError(`Developer ${devId.value} not found`)
        }

        isExistingDev.value = true
        existingDev.value = {
            dev_id_in_store: devDetail.dev_id_in_store ?? '',
            store: devDetail.store,
            title: devDetail.title,
        }
    }
})

let confirmProgress = false

async function onConfirm() {
    if (confirmProgress || confirmed.value === true) {
        return
    }

    fullscreenLoading.show()

    confirmProgress = true

    if (email.value === undefined) {
        throw new ClientError(`Email is undefined`)
    }

    if (requestId.value === undefined) {
        throw new ClientError(`Email is undefined`)
    }

    const data: IConfirmWhitelistEmailInput = {
        email: email.value,
        name: userName.value,
        position_role: userPositionRole.value,
        position_area: userPositionArea.value,
        dev_id_in_store: '',
        dev_store: 0,
        dev_concept_title: '',
        request_id: requestId.value,
        dev_id: devId.value,
    }

    if (isExistingDev.value) {
        if (existingDev.value !== undefined) {
            data.dev_id_in_store = existingDev.value.dev_id_in_store
            data.dev_store = existingDev.value?.store
        }
    } else {
        data.dev_concept_title = startupTitle.value
    }

    await adminCommands.confirmWhitelistEmail(data)
    confirmed.value = true
    confirmProgress = false

    fullscreenLoading.hide()
}
</script>

<template>
    <div class="p-1">
        <div class="pb-5">Whitelist email: {{ email }}</div>
        <div v-if="emailRequestState === 'email_whitelisted'">Email is already whitelisted.</div>
        <div v-else-if="emailRequestState === 'blocked'">Email is blocked.</div>
        <div v-else-if="emailRequestState === 'ok'">
            <div v-if="confirmed">
                <div>Email has been whitelisted.</div>
                <portal-ui-router-link
                    :path="PORTAL_ROUTES.ACCOUNT_ADMIN_EMAIL_COMPOSER"
                    :query-records="{ email: email, template: 'invite_by_user' }"
                >
                    <gb-button
                        class="gbc-bg-secondary"
                        icon="email"
                        text="Open invite mail composer"
                    ></gb-button>
                </portal-ui-router-link>
            </div>
            <div v-else class="text-sm">
                <div class="gb-layout-tl gap-2">
                    <div class="gb-layout-tl-row gap-2">
                        <div>Name</div>
                        <input type="text" v-model="userName" />
                    </div>
                    <div class="gb-layout-tl-row gap-2">
                        <div>Position</div>
                        <div class="gb-layout-tl-row gap-2">
                            <gembase-ui-select
                                placeholder="Choose item"
                                class="w-[190px]"
                                @on-change="(item) => (userPositionArea = parseInt(item.id))"
                                :selected="userPositionArea.toString()"
                                :items="positionAreaItems"
                            >
                            </gembase-ui-select>
                            <gembase-ui-select
                                placeholder="Choose item"
                                class="w-[190px]"
                                @on-change="(item) => (userPositionRole = parseInt(item.id))"
                                :selected="userPositionRole.toString()"
                                :items="positionRoleItems"
                            >
                            </gembase-ui-select>
                        </div>
                    </div>
                    <div v-if="devId !== undefined">
                        <div>Developer: {{ existingDev?.title }}</div>
                    </div>
                    <div v-else>
                        <div class="gb-layout-tl-row gap-2">
                            <input type="checkbox" v-model="isExistingDev" />
                            <div>Existing developer</div>
                        </div>
                        <div v-if="isExistingDev" class="gb-layout-tl-row gap-2">
                            <div>Search developer:</div>
                            <div class="w-[300px] h-[30px]">
                                <platform-developer-search
                                    :initial-dev="existingDev"
                                    :include-concepts="true"
                                    data-tooltip="Search developer"
                                    placeholder="Enter company name"
                                    @on-hint-selected="(data) => (existingDev = data)"
                                ></platform-developer-search>
                            </div>
                        </div>
                        <div v-else class="gb-layout-tl-row gap-2">
                            <div>Startup name:</div>
                            <input type="text" v-model="startupTitle" />
                        </div>
                    </div>
                </div>
                <gb-button
                    @click="onConfirm"
                    class="gbc-bg-secondary mt-3"
                    icon="check_single"
                    text="Confirm"
                ></gb-button>
            </div>
        </div>
    </div>
</template>
