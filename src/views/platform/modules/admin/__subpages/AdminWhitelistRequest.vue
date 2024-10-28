<script setup lang="ts">
import {onMounted, ref} from "vue";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import PortalUiRouterLink from "@/views/ui/router/PortalUiRouterLink.vue";
import {RoutesEnum} from "@/router/RoutesEnum";
import EndpointRequest from "@/core/requests/EndpointRequest";
import GembaseUiSelect from "@/views/ui/GembaseUiSelect.vue";
import {usePortalStore} from "@/models/portal/PortalStore";
import {SelectOptionItem} from "@/views/ui/UiData";
import {DeveloperHint} from "@/models/portal/PortalDataTypes";
import {useRouterStore} from "@/core/router/RouterStore";
import {useAppsStore} from "@/models/portal/apps/AppsStore";
import ClientError from "@/core/errors/ClientError";
import PlatformDeveloperSearch from "@/views/platform/modules/__components/PlatformDeveloperSearch.vue";
import {useFullscreenLoading} from "@/models/ui/FullscreenLoadingComposable";

const emailRequestState = ref<"blocked" | "email_whitelisted" | "ok" | undefined>();
const email = ref<string>();
const requestId = ref<string>();
const userName = ref("");
const startupTitle = ref("");
const existingDev = ref<DeveloperHint>();
const isExistingDev = ref(true);
const devId = ref();
const userPositionArea = ref(0);
const userPositionRole = ref(0);
const confirmed = ref(false);
const positionRoleItems = ref<Array<SelectOptionItem>>([]);
const positionAreaItems = ref<Array<SelectOptionItem>>([]);


const portalStore = usePortalStore();
const fullscreenLoading = useFullscreenLoading();

onMounted(async () => {
    positionRoleItems.value.length = 0;
    positionAreaItems.value.length = 0;

    portalStore.userPositionRoleDef.forEach((x) => {
        positionRoleItems.value.push({
            id: x.id.toString(),
            value: x.value
        });
    });

    portalStore.userPositionAreaDef.forEach((x) => {
        positionAreaItems.value.push({
            id: x.id.toString(),
            value: x.value
        });
    });

    email.value = useRouterStore().getQueryKey("email");
    userName.value = useRouterStore().getQueryKey("name") ?? "";
    devId.value = useRouterStore().getQueryKey("dev_id");
    requestId.value = useRouterStore().getQueryKey("request");

    emailRequestState.value = await EndpointRequest.process2<"blocked" | "email_whitelisted" | "ok" | undefined>("admin:whitelist_email_request", {
        email: email.value
    });

    if (devId.value != undefined) {
        const devsDetails = await useAppsStore().getDevsDetailsAsync([devId.value]);
        const devDetail = devsDetails.find((x) => x.dev_id === devId.value);

        if (devDetail === undefined) {
            throw new ClientError(`Developer ${devId.value} not found`)
        }

        isExistingDev.value = true;
        existingDev.value = {
            dev_id_in_store: devDetail.dev_id_in_store ?? "",
            store: devDetail.store,
            title: devDetail.title
        }
    }
});

let confirmProgress = false;

async function onConfirm() {

    if (confirmProgress || confirmed.value === true) {
        return;
    }

    fullscreenLoading.show();

    confirmProgress = true;

    const data = {
        email: email.value,
        name: userName.value,
        position_role: userPositionRole.value,
        position_area: userPositionArea.value,
        dev_id_in_store: "",
        dev_store: 0,
        dev_concept_title: "",
        request_id: requestId.value,
        dev_id: devId.value
    }

    if (isExistingDev.value) {
        if (existingDev.value !== undefined) {
            data.dev_id_in_store = existingDev.value.dev_id_in_store;
            data.dev_store = existingDev.value?.store;
        }
    } else {
        data.dev_concept_title = startupTitle.value;
    }

    await EndpointRequest.process2("admin:confirm_whitelist_email", data);
    confirmed.value = true;
    confirmProgress = false;

    fullscreenLoading.hide();
}

</script>

<template>
    <div class="p-1">
        <div class="pb-5">
            Whitelist email: {{email}}
        </div>
        <div v-if="emailRequestState === 'email_whitelisted'">
            Email is already whitelisted.
        </div>
        <div v-else-if="emailRequestState === 'blocked'">
            Email is blocked.
        </div>
        <div v-else-if="emailRequestState === 'ok'">
            <div v-if="confirmed">
                <div>Email has been whitelisted.</div>
                <portal-ui-router-link :name="RoutesEnum.ACCOUNT_ADMIN_EMAIL_COMPOSER" :query="{email: email, template: 'invite_by_user'}">
                    <gb-button class="gbc-bg-secondary" icon="email" text="Open invite mail composer"></gb-button>
                </portal-ui-router-link>
            </div>
            <div v-else class="text-sm">
                <div class="gb-layout-tl gap-2">
                    <div class="gb-layout-tl-row gap-2">
                        <div>Name</div>
                        <input type="text" v-model="userName">
                    </div>
                    <div class="gb-layout-tl-row gap-2">
                        <div>Position</div>
                        <div class="gb-layout-tl-row gap-2">
                            <gembase-ui-select placeholder="Choose item" class="w-[190px]" @on-change="item => userPositionArea = parseInt(item.id)" :selected="userPositionArea.toString()" :items="positionAreaItems">
                            </gembase-ui-select>
                            <gembase-ui-select placeholder="Choose item" class="w-[190px]" @on-change="item => userPositionRole = parseInt(item.id)" :selected="userPositionRole.toString()" :items="positionRoleItems">
                            </gembase-ui-select>
                        </div>
                    </div>
                    <div v-if="devId !== undefined">
                        <div>Developer: {{existingDev?.title}}</div>
                    </div>
                    <div v-else>
                        <div class="gb-layout-tl-row gap-2">
                            <input type="checkbox" v-model="isExistingDev">
                            <div>Existing developer</div>
                        </div>
                        <div v-if="isExistingDev" class="gb-layout-tl-row gap-2">
                            <div>Search developer:</div>
                            <div class="w-[300px] h-[30px]">
                                <platform-developer-search :initial-dev="existingDev" :include-concepts="true" data-tooltip="Search developer" placeholder="Enter company name" @on-hint-selected="(data) => existingDev = data"></platform-developer-search>
                            </div>
                        </div>
                        <div v-else class="gb-layout-tl-row gap-2">
                            <div>Startup name:</div>
                            <input type="text" v-model="startupTitle">
                        </div>
                    </div>
                </div>
                <gb-button @click="onConfirm" class="gbc-bg-secondary mt-3" icon="check_single" text="Confirm"></gb-button>
            </div>
        </div>
    </div>
</template>
