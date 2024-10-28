<template>
    <div class="gb-layout-ml-row gap-1">
        <input type="checkbox" v-model="hideBlocked">
        <div>Hide blocked</div>
    </div>
    <div class="text-[12px] w-fit gb-selectable-text">
        <table class="gb-admin-table">
            <thead>
            <tr>
                <th class="sortable" @click="sortBy('name')">Name</th>
                <th class="sortable" @click="sortBy('developer')">Company</th>
                <th class="sortable" @click="sortBy('size')">Size</th>
                <th class="sortable" @click="sortBy('dev_type')">Type</th>
                <th class="sortable" @click="sortBy('email')">Email</th>
                <th>Position</th>
                <th class="sortable" @click="sortBy('phase')">Phase</th>
                <th class="sortable" @click="sortBy('relation')">Relation</th>
                <th class="sortable" @click="sortBy('free_trial')">Trial</th>
                <th class="sortable" @click="sortBy('activity')">Active</th>
                <th class="sortable" @click="sortBy('registered')">Registered</th>
                <th class="sortable" @click="sortBy('responded')">Responded</th>
                <th class="sortable" @click="sortBy('contacted')">Contacted</th>
                <th>First contact</th>
                <th>Linkedin</th>
                <th>Whatsapp</th>
                <th>Notes</th>
                <th class="sortable" @click="sortBy('state')">State</th>
                <th></th>
            </tr>
            </thead>
            <tbody>
            <template v-for="(item, index) in users" :key="index">
                <tr v-if="!hideBlocked || item.blocked === null">
                    <admin-users-changeable-btn :data-sticky="true" :data-sidebar="usePortalStore().isSidebarOn()" class="max-w-[70px] overflow-hidden" :data-tooltip="item.name" @click="changeTextValue(item, 'name')">
                        <div class="text-white data-[blocked]:text-magenta" :data-blocked="item.blocked">{{ item.name }}</div>
                        <gb-button v-if="useAuthStore().isAdmin() && item.state === 'registered' && item.email !== undefined" @click="fakeLogin(item.email);" class="gbc-bg-primary !h-[10px] !text-[10px] !p-0" text="Fake Login"></gb-button>
                    </admin-users-changeable-btn>
                    <admin-users-changeable-btn @click="() => {changeDeveloperPopup = item; changeDeveloperPopupFocus++;}" class="max-w-[90px] whitespace-nowrap overflow-hidden" data-tooltip-delay="0" :data-tooltip="item.developer">
                        <div class="data-[unknown='true']:text-alert" :data-unknown="item.isUnknownDeveloper === true">{{ item.developer }}</div>
                    </admin-users-changeable-btn>
                    <admin-users-changeable-btn @click="changeTextValue(item, 'size', {select: sizeValues})">
                        <div class="gb-colored" :data-c="item.sizeC">{{ item.customerData?.size }}</div>
                    </admin-users-changeable-btn>
                    <admin-users-changeable-btn @click="changeTextValue(item, 'dev_type', {select: ['Investor', 'Platform', 'Publisher', 'SP']})">
                        <div>{{ item.customerData?.dev_type }}</div>
                    </admin-users-changeable-btn>

                    <td v-if="item.state !== 'not_whitelisted'" class="text-[0.9em] leading-none max-w-[90px] overflow-hidden" data-tooltip-delay="0" :data-tooltip="item.email">
                        <div v-html="splitEmail(item.email)"></div>
                        <div class="relative pt-2">
                            <portal-ui-router-link :name="RoutesEnum.ACCOUNT_ADMIN_EMAIL_COMPOSER" :query="{email: item.email, template: 'follow_up'}">
                                <gb-button class="gbc-bg-primary !h-[10px] !text-[10px] !p-0" text="Email"></gb-button>
                            </portal-ui-router-link>
                            <div v-if="item.emailsSentCnt !== undefined && item.emailsSentCnt > 0" class="gb-layout-row absolute top-0 right-0 text-white text-opacity-50">
                                <gb-svg @click="popupShowSentEmails = item.email" class="cursor-pointer w-[15px] h-[15px]" icon="see_more"></gb-svg>
                                <div>{{item.emailsSentCnt}}</div>
                            </div>
                        </div>
                    </td>
                    <admin-users-changeable-btn v-else class="max-w-[50px] overflow-hidden" data-tooltip-delay="0" :data-tooltip="item.email" @click="changeTextValue(item, 'email', {showDelete: true})">
                        <div class="text-[0.9em] leading-none w-fit" v-html="splitEmail(item.email)"></div>
                    </admin-users-changeable-btn>
                    <admin-users-changeable-btn class="max-w-[90px] overflow-hidden whitespace-nowrap" data-tooltip-delay="0" :data-tooltip="item.customerData?.position" @click="changeTextValue(item, 'position')">
                        <div>{{ item.customerData?.position }}</div>
                    </admin-users-changeable-btn>

                    <admin-users-changeable-btn @click="changeTextValue(item, 'phase', {select: ['WIP-Partner', 'Partnered', '?-Interest', 'Uninterested', 'Interested', 'WIP-Offer', '?-Accepted', 'Accepted', 'Rejected', 'WIP-Contract', 'Contracted']})">
                        <div>{{ item.customerData?.phase }}</div>
                    </admin-users-changeable-btn>
                    <admin-users-changeable-btn @click="changeTextValue(item, 'relation', {select: ['Hot', 'Cold', 'Neutral']})">
                        <div class="gb-colored" :data-c="item.customerData?.relation === 'Hot' ? '2' : (item.customerData?.relation === 'Cold' ? '-2' : '0') ">{{ item.customerData?.relation }}</div>
                    </admin-users-changeable-btn>


                    <admin-users-changeable-btn v-if="item.state !== 'not_whitelisted'" @click="changeTextValue(item, 'freeTrialEnd', {date: true})" class="cursor-pointer">{{getFreeTrialDaysStr(item)}}</admin-users-changeable-btn>
                    <td v-else></td>

                    <td :style="{color: interpolateDateColor(item.lastActivity)}">{{ GembaseUtils.timestampDaysDiff(item.lastActivity) }}</td>
                    <td :style="{color: interpolateDateColor(item.registered)}">{{ GembaseUtils.timestampDaysDiff(item.registered) }}</td>
                    <admin-users-changeable-btn @click="changeTextValue(item, 'responded', {date: true})" :style="{color: interpolateDateColor(item.respondedFinal)}">
                        {{ GembaseUtils.timestampDaysDiff(item.respondedFinal) }}
                    </admin-users-changeable-btn>

                    <admin-users-changeable-btn @click="changeTextValue(item, 'contacted', {date: true})">
                        <div :style="{color: interpolateDateColor(item.contactedFinal)}">{{ GembaseUtils.timestampDaysDiff(item?.contactedFinal) }}</div>
                    </admin-users-changeable-btn>

                    <admin-users-changeable-btn @click="changeTextValue(item, 'firstContact', {date: true})">
                        <div :style="{color: interpolateDateColor(item.firstContactFinal)}">{{ GembaseUtils.timestampDaysDiff(item?.firstContactFinal) }}</div>
                    </admin-users-changeable-btn>


                    <admin-users-changeable-btn @click="changeTextValue(item, 'linkedin')">
                        <a v-if="GembaseUtils.isNotEmptyString(item.customerData?.linkedin)" :href="item.customerData?.linkedin">
                            <gb-svg class="absolute w-[15px] h-[15px] top-0 right-0 text-white text-opacity-50" icon="see_more"></gb-svg>
                        </a>
                        <div>{{ GembaseUtils.isNotEmptyString(item.customerData?.linkedin) ? "Y" : "" }}</div>
                    </admin-users-changeable-btn>
                    <admin-users-changeable-btn @click="changeTextValue(item, 'whatsapp')">
                        <div>{{ item.customerData?.whatsapp }}</div>
                    </admin-users-changeable-btn>
                    <admin-users-changeable-btn @click="changeTextValue(item, 'notes', {textArea: true})">
                        <div class="max-h-[100px] min-w-[300px] gb-ui-scroll-v">{{ item.customerData?.notes }}</div>
                    </admin-users-changeable-btn>

                    <td>
                        <div v-if="item.state !== 'not_whitelisted'" class="text-orange data-[state='registered']:text-ocean" :data-state="item.state">
                            {{item.state === "registered" ? "registered" : "whitelisted"}}
                        </div>
                        <portal-ui-router-link v-else-if="GembaseUtils.isValidEmail(item.email)" :name="RoutesEnum.ACCOUNT_ADMIN_WHITELIST_REQUEST" :query="{name: item.name, dev_id: item.customerData?.dev_id, email: item.email}">
                            <gb-button class="gbc-bg-primary" text="Whitelist"></gb-button>
                        </portal-ui-router-link>
                    </td>
                    <td>
                        <template v-if="item.customerOnly !== true">
                            <gb-button v-if="item.blocked === null" @click="onBlock(item)" class="gbc-bg-primary" text="Block"></gb-button>
                            <gb-button v-else @click="onBlock(item, true)" class="gbc-bg-secondary" text="Unblock"></gb-button>
                        </template>
                    </td>
                </tr>
            </template>
            </tbody>
        </table>
        <gb-button class="gbc-bg-primary" text="Add" @click="onAddUser"></gb-button>
        <div v-if="editFollowupDateItem !== undefined" class="fixed bg-black bg-opacity-80 top-0 left-0 right-0 bottom-0 gb-layout">
            <div class="gbc-bg-secondary gb-layout-tl gap-2 p-2">
                <div>Set followup date:</div>
                <input type="date" v-model="followupInputDate">
                <div class="gb-layout-tl-row gap-1">
                    <gb-button class="gbc-bg-alert" @click="editFollowupDateItem = undefined" text="Close"></gb-button>
                    <gb-button class="gbc-bg-primary" @click="onSetFollowUpDate" text="Confirm"></gb-button>
                </div>
            </div>
        </div>
    </div>
    <gb-popup class="text-[0.7em]" v-if="popupShowSentEmails !== undefined" @close="popupShowSentEmails = undefined">
        <div class="pt-8">
            <div class="max-h-[calc(100vh-200px)] overflow-hidden overflow-y-scroll">
                <table>
                    <thead>
                    <tr>
                        <th>Days</th>
                        <th>Subject</th>
                        <th>Manual</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="item in popupSentEmailData" :key="item.id">
                        <td>{{GembaseUtils.timestampDaysDiff(item.t)}}</td>
                        <td>{{item.subject}}</td>
                        <td>{{item.from_composer}}</td>
                        <td>
                            <gb-button class="gbc-bg-primary" @click="popupShowSentEmailsPreview = item.body" text="Preview"></gb-button>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div v-if="popupShowSentEmailsPreview !== undefined" class="fixed inset-0 bg-white">
            <div class="fixed left-0 right-0 top-[50px] bottom-0">
                <div class="h-full w-full">
                    <iframe class="h-full w-full" :srcdoc="popupShowSentEmailsPreview"></iframe>
                </div>
            </div>
            <div class="fixed top-0 right-0">
                <gb-button @click="popupShowSentEmailsPreview = undefined" class="bg-magenta" text="Close"></gb-button>
            </div>
        </div>
    </gb-popup>
    <gb-popup class="text-[0.8em]" v-if="changeTextPopup !== undefined" @close="changeTextPopup = undefined">
        <div class="gb-layout gap-2 pt-5 w-full">
            <div>Edit {{changeTextPopupData.parameter}}:</div>
            <textarea ref="editTextArea" class="min-w-[600px] min-h-[400px]" v-if="changeTextPopupData.options?.textArea" v-model="changeTextPopupData.value"></textarea>
            <input v-else-if="changeTextPopupData.options?.date" type="date" v-model="changeTextDate">
            <select class="min-w-[200px]" v-else-if="changeTextPopupData.options?.select !== undefined" @change="(event) => changeTextPopupData.value = (event as any).target?.value ?? ''">
                <option v-for="it in changeTextPopupData.options.select" :key="it" :value="it" :selected="it === changeTextPopupData.value">
                    {{ it }}
                </option>
            </select>
            <input v-else ref="editInput" class="min-w-[400px]" v-model="changeTextPopupData.value">
            <div class="gb-layout-m-between w-full">
                <div>
                    <gb-button v-if="changeTextPopupData.options?.showDelete" @click="changeTextDeleteConfirm = true" class="gbc-bg-alert" icon="delete" text="Delete"></gb-button>
                </div>
                <gb-button @click="onConfirmChangeText" class="gbc-bg-primary" text="Confirm"></gb-button>
            </div>
            <gb-popup v-if="changeTextDeleteConfirm" @close="changeTextDeleteConfirm = false">
                <div class="pt-5">
                    <div>Delete {{changeTextPopup?.id}} {{changeTextPopup?.name}} {{changeTextPopup?.email}} ?</div>
                    <gb-button @click="onDeleteUser" class="gbc-bg-alert" icon="delete" text="Delete"></gb-button>
                </div>
            </gb-popup>
        </div>
    </gb-popup>
    <gb-popup v-if="changeDeveloperPopup !== undefined" @close="changeDeveloperPopup = undefined">
        <div class="gb-layout gap-2 pt-5">
            <div class="gb-layout-tl">
                <div>Current developer: {{ changeDeveloperPopup?.developer }}</div>
            </div>
            <div class="gb-layout-row gap-2">
                <input type="checkbox" v-model="changeDeveloperPopupData.concept">
                <div>Concept</div>
            </div>
            <div v-if="changeDeveloperPopupData.concept">
                <div>Concept name:</div>
                <input v-model="changeDeveloperPopupData.concept_name">
            </div>
            <div v-else>
                <div>Search:</div>
                <div class="w-[400px] h-[30px]">
                    <platform-developer-search :focus="changeDeveloperPopupFocus" :include-concepts="true" data-tooltip="Search developer" placeholder="Enter company name" @on-hint-selected="(data) => changeDeveloperPopupData.developerHint = data" class="w-full h-full"></platform-developer-search>
                </div>
            </div>
            <div class="gb-layout-tl-row gap-2">
                <gb-button @click="onConfirmChangeDeveloper" class="gbc-bg-primary" text="Confirm"></gb-button>
            </div>
        </div>
    </gb-popup>
