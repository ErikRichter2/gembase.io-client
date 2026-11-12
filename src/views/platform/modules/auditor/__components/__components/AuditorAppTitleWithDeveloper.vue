<script setup lang="ts">
import { computed } from 'vue'
import { type AppDetail, AppTypeEnum, type TagDetail } from '@/models/portal/apps/AppsData'
import { usePortalStore } from '@/models/portal/PortalStore'
import { TagsHelper } from '@/models/portal/tags/TagsHelper'
import { type IPlatformCalcAffinity } from '@/models/portal/calc/PlatformCalcData'
import { useSessionStore } from '@/stores/SessionStore'

const portalStore = usePortalStore()

const props = defineProps<{
    appDetail?: AppDetail
    tags?: TagDetail[]
    demo?: boolean
    opportunity?: IPlatformCalcAffinity
    forceConcept?: boolean
}>()

const devTitle = computed((): string | null => {
    let prefix = ''
    let devStoreUrl = ''
    let devTitle = ''

    const sessionStore = useSessionStore()

    if (props.opportunity !== undefined) {
        prefix = 'Opportunity '
        devTitle = sessionStore.userData.dev_detail.title
        devStoreUrl = sessionStore.userData.dev_detail.dev_store_url ?? ''
    } else {
        if (props.appDetail !== undefined) {
            devStoreUrl = props.appDetail.dev_store_url ?? ''
            devTitle = props.appDetail.dev_title ?? ''

            if (props.appDetail.app_type === AppTypeEnum.CONCEPT) {
                devTitle = sessionStore.userData.dev_detail.title
                devStoreUrl = sessionStore.userData.dev_detail.dev_store_url ?? ''
            }

            if (props.forceConcept) {
                prefix = 'Concept game '
            } else if (props.appDetail.removed_from_store === 1) {
                prefix = 'Shelved game '
            } else {
                if (props.appDetail.app_type === AppTypeEnum.STORE) {
                    prefix = 'Live game '
                } else if (props.appDetail.app_type === AppTypeEnum.CONCEPT) {
                    prefix = 'Concept game '
                }
            }
        }
    }

    if (devTitle !== undefined) {
        if (devStoreUrl !== undefined) {
            return `${prefix}by <a href="${devStoreUrl}" target="_blank">${devTitle}</a>`
        }
        return `${prefix}by ${devTitle}`
    }

    return null
})
</script>

<template>
    <div class="gb-layout-ml leading-[1.1rem]">
        <div class="text-[1.15em] font-bold">
            {{
                portalStore.getAppTitle(
                    props.appDetail,
                    TagsHelper.getTagsList(props.tags),
                    opportunity,
                )
            }}{{
                props.forceConcept === true && props.appDetail?.app_type === AppTypeEnum.STORE
                    ? ' (concept)'
                    : ''
            }}{{ props.demo === true ? ' (DEMO)' : '' }}
        </div>
        <div v-if="devTitle !== null" v-html="devTitle" class="font-normal text-[0.7em]"></div>
    </div>
</template>
