<template>
    <div v-if="initialized" class="w-full h-full text-[15px] leading-3">
        <div v-if="!isLoaded" class="gb-layout-tl-row gap-2">
            <div class="gb-layout-tl-row gap-2">
                <div>Email:</div>
                <input type="email" v-model="currentEmail" />
            </div>
            <gb-button @click="onLoad" text="Load"></gb-button>
        </div>
        <div v-else-if="currentEmailInstance !== undefined" class="gb-layout-tl-row h-full w-full">
            <div class="w-[60%] h-full">
                <div class="w-full h-full gb-layout-tl gap-2">
                    <div class="gb-layout-t-between w-full">
                        <gb-button class="gbc-bg-secondary" @click="onSend" text="Send"></gb-button>
                        <gb-button
                            class="gbc-bg-secondary"
                            @click="onSend(true)"
                            text="Send (finagoo)"
                        ></gb-button>
                        <gb-button
                            class="gbc-bg-secondary"
                            @click="onSend(false, true)"
                            :text="`Send (${useSessionStore().userData.email})`"
                        ></gb-button>
                        <gb-button class="gbc-bg-primary" @click="onSave" text="Save"></gb-button>
                        <gb-button
                            class="gbc-bg-primary"
                            @click="onUpdateFromSheet"
                            text="Update from sheet"
                        ></gb-button>
                        <gb-button class="gbc-bg-alert" @click="onReset" text="Reset"></gb-button>
                        <gb-button class="gbc-bg-alert" @click="onClose" text="Close"></gb-button>
                    </div>
                    <div class="font-bold text-[20px]">Email: {{ currentEmail }}</div>
                    <div class="gb-layout-tl">
                        <div>Parameters:</div>
                        <div
                            class="gb-layout-tl-row flex-wrap gap-1 gb-selectable-text text-[14px] leading-[10px]"
                        >
                            <div>[HOMEPAGE]</div>
                            <div
                                v-for="(value, key) in currentEmailInstance.instance_data
                                    .content_parameters"
                                :key="key"
                            >
                                {{ key }}
                            </div>
                        </div>
                    </div>
                    <div class="gb-layout-tl">
                        <div>Theme:</div>
                        <gembase-ui-select
                            @on-change="onSelectTheme"
                            class="!rounded-none !h-[25px]"
                            :selected="currentTheme"
                            :items="themeSelectItems"
                        ></gembase-ui-select>
                    </div>
                    <div class="gb-layout-tl">
                        <div>Template:</div>
                        <gembase-ui-select
                            @on-change="onSelectTemplate"
                            class="!rounded-none !h-[25px]"
                            :selected="query.template"
                            :items="templateSelectItems"
                        ></gembase-ui-select>
                    </div>
                    <template v-if="query.template === 'follow_up'">
                        <div class="gb-layout-tl">
                            <div>Sender:</div>
                            <input
                                v-model="currentEmailInstance.instance_data.from_address"
                                class="w-[200px]"
                            />
                        </div>
                        <div class="gb-layout-tl">
                            <div>Games:</div>
                            <gembase-ui-select
                                @on-change="onAppChange"
                                class="!rounded-none !h-[25px]"
                                :selected="
                                    (
                                        currentEmailInstance.instance_data
                                            .draft_parameters as FollowUpDraftParameters
                                    )?.app_id
                                "
                                :items="followupAppIdsItems"
                            ></gembase-ui-select>
                        </div>
                        <div class="gb-layout-tl">
                            <div>Angle:</div>
                            <gembase-ui-select
                                @on-change="onAudienceAngleChange"
                                class="!rounded-none !h-[25px]"
                                :selected="
                                    (
                                        currentEmailInstance.instance_data
                                            .draft_parameters as FollowUpDraftParameters
                                    )?.audience_angle_id
                                "
                                :items="followupAngleItems"
                            ></gembase-ui-select>
                        </div>
                    </template>
                    <template v-if="currentEmailInstance !== undefined">
                        <div class="gb-layout-tl w-full">
                            <div>Subject:</div>
                            <input v-model="currentEmailInstance.instance_data.subject" />
                        </div>
                        <div class="gb-layout-tl w-full">
                            <div>Title:</div>
                            <input
                                v-model="
                                    currentEmailInstance.instance_data.template_parameters.gb__title
                                "
                            />
                        </div>
                        <div class="gb-layout-tl w-full">
                            <div>Footer:</div>
                            <textarea
                                class="w-full text-[13px]"
                                v-model="
                                    currentEmailInstance.instance_data.template_parameters
                                        .gb__footer
                                "
                            ></textarea>
                        </div>
                        <div class="gb-layout-tl w-full h-full">
                            <div>Body:</div>
                            <textarea
                                class="w-full h-full text-[13px]"
                                v-model="
                                    currentEmailInstance.instance_data.template_parameters
                                        .gb__content
                                "
                            ></textarea>
                        </div>
                    </template>
                </div>
            </div>
            <div class="gb-layout-tl w-[40%] h-full gap-2">
                <div>Subject: {{ subjectPreview }}</div>
                <div class="h-full w-full bg-white">
                    <iframe class="h-full w-full" :srcdoc="emailPreview"></iframe>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import GbButton from '@/views/ui/buttons/GbButton.vue'