</template>

<script setup lang="ts">

import {onMounted, onUnmounted, ref, watch} from "vue";
import GembaseUtils from "@/utils/GembaseUtils";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import PortalUiRouterLink from "@/views/ui/router/PortalUiRouterLink.vue";
import {RoutesEnum} from "@/router/RoutesEnum";
import EndpointRequest from "@/core/requests/EndpointRequest";
import AdminUsersChangeableBtn from "@/views/platform/modules/admin/__subpages/__components/AdminUsersChangeableBtn.vue";
import GbPopup from "@/views/ui/popups/GbPopup.vue";
import {DeveloperHint} from "@/models/portal/PortalDataTypes";
import {GB_PALETTE} from "@/tailwind/gembaseTwPalette";
import {useUiStore} from "@/models/ui/UiStore";
import {useAuthStore} from "@/models/auth/AuthStore";
import ClientError from "@/core/errors/ClientError";
import GbSvg from "@/views/ui/icons/GbSvg.vue";
import {usePortalStore} from "@/models/portal/PortalStore";
import PlatformDeveloperSearch from "@/views/platform/modules/__components/PlatformDeveloperSearch.vue";
import {useRouterStore} from "@/core/router/RouterStore";
import {TDeveloperId} from "@/models/portal/apps/AppsData";
import {useFullscreenLoading} from "@/models/ui/FullscreenLoadingComposable";

