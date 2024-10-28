<script setup lang="ts">

import {useBillingStore} from "@/models/portal/billing/BillingStore";
import {onMounted, ref, watch} from "vue";
import {EBillingModuleId, PortalConstants} from "@/models/portal/PortalConstants";
import {RoutesEnum} from "@/router/RoutesEnum";
import GembaseUtils from "@/utils/GembaseUtils";
import {TUserId} from "@/models/user/UserData";
import {useAuthStore} from "@/models/auth/AuthStore";
import {useUiStore} from "@/models/ui/UiStore";
import {usePortalStore} from "@/models/portal/PortalStore";
import GbPopup from "@/views/ui/popups/GbPopup.vue";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import GbWindow from "@/views/ui/popups/GbWindow.vue";
import {useRouterStore} from "@/core/router/RouterStore";
import GbSvg from "@/views/ui/icons/GbSvg.vue";
import AccountLicenceTooltip from "@/views/platform/modules/account/__subpages/__components/AccountLicenceTooltip.vue";
import {ModulesPerUserView, ModuleSummaryView, UserView} from "@/models/portal/billing/BillingData";

const authStore = useAuthStore();
const uiStore = useUiStore();
const billingStore = useBillingStore();

const remainingTooltip = ref<EBillingModuleId>();
const discardEditChangesPopup = ref(false);

const userTooltip = ref<{
    moduleId: EBillingModuleId,
    userOrRequestGuid: TUserId
}>();

const statusMouseOver = ref<string>();
const requestStatusMouseOver = ref<string>();
const organizationMembers = ref<UserView[]>([]);
const modulesSummary = ref<ModuleSummaryView[]>([]);

const showSaveChanges = ref(false);

onMounted(async () => {
    await billingStore.init();
    createData();
});

watch(() => billingStore.billingData, createData);

function createData() {
    modulesSummary.value = billingStore.getModulesSummaryView;

    function getUsedModule(userOrRequestGuid: TUserId | string, moduleId: EBillingModuleId) {
        for (let i = 0; i < modulesSummary.value.length; ++i) {
            const ms = modulesSummary.value[i];
            if (ms.moduleId === moduleId) {
                for (let j = 0; j < ms.usedSeats.length; ++j) {
                    if (ms.usedSeats[j].userOrRequestGuid === userOrRequestGuid) {
                        return ms.usedSeats[j];
                    }
                }
            }
        }
        return null;
    }

    organizationMembers.value.length = 0;

    billingStore.billingData.organization_members.forEach((x) => {
        const u: UserView = {
            userOrRequestGuid: x.user_guid,
            email: x.email,
            positionRole: usePortalStore().getPosition(x.position_area, x.position_role),
            modules: [],
            active: x.active
        }
        organizationMembers.value.push(u);
        PortalConstants.billingModules.forEach((y) => {
            const usedModule = getUsedModule(x.user_guid, y.id);
            if (usedModule !== null) {
                u.modules.push({
                    billingGuid: usedModule.billingGuid,
                    moduleId: y.id,
                    active: true
                });
            } else {
                u.modules.push({
                    moduleId: y.id,
                    active: false
                });
            }
        });
    });

    billingStore.billingData.organization_requests.forEach((x) => {
        const u: UserView = {
            userOrRequestGuid: x.request_guid,
            email: x.email,
            positionRole: "",
            modules: [],
            active: false,
            isRequest: true,
            sentRequest: x.sent_request_t !== null
        }
        organizationMembers.value.push(u);
        PortalConstants.billingModules.forEach((y) => {
            const usedModule = getUsedModule(x.request_guid, y.id);
            if (usedModule !== null) {
                u.modules.push({
                    billingGuid: usedModule.billingGuid,
                    moduleId: y.id,
                    active: true
                });
            } else {
                u.modules.push({
                    moduleId: y.id,
                    active: false
                });
            }
        });
    });
}

function onAddAccount() {
    const modules: ModulesPerUserView[] = [];
    PortalConstants.billingModules.forEach((x) => {
        modules.push({
            moduleId: x.id,
            active: false
        })
    });
    organizationMembers.value.push({
        userOrRequestGuid: GembaseUtils.guid(),
        active: true,
        email: "",
        positionRole: "",
        modules: modules,
        isNew: true
    });
    showSaveChanges.value = true;
}

