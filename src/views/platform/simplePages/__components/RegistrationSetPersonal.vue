<script setup lang="ts">

import {onMounted, ref} from "vue";
import {UserPositionAreaDef, UserPositionRoleDef} from "@/models/portal/definitions/DefinitionsData";
import {SelectOptionItem} from "@/views/ui/UiData";
import {
    RegistrationUserData
} from "@/models/portal/registration/RegistrationData";
import GembaseUiSelect from "@/views/ui/GembaseUiSelect.vue";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import GbWindow from "@/views/ui/popups/GbWindow.vue";

const positionRoleItems = ref<Array<SelectOptionItem>>([]);
const positionAreaItems = ref<Array<SelectOptionItem>>([]);

const __userData = ref<RegistrationUserData>({
    name: "",
    email: "",
    position_role: 0,
    position_area: 0,
    password: ""
});

const props = defineProps<{
    userData: RegistrationUserData,
    positionAreaDef?: UserPositionAreaDef[],
    positionRoleDef?: UserPositionRoleDef[],
    devTitle?: string
}>();

const emits = defineEmits<{
    (event: 'confirm', value: RegistrationUserData);
}>();

onMounted(() => {
    __userData.value = props.userData;

    positionRoleItems.value.length = 0;
    positionAreaItems.value.length = 0;

    if (props.positionRoleDef !== undefined) {
        for (let i = 0; i < props.positionRoleDef.length; ++i) {
            positionRoleItems.value.push({
                id: props.positionRoleDef[i].id.toString(),
                value: props.positionRoleDef[i].value
            });
        }
    }

    if (props.positionAreaDef !== undefined) {
        for (let i = 0; i < props.positionAreaDef.length; ++i) {
            positionAreaItems.value.push({
                id: props.positionAreaDef[i].id.toString(),
                value: props.positionAreaDef[i].value
            });
        }
    }
});

function onConfirm() {
    emits("confirm", __userData.value);
}

</script>

<template>
    <gb-window class="scoped-root" header="Please fill in your details to finish registration.">
        <div class="gb-inner-window">
            <div class="gb-layout-tl gap-2 p-2">
                <div class="gb-layout-tl-row">
                    <div class="w-[var(--label-w)]">Name</div>
                    <input class="w-[var(--input-w)]" v-model="__userData.name">
                </div>
                <div class="gb-layout-tl-row">
                    <div class="w-[var(--label-w)]">Company</div>
                    <input class="w-[var(--input-w)]" readonly :data-not-allowed="true" :value="devTitle">
                </div>
                <div class="gb-layout-tl-row">
                    <div class="w-[var(--label-w)]">Position</div>
                    <div class="gb-layout-tl-row gap-2">
                        <gembase-ui-select placeholder="Choose item" class="w-[190px]" @on-change="item => __userData.position_area = parseInt(item.id)" :selected="__userData.position_area.toString()" :items="positionAreaItems">
                        </gembase-ui-select>
                        <gembase-ui-select placeholder="Choose item" class="w-[190px]" @on-change="item => __userData.position_role = parseInt(item.id)" :selected="__userData.position_role.toString()" :items="positionRoleItems">
                        </gembase-ui-select>
                    </div>
                </div>
            </div>
        </div>
        <div class="gb-layout-tr-row w-full">
            <gb-button @click="onConfirm" class="gbc-bg-primary" icon="check_single" text="Confirm"></gb-button>
        </div>
    </gb-window>
</template>

<style scoped>
.scoped-root {
  --label-w: 120px;
  --input-w: 390px;
}
</style>