import GembaseUiSelect from '@/views/ui/GembaseUiSelect.vue'
import { computed, onMounted, ref } from 'vue'
import { type SelectOptionItem } from '@/views/ui/UiData'
import { useUiStore } from '@/models/ui/UiStore'
import { type TAppId } from '@/models/portal/apps/AppsData'
import { useFullscreenLoading } from '@/models/ui/FullscreenLoadingComposable'
import { useQueryModel, type IQuery } from '@/router/queryModelComposable'
import {
    adminCommands,
    type IDraftParameters,
    type IEmailInstanceData,
    type IEmailTemplatesDef,
} from '@/commands/adminCommands'
import ClientError from '@/errors/clientError'
import { useSessionStore } from '@/stores/SessionStore'

const uiStore = useUiStore()
const fullscreenLoading = useFullscreenLoading()

interface EmailComposerQueryParams extends IQuery {
    email?: string
    template?: string
}

interface FollowUpDraftParameters extends IDraftParameters {
    audience_angle_id: string
    app_id: TAppId
}

const templateSelectItems = ref<SelectOptionItem[]>([])
const followupAngleItems = ref<SelectOptionItem[]>([])
const followupAppIdsItems = ref<SelectOptionItem[]>([])
const themeSelectItems = ref<SelectOptionItem[]>([])
const initialized = ref(false)
const isLoaded = ref(false)
const currentEmail = ref<string>()
const currentEmailInstance = ref<IEmailInstanceData>()

let emailSending = false
let emailTemplatesDef: IEmailTemplatesDef = {
    themes: [],
    templates: [],
}

const query = useQueryModel<EmailComposerQueryParams>({}).query

onMounted(async () => {
    fullscreenLoading.show()
    emailTemplatesDef = await adminCommands.getEmailTemplates()
    themeSelectItems.value.length = 0
    emailTemplatesDef.themes.forEach((x) => {
        themeSelectItems.value.push({
            id: x.theme,
            value: x.theme,
        })
    })
    templateSelectItems.value.length = 0
    emailTemplatesDef.templates.forEach((x) => {
        templateSelectItems.value.push({
            id: x,
            value: x,
        })
    })
    initialized.value = true
    if (query.value.template === undefined) {
        query.value.template = emailTemplatesDef.templates[0]
    }
    if (query.value.email !== undefined) {
        currentEmail.value = query.value.email
        await onLoad()
    }
    fullscreenLoading.hide()
})

const currentTheme = computed(() => {
    return currentEmailInstance.value?.instance_data.draft_parameters?.theme ?? 'default'
})

async function onSelectTheme(item: SelectOptionItem) {
    if (currentEmailInstance.value !== undefined) {
        if (currentEmailInstance.value.instance_data.draft_parameters === null) {
            currentEmailInstance.value.instance_data.draft_parameters = {
                theme: 'default',
            }
        }
        currentEmailInstance.value.instance_data.draft_parameters.theme = item.id
    }
}

async function onSelectTemplate(item: SelectOptionItem) {
    fullscreenLoading.show()
    query.value.template = item.id
    currentEmailInstance.value = undefined
    await onLoad()
    fullscreenLoading.hide()
}

const subjectPreview = computed(() => {
    let res = ''

    if (currentEmailInstance.value !== undefined) {
        res = currentEmailInstance.value.instance_data.subject

        while (res.indexOf('[HOMEPAGE]') >= 0) {
            res = res.replace(
                '[HOMEPAGE]',
                currentEmailInstance.value.instance_data.template_parameters.gb__homepage,
            )
        }

        for (const k in currentEmailInstance.value.instance_data.content_parameters) {
            while (res.indexOf(k) >= 0) {
                res = res.replace(k, currentEmailInstance.value.instance_data.content_parameters[k])
            }
        }
    }

    return res
})

const emailPreview = computed(() => {
    let res = ''

    if (currentEmailInstance.value !== undefined) {
        res = ''
        let theme = emailTemplatesDef.themes.find((x) => x.theme === currentTheme.value)
        if (theme === undefined) {
            theme = emailTemplatesDef.themes.find((x) => x.theme === 'default')
        }
        if (theme === undefined) {
            throw new ClientError('Default theme not found !')
        }
        res = theme.wrapper
        res = res.replace(
            '[gb__title]',
            currentEmailInstance.value.instance_data.template_parameters.gb__title,
        )
        res = res.replace(
            '[gb__content]',
            currentEmailInstance.value.instance_data.template_parameters.gb__content,
        )
        res = res.replace(
            '[gb__footer]',
            currentEmailInstance.value.instance_data.template_parameters.gb__footer,
        )

        while (res.indexOf('[HOMEPAGE]') >= 0) {
            res = res.replace(
                '[HOMEPAGE]',
                currentEmailInstance.value.instance_data.template_parameters.gb__homepage,
            )
        }

        for (const k in currentEmailInstance.value.instance_data.content_parameters) {
            while (res.indexOf(k) >= 0) {
                res = res.replace(k, currentEmailInstance.value.instance_data.content_parameters[k])
            }
        }
    }

    return res
})