const fullscreenLoading = useFullscreenLoading();

const editFollowupDateItem = ref<UserData>();
const followupInputDate = ref("");

const popupShowSentEmails = ref<string>();
const popupShowSentEmailsPreview = ref<string>();
const hideBlocked = ref(true);

export interface ICustomerData {
    id: number;
    name?: string;
    dev_id?: TDeveloperId;
    size?: string;
    position?: string;
    phase?: string;
    dev_type?: string;
    relation?: string;
    contacted?: number;
    firstContact?: number;
    responded?: number;
    linked?: string;
    linkedin?: string;
    whatsapp?: string;
    notes?: string;
}

interface AdminRegisteredUserData {
    email: string;
    name: string;
    guid: string;
    created_t: number;
    session_t: number;
    sent_request_t: number;
    developer_title: string;
    free_trial_end_t: number | null;
    blocked: number | null;
}

interface AdminDataPerEmails {
    email: string;
    data: {
        sent_emails?: {
            email_def: string;
            email: string;
            t: number | null;
            opened_t: number | null;
        }[];
        subscription?: {
            email: string;
            subscribed: number;
        }
    }
}

interface AdminWhitelistData {
    request_guid: string;
    email: string;
    name: string;
    title: string;
    is_organization: number;
    locked: number;
    sent_request_t: number | null;
    whitelisted: number;
    request_t: number | null;
    free_trial_end_t: number | null;
    responded_t: number | null;
    blocked: number | null;
}