async function onSaveChanges() {

    organizationMembers.value.forEach((x) => {
        if (x.isNew) {
            if (!GembaseUtils.isValidEmail(x.email)) {
                uiStore.showErrorPopupDefault(`${x.email} is not a valid email`);
                return;
            }
            const domain = GembaseUtils.getEmailDomain(x.email);
            if (!billingStore.billingData.organization_domains.includes(domain)) {
                const allowedDomains = billingStore.billingData.organization_domains.join(", ");
                uiStore.showErrorPopupDefault(`${x.email} is not allowed. All emails must be from following domains: ${allowedDomains}`);
                return;
            }
            let cnt = 0;
            for (let i = 0; i < organizationMembers.value.length; ++i) {
                if (organizationMembers.value[i].email === x.email) {
                    cnt++;
                }
            }
            if (cnt > 1) {
                uiStore.showErrorPopupDefault(`${x.email} is already added`);
                return;
            }
        }
    });

    await billingStore.saveChanges(organizationMembers.value, modulesSummary.value);
    showSaveChanges.value = false;
}

function toggleModule(member: UserView, moduleId: EBillingModuleId) {
    if (!authStore.isOrganizationAdmin) {
        return;
    }

    function freeSeat(ms: ModuleSummaryView) {
        for (let i = 0; i < ms.usedSeats.length; ++i) {
            if (ms.usedSeats[i].userOrRequestGuid === member.userOrRequestGuid) {
                ms.freeSeats.push(ms.usedSeats[i].billingGuid);
                ms.usedSeats.splice(i, 1);
                break;
            }
        }
    }

    function useSeat(ms: ModuleSummaryView) {
        const billingGuid = ms.freeSeats.shift()
        if (billingGuid !== undefined) {
            ms.usedSeats.push({
                userOrRequestGuid: member.userOrRequestGuid,
                billingGuid: billingGuid,
            });
        }
    }

    for (let i = 0; i < organizationMembers.value.length; ++i) {
        const om = organizationMembers.value[i];
        if (om.userOrRequestGuid === member.userOrRequestGuid) {
            for (let j = 0; j < om.modules.length; ++j) {
                if (om.modules[j].moduleId === moduleId) {
                    for (let k = 0; k < modulesSummary.value.length; ++k) {
                        const ms = modulesSummary.value[k];
                        if (ms.moduleId === moduleId) {
                            if (om.modules[j].active) {
                                om.modules[j].active = false;
                                freeSeat(ms);
                                showSaveChanges.value = true;
                            } else {
                                if (ms.freeSeats.length > 0) {
                                    om.modules[j].active = true;
                                    useSeat(ms);
                                    showSaveChanges.value = true;
                                }
                            }
                            break;
                        }
                    }
                }
            }
        }
    }
}

async function onClose(force=false) {
    discardEditChangesPopup.value = false;

    if (showSaveChanges.value === true) {
        if (force) {
            showSaveChanges.value = false;
            await billingStore.init(true);
            createData();
        } else {
            discardEditChangesPopup.value = true;
        }
    } else {
        useRouterStore().back();
    }
}

</script>

