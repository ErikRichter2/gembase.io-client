<script setup lang="ts">
import {usePortalStore} from "@/models/portal/PortalStore";
import {onMounted, ref} from "vue";
import GembaseUiSelect from "@/views/ui/GembaseUiSelect.vue";
import GembaseUiCompanyInput from "@/views/ui/GembaseUiCompanyInput.vue";
import {SelectOptionItem} from "@/views/ui/UiData";
import {useAuthStore} from "@/models/auth/AuthStore";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import GbWindow from "@/views/ui/popups/GbWindow.vue";
import {useFullscreenLoading} from "@/models/ui/FullscreenLoadingComposable";

const authStore = useAuthStore();
const portalStore = usePortalStore();
const fullscreenLoading = useFullscreenLoading();

const positionRoleItems = ref<Array<SelectOptionItem>>([])
const positionAreaItems = ref<Array<SelectOptionItem>>([])

const changedName = ref("");
const changedPositionArea = ref<number>(0);
const changedPositionRole = ref<number>(0);

onMounted(() => {

    changedName.value = authStore.data.user.name;
    changedPositionArea.value = authStore.data.user.position_area;
    changedPositionRole.value = authStore.data.user.position_role;

    positionRoleItems.value.length = 0;
    for (let i = 0; i < portalStore.userPositionRoleDef.length; ++i) {
        positionRoleItems.value.push({
            id: portalStore.userPositionRoleDef[i].id.toString(),
            value: portalStore.userPositionRoleDef[i].value
        })
    }

    positionAreaItems.value.length = 0;
    for (let i = 0; i < portalStore.userPositionAreaDef.length; ++i) {
        positionAreaItems.value.push({
            id: portalStore.userPositionAreaDef[i].id.toString(),
            value: portalStore.userPositionAreaDef[i].value
        })
    }
});

async function onConfirm() {
    fullscreenLoading.show();
    await authStore.updateUser(changedName.value, changedPositionRole.value, changedPositionArea.value);
    fullscreenLoading.hide()
}
</script>

<template>
    <gb-window header="Please fill in your account details!" :hide-close="true">
        <div class="gb-layout-tl gap-2">
            <div class="gb-inner-window p-5">
                <div class="gb-layout-tl gap-2">
                    <div class="gb-layout-row">
                        <div class="w-[120px]">Name</div>
                        <input v-model="changedName" tabindex="1" class="pl-3 w-[400px]">
                    </div>
                    <div class="gb-layout-row w-full">
                        <div class="w-[120px] min-w-[120px]">Company</div>
                        <gembase-ui-company-input class="w-full" :readonly="true" :dev-detail="authStore.data.user.dev_detail" tabindex="2"></gembase-ui-company-input>
                    </div>
                    <div class="gb-layout-row">
                        <div class="w-[120px]">Position</div>
                        <div class="gb-layout-row w-[400px] gap-4">
                            <gembase-ui-select placeholder="Choose area ..." tabindex="1" style="--gb-ui-select-width: 190px;" @on-change="item => changedPositionArea = parseInt(item.id)" :selected="changedPositionArea.toString()" :items="positionAreaItems">
                            </gembase-ui-select>
                            <gembase-ui-select placeholder="Choose role ..." tabindex="2" style="--gb-ui-select-width: 190px;" @on-change="item => changedPositionRole = parseInt(item.id)" :selected="changedPositionRole.toString()" :items="positionRoleItems">
                            </gembase-ui-select>
                        </div>
                    </div>
                </div>
            </div>
            <div class="gb-layout-mr-row pt-1 pb-1 w-[calc(100%-20px)] pl-5">
                <gb-button @click="onConfirm" class="gbc-bg-primary" icon="check_single" text="Confirm"></gb-button>
            </div>
        </div>
    </gb-window>
</template>