interface IAdminUsers {
    error?: string;
    registered: AdminRegisteredUserData[];
    whitelist: AdminWhitelistData[];
    customers: {
        id: number;
        email: string | null;
        developer_title: string;
        data: ICustomerData;
    }[];
    emails_sent_cnt: {email: string, cnt: number}[];
}

interface UserData {
    id: string;
    onlyCustomer?: boolean;
    email?: string;
    name?: string;
    developer?: string;
    isUnknownDeveloper?: boolean;
    state: "registered" | "pending" | "not_whitelisted";
    sentInvite?: number | null;
    sentInviteOpened?: number | null;
    request?: number | null;
    registered?: number;
    lastActivity?: number;
    whitelist?: AdminWhitelistData;
    user?: AdminRegisteredUserData;
    followUpSend?: number | null;
    followUpOpened?: number | null;
    subscribed?: number;
    freeTrialEnd?: number | null;
    customerData?: ICustomerData;
    contactedFinal?: number;
    firstContactFinal?: number;
    sizeC?: number;
    respondedFinal?: number;
    respondedT?: number;
    emailsSentCnt?: number;
    blocked: number | null;
    customerOnly?: boolean;
}

const users = ref<UserData[]>([]);

const sizeValues = ['0-1','1-5','5-10','10-50','50-100','100-1000','>1000'];