async function onLoad() {
    isLoaded.value = true
    fullscreenLoading.show()

    query.value.email = currentEmail.value

    if (currentEmail.value === undefined) {
        throw new ClientError(`Email is undefined`)
    }

    if (query.value.template === undefined) {
        throw new ClientError(`Query template is undefined`)
    }

    currentEmailInstance.value = await adminCommands.getOrCreateEmailDraft({
        email: currentEmail.value,
        template_def: query.value.template,
    })

    await loadInstanceData()

    fullscreenLoading.hide()
}

async function loadInstanceData() {
    if (currentEmailInstance.value !== undefined) {
        if (query.value.template === 'follow_up') {
            await loadFollowUpData()
        }
    }
}

async function loadFollowUpData(
    appId: string | undefined = undefined,
    audienceAngleId: string | undefined = undefined,
) {
    fullscreenLoading.show()

    if (audienceAngleId === undefined && currentEmailInstance.value !== undefined) {
        if (currentEmailInstance.value.instance_data.draft_parameters !== null) {
            audienceAngleId = (
                currentEmailInstance.value.instance_data.draft_parameters as FollowUpDraftParameters
            ).audience_angle_id
        }
    }

    if (appId === undefined && currentEmailInstance.value !== undefined) {
        if (currentEmailInstance.value.instance_data.draft_parameters !== null) {
            appId = (
                currentEmailInstance.value.instance_data.draft_parameters as FollowUpDraftParameters
            ).app_id
        }
    }

    if (currentEmailInstance.value !== undefined) {
        if (audienceAngleId === undefined) {
            throw new ClientError(`audienceAngleId is undefined`)
        }

        if (appId === undefined) {
            throw new ClientError(`appId is undefined`)
        }

        if (currentEmailInstance.value.draft_id === undefined) {
            throw new ClientError(`currentEmailInstance.value.draft_id is undefined`)
        }

        const r = await adminCommands.getFollowupEmailParameters({
            audience_angle_id: audienceAngleId,
            app_id: appId,
            draft_id: currentEmailInstance.value.draft_id,
        })

        currentEmailInstance.value = r.instance

        followupAppIdsItems.value.length = 0
        r.data.all_apps.forEach((x) => {
            followupAppIdsItems.value.push({
                id: x.app_id,
                value: x.title,
            })
        })

        followupAngleItems.value.length = 0
        r.data.all_angles.forEach((x) => {
            followupAngleItems.value.push({
                id: x.audience_angle_id,
                value: x.name,
            })
        })
    }

    fullscreenLoading.hide()
}

function onClose() {
    isLoaded.value = false
    currentEmailInstance.value = undefined
    currentEmail.value = undefined
    query.value.email = undefined
    query.value.template = undefined
}

async function onSave() {
    if (currentEmailInstance.value !== undefined) {
        await adminCommands.saveEmailDraft(currentEmailInstance.value)
    }
}

async function onUpdateFromSheet() {
    fullscreenLoading.show()
    await adminCommands.updateEmailTemplatesFromSheet()
    uiStore.showMessageDialog({
        data: {
            body: 'Email template updated. Click Reset to refresh.',
        },
    })
    fullscreenLoading.hide()
}

async function onSend(toTestUser = false, toCurrentUser = false) {
    if (emailSending) {
        return
    }
    fullscreenLoading.show()
    if (
        currentEmailInstance.value !== undefined &&
        currentEmailInstance.value.draft_id !== undefined
    ) {
        emailSending = true
        await adminCommands.saveEmailDraft(currentEmailInstance.value)
        const res = await adminCommands.sendEmailDraft({
            draft_id: currentEmailInstance.value.draft_id,
            to_test_user: toTestUser,
            to_current_user: toCurrentUser,
        })

        if (res.error !== undefined) {
            uiStore.showMessageDialog({
                data: {
                    type: 'error',
                    body: `ERROR: ${res.error}`,
                },
            })
        } else {
            uiStore.showMessageDialog({
                data: {
                    body: 'Email sent !',
                },
            })
        }

        emailSending = false
    }
    fullscreenLoading.hide()
}

function onAppChange(item: SelectOptionItem) {
    loadFollowUpData(item.id)
}

function onAudienceAngleChange(item: SelectOptionItem) {
    loadFollowUpData(undefined, item.id)
}

async function onReset() {
    fullscreenLoading.show()
    if (currentEmailInstance.value?.draft_id !== undefined) {
        await adminCommands.resetEmailDraft({
            draft_id: currentEmailInstance.value.draft_id,
        })
        await loadInstanceData()
    }
    fullscreenLoading.hide()
}
</script>

<style scoped>
input {
    height: 25px;
    border-radius: 0;
    width: 100%;
}
</style>