<template>
    <gb-window class="scoped-root" header="Manage authorized users" :prevent-route-back="true" @close="onClose">
        <div class="gb-inner-window">
            <div class="gb-layout">
                <div class="members-header pb-1 gap-2">
                    <div class="w-[var(--w-email)]">
                        <div class="members-header-item">
                            <gb-svg class="h-[18px]" icon="email"></gb-svg>
                            <div>Email</div>
                        </div>
                    </div>
                    <div class="w-[var(--w-role)]">
                        <div class="members-header-item">
                            <gb-svg class="h-[22px]" icon="user"></gb-svg>
                            <div>Role</div>
                        </div>
                    </div>
                    <div class="w-[var(--w-modules)]">
                        <div class="members-header-item">
                            <gb-svg class="h-[22px]" :icon="PortalConstants.ICON_LICENCE"></gb-svg>
                            <div>Accessible services</div>
                        </div>
                    </div>
                    <div class="w-[var(--w-status)]">
                        <div class="members-header-item">
                            <gb-svg class="h-[18px]" icon="check-mark"></gb-svg>
                            <div>User status</div>
                        </div>
                    </div>
                </div>
                <div v-if="billingStore.initialized" class="gb-layout-tl gap-1">
                    <div v-for="member in organizationMembers" :key="member.userOrRequestGuid">
                        <div class="gb-inner-window member-row !gb-layout-row text-[0.8em] h-[50px] gap-2">
                            <div class="w-[var(--w-email)]">
                                <input type="email" v-if="member.isNew" v-model="member.email">
                                <div v-else>
                                    {{member.email}}
                                </div>
                            </div>
                            <div class="w-[var(--w-role)]">
                                {{member.positionRole}}
                            </div>
                            <div class="w-[var(--w-modules)]">
                                <div class="module-list gb-layout-tl-row gap-1" >
                                    <div v-for="module in member.modules" :key="module.moduleId" class="relative">
                                        <account-licence-tooltip v-if="userTooltip?.moduleId === module.moduleId && userTooltip?.userOrRequestGuid === member.userOrRequestGuid" :user-or-request-guid="member.userOrRequestGuid" :module-id="module.moduleId"></account-licence-tooltip>
                                        <gb-button class="gbc-bg-primary module-icon" :icon="PortalConstants.getBillingModule(module.moduleId).icon" :inactive="!module.active" @click="toggleModule(member, module.moduleId)" @mouseover="userTooltip = {moduleId: module.moduleId, userOrRequestGuid: member.userOrRequestGuid}" @mouseleave="userTooltip = undefined"></gb-button>
                                    </div>
                                </div>
                            </div>
                            <div class="w-[var(--w-status)]">
                                <div v-if="member.isRequest">
                                    <div v-if="member.sentRequest !== true || requestStatusMouseOver === member.userOrRequestGuid" class="w-fit">
                                        <gb-button @click="billingStore.sendConfirmationEmail(member.userOrRequestGuid)" @mouseleave="requestStatusMouseOver = undefined" class="gbc-bg-primary" icon="email" text="Send email"></gb-button>
                                    </div>
                                    <div v-else @mouseover="requestStatusMouseOver = member.userOrRequestGuid">
                                        waiting for confirmation
                                    </div>
                                </div>
                                <div v-else>
                                    <div v-if="statusMouseOver === member.userOrRequestGuid" class="w-fit">
                                        <gb-button v-if="member.active" @mouseleave="statusMouseOver = undefined" class="gbc-bg-primary" icon="close" text="Deactivate"></gb-button>
                                        <gb-button v-else @mouseleave="statusMouseOver = undefined" class="gbc-bg-primary" icon="check_single" text="Activate"></gb-button>
                                    </div>
                                    <div v-else @mouseover="statusMouseOver = member.userOrRequestGuid">
                                        {{member.active ? 'active' : 'inactive'}}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="authStore.isOrganizationAdmin" class="gb-layout-ml-row w-full pt-2 h-full">
                    <div class="gb-ui-inner-window-footer gb-layout-tl-row gap-2 w-[calc(var(--w-email)+var(--w-role)+18px)]">
                        <gb-button v-if="showSaveChanges" @click="onSaveChanges" class="gbc-bg-primary" icon="check_single" text="Save"></gb-button>
                        <gb-button v-if="authStore.isOrganizationAdmin" @click="onAddAccount" class="gbc-bg-primary" icon="plus" text="Add account"></gb-button>
                    </div>
                    <div v-if="authStore.isOrganizationAdmin" class="gb-inner-window">
                        <div class="gb-layout-tl-row gap-3">
                            <div v-if="billingStore.initialized" class="gb-layout-tl-row gap-1">
                                <div v-for="module in modulesSummary" :key="module.moduleId" class="relative">
                                    <account-licence-tooltip v-if="remainingTooltip === module.moduleId" :module-id="module.moduleId"></account-licence-tooltip>
                                    <gb-button :text="module.freeSeats.length.toString()" :inactive="module.freeSeats.length === 0" class="gbc-bg-primary module-icon" @mouseover="remainingTooltip = module.moduleId" @mouseleave="remainingTooltip = undefined"></gb-button>
                                </div>
                            </div>
                            <div class="text-[12px] leading-3 w-14">
                                Remaining users
                            </div>
                            <router-link :to="{name: RoutesEnum.PORTAL_BILLING}">
                                <gb-button class="gbc-bg-primary" :icon="PortalConstants.ICON_UPGRADE_TO_PREMIUM" text="Add more"></gb-button>
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <gb-popup v-model="discardEditChangesPopup">
            <div class="gb-layout-tl gap-2 pr-20 pl-2">
                <div>Exit without saving changes?</div>
                <div>
                    <gb-button @click="() => {showSaveChanges = false; onClose(); }" class="gbc-bg-primary" text="Confirm"></gb-button>
                </div>
            </div>
        </gb-popup>
    </gb-window>
</template>

<style scoped>
.scoped-root {
  --w-email: 200px;
  --w-role: 200px;
  --w-modules: 350px;
  --w-status: 200px;
}

.member-row > div {
  @apply gb-layout-ml-row;
}

.members-header {
  @apply gb-layout-row text-[0.8em];
}

.members-header-item {
  @apply gb-layout-ml-row gap-1;
}

.members-header svg {
  height: 20px;
  width: auto;
}

.module-list svg {
  height: 20px;
  width: auto;
}

.module-icon {
  width: 35px;
  height: 25px;
}

</style>