interface IChangeTextPopupOptions {
    textArea?: boolean;
    date?: boolean;
    showDelete?: boolean;
    select?: string[];
}
const changeTextPopup = ref<UserData>();
const changeTextPopupData = ref<{
    parameter: string,
    value: string,
    options?: IChangeTextPopupOptions
}>({
    parameter: "",
    value: ""
});
const changeTextDate = ref("");
const changeTextDeleteConfirm = ref(false);

const editInput = ref<HTMLInputElement>();
const editTextArea = ref<HTMLTextAreaElement>();

function splitEmail(email: string | undefined): string {
    if (email === undefined) {
        return "";
    }
    const arr = email.split("@");
    if (arr.length === 2) {
        return `${arr[0]}@<br>${arr[1]}`;
    }
    return email;
}

interface ISentEmailData {
    id: number,
    t: number,
    subject: string,
    body: string,
    email_def: string | null,
    from_composer: number
}

const popupSentEmailData = ref<ISentEmailData[]>([]);

watch(() => popupShowSentEmails.value, async () => {
    if (popupShowSentEmails.value !== undefined) {
        fullscreenLoading.show();

        popupSentEmailData.value = await EndpointRequest.process2<ISentEmailData[]>("admin:get_sent_emails", {
            email: popupShowSentEmails.value
        });

        popupSentEmailData.value.sort((a, b) => {
            return b.id - a.id;
        });

        fullscreenLoading.hide();
    }
});


async function fakeLogin(email: string) {
    const response = await EndpointRequest.process2<{
        state: "ok" | "not_found"
    }>("admin:fake_login", {
        email: email
    });

    if (response.state === "not_found") {
        useUiStore().showErrorPopupDefault(`User ${email} not found !`);
        return;
    }

    location.replace(useRouterStore().getFullUrl(RoutesEnum.PORTAL_GUIDE));
}

async function changeTextValue(user: UserData, parameter: string, options?: IChangeTextPopupOptions) {
    changeTextPopup.value = user;
    changeTextPopupData.value.parameter = parameter;
    changeTextPopupData.value.options = options;
    changeTextDeleteConfirm.value = false;
    if (user[parameter] !== undefined) {
        changeTextPopupData.value.value = user[parameter];
    } else if (user.customerData !== undefined && user.customerData[parameter] !== undefined) {
        changeTextPopupData.value.value = user.customerData[parameter];
    } else {
        changeTextPopupData.value.value = "";
    }

    if (options?.date) {
        let timestamp = GembaseUtils.parseNumberSafe(changeTextPopupData.value.value);
        if (timestamp === undefined) {
            timestamp = GembaseUtils.serverTimestamp();
        }
        changeTextDate.value = GembaseUtils.serverTimestampToInputElementDate(timestamp);
    }

    if (options?.select !== undefined) {
        if (changeTextPopupData.value.value === "") {
            changeTextPopupData.value.value = options.select[0];
        }
    }

    await GembaseUtils.sleep(300);

    if (changeTextPopupData.value.options?.textArea === true) {
        editTextArea.value?.focus();
    } else {
        editInput.value?.focus();
    }

    editInput.value?.addEventListener("keypress", onInputKeypress);

}

function onInputKeypress(event: KeyboardEvent) {
    if (event.key === "Enter") {
        event.preventDefault();
        onConfirmChangeText();
    }
}

async function onDeleteUser() {
    if (changeTextPopup.value === undefined) {
        return;
    }

    const usersData = await EndpointRequest.process2<IAdminUsers>("admin:users_delete", {
        customer_id: changeTextPopup.value.customerData?.id,
        email: changeTextPopup.value?.email
    });

    changeTextPopup.value = undefined;

    refreshUsersData(usersData);
}

async function onBlock(item: UserData, removeBlock = false) {
    fullscreenLoading.show();

    const usersData = await EndpointRequest.process2<IAdminUsers>("admin:block_user", {
        email: item.email,
        remove_block: removeBlock
    });

    refreshUsersData(usersData);

    fullscreenLoading.hide();
}

async function onConfirmChangeText() {
    if (changeTextPopup.value === undefined) {
        return;
    }

    if (changeTextPopupData.value.options?.date) {
        changeTextPopupData.value.value = GembaseUtils.inputElementDateToServerTimestamp(changeTextDate.value).toString();
    }

    const usersData = await EndpointRequest.process2<IAdminUsers>("admin:users_set_text", {
        email: changeTextPopup.value.email,
        customer_id: changeTextPopup.value.customerData?.id,
        parameter: changeTextPopupData.value.parameter,
        value: changeTextPopupData.value.value,
        is_timestamp: changeTextPopupData.value.options?.date === true ? true : undefined
    });

    changeTextPopup.value = undefined;

    refreshUsersData(usersData);
}

