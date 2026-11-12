<template>
    <div class="text-[14px]">
        <div class="pt-2 pb-2">
            <div class="gb-layout-ml-row gap-1">
                <div>Show pending only:</div>
                <input type="checkbox" v-model="onlyPending" />
            </div>
        </div>
        <table class="gb-admin-table">
            <tr>
                <td>Request ID</td>
                <td>Date</td>
                <td>User</td>
                <td>App</td>
                <td>Detail</td>
                <td>State</td>
            </tr>
            <tr v-for="data in filteredData" :key="data.request_id">
                <td>{{ data.request_id }}</td>
                <td>{{ GembaseUtils.timestampToShortDate(data.t) }}</td>
                <td>{{ data.email }}</td>
                <td>
                    <div class="gb-layout-row gap-1">
                        <img
                            class="w-[20px] h-[20px]"
                            :src="AppDetailUtils.getIcon(data.app_detail)"
                        />
                        <div>
                            <portal-ui-router-link
                                :path="PORTAL_ROUTES.PORTAL_MY_APPS"
                                :query-records="{ appId: data.app_detail.app_id }"
                            >
                                {{ data.app_detail.title }}
                            </portal-ui-router-link>
                        </div>
                    </div>
                </td>
                <td>
                    <gb-button
                        @click="onDetail(data)"
                        class="gbc-bg-primary"
                        icon="edit_question"
                    ></gb-button>
                </td>
                <td :data-state="data.state">{{ data.state }}</td>
            </tr>
        </table>
        <gb-popup v-model="editLabelsPopup">
            <auditor-app-fix-wrong-labels-popup
                v-if="currentApp !== undefined"
                :before-tags="requestDetail?.before_tags"
                :readonly="requestDetail?.state !== 'pending'"
                :from-admin="true"
                :override-tags="requestDetail?.request_tags"
                @confirmed="onConfirm"
                @rejected="onReject"
                @close="editLabelsPopup = false"
                :app="currentApp"
            ></auditor-app-fix-wrong-labels-popup>
        </gb-popup>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { type TagDetail } from '@/models/portal/apps/AppsData'
import GbButton from '@/views/ui/buttons/GbButton.vue'
import AuditorAppFixWrongLabelsPopup from '@/views/platform/modules/auditor/__components/__components/AuditorAppFixWrongLabelsPopup.vue'
import GbPopup from '@/views/ui/popups/GbPopup.vue'
import { AppDetailUtils } from '@/models/portal/apps/AppDetailUtils'
import PortalUiRouterLink from '@/views/ui/router/PortalUiRouterLink.vue'
import { type AuditorQueryParams } from '@/models/portal/auditor/AuditorData'
import GembaseUtils from '@/utils/GembaseUtils'
import { useFullscreenLoading } from '@/models/ui/FullscreenLoadingComposable'
import { adminCommands, type IRequestAppTagsChangesData } from '@/commands/adminCommands'
import { useQueryModel } from '@/router/queryModelComposable'
import { PORTAL_ROUTES } from '@/router/routes/PortalRoutes'

const editLabelsPopup = ref(false)
const requestDetail = ref<IRequestAppTagsChangesData>()
const fullscreenLoading = useFullscreenLoading()

const requestAppTagsChangesData = ref<IRequestAppTagsChangesData[]>([])
const onlyPending = ref(true)

const query = useQueryModel<{ requestId?: string }>({}).query

onMounted(async () => {
    fullscreenLoading.show()

    requestAppTagsChangesData.value = await adminCommands.getRequestTagsOverrideByUser()

    const requestId = query.value.requestId
    if (requestId !== undefined) {
        const requestIdInt = parseInt(requestId)
        const data = requestAppTagsChangesData.value.find((x) => x.request_id === requestIdInt)
        if (data !== undefined) {
            onDetail(data)
        }
    }

    fullscreenLoading.hide()
})

const filteredData = computed(() => {
    const res: IRequestAppTagsChangesData[] = []

    requestAppTagsChangesData.value.forEach((x) => {
        if (onlyPending.value === true && x.state !== 'pending') {
            return
        }
        res.push(x)
    })

    return res
})

const currentApp = computed(() => {
    if (requestDetail.value !== undefined) {
        return requestDetail.value?.app_detail
    }
    return undefined
})

async function onConfirm(tags: TagDetail[]) {
    fullscreenLoading.show()

    if (requestDetail.value !== undefined) {
        await adminCommands.confirmRequestTagsOverrideByUser({
            request_id: requestDetail.value.request_id,
            tags: tags,
        })
        requestDetail.value.request_tags = tags
        requestDetail.value.state = 'accepted'
    }

    requestDetail.value = undefined
    editLabelsPopup.value = false

    fullscreenLoading.hide()
}

async function onReject() {
    fullscreenLoading.show()

    if (requestDetail.value !== undefined) {
        await adminCommands.rejectRequestTagsOverrideByUser({
            request_id: requestDetail.value.request_id,
        })

        requestDetail.value.state = 'rejected'
    }

    requestDetail.value = undefined
    editLabelsPopup.value = false

    fullscreenLoading.hide()
}

function onDetail(data: IRequestAppTagsChangesData) {
    requestDetail.value = data
    editLabelsPopup.value = true
}
</script>

<style scoped>
* {
    @apply data-[state="accepted"]:text-dim-ocean data-[state="rejected"]:text-dim-magenta data-[state="pending"]:text-yellow;
}
</style>