const changeDeveloperPopup = ref<UserData>();
const changeDeveloperPopupFocus = ref(0);
const changeDeveloperPopupData = ref<{
    concept: boolean,
    concept_name: string,
    developerHint?: DeveloperHint
}>({
    concept: false,
    concept_name: "",
});

async function onConfirmChangeDeveloper() {
    if (changeDeveloperPopup.value === undefined) {
        return;
    }

    fullscreenLoading.show();

    const usersData = await EndpointRequest.process2<IAdminUsers>("admin:users_set_developer", {
        email: changeDeveloperPopup.value.email,
        customer_id: changeDeveloperPopup.value.customerData?.id,
        is_concept: changeDeveloperPopupData.value.concept,
        concept_name: changeDeveloperPopupData.value.concept_name,
        dev_id_in_store: changeDeveloperPopupData.value.developerHint?.dev_id_in_store,
        store: changeDeveloperPopupData.value.developerHint?.store
    });

    changeDeveloperPopup.value = undefined;

    refreshUsersData(usersData);

    fullscreenLoading.hide();
}


async function onAddUser() {
    const usersData = await EndpointRequest.process2<IAdminUsers>("admin:users_add");
    refreshUsersData(usersData);
}


function refreshUsersData(usersData: IAdminUsers) {
    if (usersData.error !== undefined) {
        throw new ClientError(usersData.error);
    }

    users.value.length = 0;
    usersData.registered.forEach((x) => {
        users.value.push({
            id: x.guid,
            email: x.email,
            name: x.name,
            developer: x.developer_title,
            lastActivity: x.session_t,
            registered: x.created_t,
            state: "registered",
            user: x,
            sentInvite: x.sent_request_t,
            request: null,
            subscribed: 1,
            freeTrialEnd: x.free_trial_end_t,
            blocked: x.blocked
        });
    });

    usersData.whitelist.forEach((x) => {
        if (x.whitelisted === 1) {
            const foundUser = users.value.find((y) => y.email === x.email);
            if (foundUser !== undefined) {
                foundUser.whitelist = x;
                foundUser.sentInvite = x.sent_request_t;
            } else {
                users.value.push({
                    id: x.request_guid,
                    state: "pending",
                    sentInvite: x.sent_request_t,
                    developer: x.title,
                    email: x.email,
                    name: x.name,
                    whitelist: x,
                    request: x.request_t,
                    subscribed: 1,
                    freeTrialEnd: x.free_trial_end_t,
                    respondedT: x.responded_t === null ? undefined : x.responded_t,
                    blocked: x.blocked
                });
            }
        }
    });

    usersData.whitelist.forEach((x) => {
        if (x.whitelisted === 0) {
            const foundUser = users.value.find((y) => y.email === x.email);
            if (foundUser === undefined) {
                users.value.push({
                    id: x.request_guid,
                    state: "not_whitelisted",
                    sentInvite: x.sent_request_t,
                    developer: x.title,
                    email: x.email,
                    name: x.name,
                    whitelist: x,
                    request: x.request_t,
                    subscribed: 1,
                    freeTrialEnd: x.free_trial_end_t,
                    respondedT: x.responded_t === null ? undefined : x.responded_t,
                    blocked: x.blocked
                });
            }
        }
    });

    adminDataPerEmails.forEach((x) => {
        const d = users.value.find((y) => x.email === y.email);
        if (d !== undefined) {
            const followUp = x.data.sent_emails?.find((z) => z.email_def === "follow_up");
            if (followUp !== undefined) {
                d.followUpSend = followUp.t;
                d.followUpOpened = followUp.opened_t;
            }
            const inviteByUser = x.data.sent_emails?.find((z) => z.email_def === "invite_by_user");
            if (inviteByUser !== undefined) {
                d.sentInvite = inviteByUser.t;
                d.sentInviteOpened = inviteByUser.opened_t;
            }
            if (x.data.subscription !== undefined) {
                d.subscribed = x.data.subscription.subscribed;
            }
        }
    });

    usersData.customers.forEach((x) => {
        let found = false;
        if (x.email !== null) {
            const u = users.value.find((y) => y.email === x.email);
            if (u !== undefined) {
                u.customerData = x.data;
                found = true;
            }
        }
        if (!found) {
            const user: UserData = {
                id: `Customer ${x.id}`,
                name: x.data.name,
                email: x.email === null ? undefined : x.email,
                developer: x.developer_title,
                customerData: x.data,
                state: "not_whitelisted",
                isUnknownDeveloper: x.data.dev_id === undefined,
                blocked: null,
                customerOnly: true
            }
            users.value.push(user);
        }
    });

    users.value.forEach((x) => {

        if (x.email !== null && x.email !== undefined) {
            const cnt = usersData.emails_sent_cnt.find((y) => y.email === x.email);
            if (cnt !== undefined) {
                x.emailsSentCnt = cnt.cnt;
            }
        }


        if (x.customerData?.size !== undefined) {
            const ix = sizeValues.indexOf(x.customerData.size);
            if (ix >= 5) {
                x.sizeC = 1;
            }
            if (ix >= 6) {
                x.sizeC = 2;
            }
        }

        // responded final

        if (x.customerData?.responded !== null && x.customerData?.responded !== undefined) {
            if (x.respondedFinal === undefined || x.customerData.responded > x.respondedFinal) {
                x.respondedFinal = x.customerData.responded;
            }
        }
        if (x.respondedT !== undefined) {
            if (x.respondedFinal === undefined || x.respondedT > x.respondedFinal) {
                x.respondedFinal = x.respondedT;
            }
        }
        if (x.registered !== undefined) {
            if (x.respondedFinal === undefined || x.registered > x.respondedFinal) {
                x.respondedFinal = x.registered;
            }
        }

        // first contact

        if (x.sentInvite !== null && x.sentInvite !== undefined) {
            if (x.contactedFinal === undefined || x.sentInvite > x.contactedFinal) {
                x.contactedFinal = x.sentInvite;
            }
            if (x.firstContactFinal === undefined || x.sentInvite < x.firstContactFinal) {
                x.firstContactFinal = x.sentInvite;
            }
        }
        if (x.followUpSend !== null && x.followUpSend !== undefined) {
            if (x.contactedFinal === undefined || x.followUpSend > x.contactedFinal) {
                x.contactedFinal = x.followUpSend;
            }
            if (x.firstContactFinal === undefined || x.followUpSend < x.firstContactFinal) {
                x.firstContactFinal = x.followUpSend;
            }
        }
        if (x.customerData?.contacted !== null && x.customerData?.contacted !== undefined) {
            if (x.contactedFinal === undefined || x.customerData.contacted > x.contactedFinal) {
                x.contactedFinal = x.customerData.contacted;
            }
            if (x.firstContactFinal === undefined || x.customerData.contacted > x.firstContactFinal) {
                x.firstContactFinal = x.customerData.contacted;
            }
        }
        if (x.customerData?.firstContact !== null && x.customerData?.firstContact !== undefined) {
            if (x.firstContactFinal === undefined || x.customerData.firstContact < x.firstContactFinal) {
                x.firstContactFinal = x.customerData.firstContact;
            }
        }
        if (x.respondedFinal !== undefined) {
            if (x.firstContactFinal === undefined || x.respondedFinal < x.firstContactFinal) {
                x.firstContactFinal = x.respondedFinal;
            }
        }
    });

    if (lastSort !== undefined) {
        sortBy(lastSort);
    }
}

let adminDataPerEmails: AdminDataPerEmails[] = [];

onMounted(async () => {
    adminDataPerEmails = await EndpointRequest.process2<AdminDataPerEmails[]>("admin:get_data_per_emails");
    refreshUsersData(await EndpointRequest.process2<IAdminUsers>("admin:get_users"));
    window.addEventListener("keyup", onWindowKeyUp);
});

onUnmounted(() => {
    window.removeEventListener("keyup", onWindowKeyUp);
});

function onWindowKeyUp(event: KeyboardEvent) {
    if (event.key === "Escape") {
        changeTextPopup.value = undefined;
    }
}

function getFreeTrialDays(item: UserData) {
    const t = GembaseUtils.timestampDaysDiff(item.freeTrialEnd);
    if (t === undefined || t > 0) {
        return 0;
    }

    return -t;
}

function getFreeTrialDaysStr(item: UserData): string {
    const t = getFreeTrialDays(item);
    if (t === 0) {
        return "";
    }

    return t.toString();
}

type sortType = "size" | "dev_type" | "phase" | "relation" | "responded" | "contacted" | "linked" | "free_trial" | "followUp" | "email" | "name" | "developer" | "state" | "invite" | "registered" | "activity" | "request";

const toggledSort: sortType[] = [];
let lastSort: sortType | undefined = undefined;

function sortBy(key: sortType) {

    lastSort = key;

    function compareNumbers(a: number | undefined | null, b: number | undefined | null) {
        if (a !== undefined &&
            a !== null &&
            b !== undefined &&
            b !== null) {
            return b - a;
        } else {
            return (a ?? 0) - (b ?? 0);
        }
    }
    users.value.sort((a, b) => {
        let val = 0;
        if (key === "email") {
            val = (a.email ?? "").localeCompare(b.email ?? "");
        } else if (key === "name") {
            val = (a.name ?? "").localeCompare(b.name ?? "");
        } else if (key === "developer") {
            val = (a.developer ?? "").localeCompare(b.developer ?? "");
        } else if (key === "state") {
            if (a.state === "not_whitelisted" && b.state === "not_whitelisted") {
                const isEmailA = GembaseUtils.isValidEmail(a.email) ? 1 : 0;
                const isEmailB = GembaseUtils.isValidEmail(b.email) ? 1 : 0;
                val = isEmailA - isEmailB;
            } else {
                val = a.state.localeCompare(b.state);
            }
        } else if (key === "invite") {
            val = compareNumbers(a.sentInvite, b.sentInvite);
        } else if (key === "registered") {
            val = compareNumbers(a.registered, b.registered);
        } else if (key === "activity") {
            val = compareNumbers(a.lastActivity, b.lastActivity);
        } else if (key === "request") {
            val = compareNumbers(a.request, b.request);
        } else if (key === "followUp") {
            val = compareNumbers(a.followUpSend, b.followUpSend);
        } else if (key === "free_trial") {
            val = compareNumbers(getFreeTrialDays(a), getFreeTrialDays(b));
        } else if (key === "size") {
            const idxA = sizeValues.indexOf(a.customerData?.size ?? "");
            const idxB = sizeValues.indexOf(b.customerData?.size ?? "");
            val = compareNumbers(idxA + 1, idxB + 1);
        } else if (key === "dev_type") {
            val = (a.customerData?.dev_type ?? "").localeCompare(b.customerData?.dev_type ?? "");
        } else if (key === "phase") {
            val = (a.customerData?.phase ?? "").localeCompare(b.customerData?.phase ?? "");
        } else if (key === "relation") {
            val = (a.customerData?.relation ?? "").localeCompare(b.customerData?.relation ?? "");
        } else if (key === "linked") {
            val = (a.customerData?.linked ?? "").localeCompare(b.customerData?.linked ?? "");
        } else if (key === "contacted") {
            val = compareNumbers(a.contactedFinal, b.contactedFinal);
        } else if (key === "responded") {
            val = compareNumbers(a.customerData?.responded ?? 0, b.customerData?.responded ?? 0);
        }

        if (toggledSort.includes(key)) {
            val = -val;
        }

        return val;
    });

    GembaseUtils.toggleArr(toggledSort, key);
}

async function onSetFollowUpDate() {
    if (editFollowupDateItem.value !== undefined) {
        const timestamp = GembaseUtils.inputElementDateToServerTimestamp(followupInputDate.value);

        await EndpointRequest.process2("admin:set_follow_up_date", {
            timestamp: timestamp
        });

        editFollowupDateItem.value.followUpSend = timestamp;
        editFollowupDateItem.value = undefined;
    }
}

function interpolateDateColor(timestamp: number | undefined): string {
    if (timestamp === undefined) {
        return GB_PALETTE.WHITE;
    }

    const rgb1 = GembaseUtils.colorCssToNumber(GB_PALETTE.MAGENTA);
    const rgb2 = GembaseUtils.colorCssToNumber(GB_PALETTE.OCEAN);

    const [r1, g1, b1] = GembaseUtils.colorNumberToRGB(rgb1);
    const [r2, g2, b2] = GembaseUtils.colorNumberToRGB(rgb2);

    let days = GembaseUtils.timestampDaysDiff(timestamp);
    if (days === undefined) {
        return GB_PALETTE.WHITE;
    }

    const max = 365;
    if (days >= max) {
        days = max;
    }

    const ratio = days / 365;

    const q = 1-ratio;
    const rr = Math.round(r1 * ratio + r2 * q);
    const rg = Math.round(g1 * ratio + g2 * q);
    const rb = Math.round(b1 * ratio + b2 * q);

    return `#${rr.toString(16).padStart(2, "0")}${rg.toString(16).padStart(2, "0")}${rb.toString(16).padStart(2, "0")}`;
}
</script>

<style scoped>
.sortable {
  @apply cursor-pointer;

  text-decoration: underline;
}

.gb-colored {
  @apply text-white data-[c="-1"]:text-dim-magenta data-[c="-2"]:text-magenta data-[c="1"]:text-dim-ocean data-[c="2"]:text-ocean;
}

</style>
