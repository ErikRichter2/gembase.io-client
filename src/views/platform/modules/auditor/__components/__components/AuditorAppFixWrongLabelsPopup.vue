<script setup lang="ts">


import {AppDetail, TTagId, TagDetail, TaggingState} from "@/models/portal/apps/AppsData";
import {TagsHelper} from "@/models/portal/tags/TagsHelper";
import {computed, onMounted, ref} from "vue";
import AuditorAppDetailTags from "@/views/platform/modules/auditor/__components/__components/AuditorAppDetailTags.vue";
import {usePortalStore} from "@/models/portal/PortalStore";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import {AppDetailUtils} from "@/models/portal/apps/AppDetailUtils";
import GbAdminButton from "@/views/platform/ui/GbAdminButton.vue";
import GembaseUiWindowSubtitle from "@/views/ui/GembaseUiWindowSubtitle.vue";
import {useAppsStore} from "@/models/portal/apps/AppsStore";
import GembaseUtils from "@/utils/GembaseUtils";
import {useAuthStore} from "@/models/auth/AuthStore";
import AuditorAppTitleWithDeveloper
    from "@/views/platform/modules/auditor/__components/__components/AuditorAppTitleWithDeveloper.vue";

const portalStore = usePortalStore();

const currentTags = ref<TagDetail[]>([]);
const currentState = ref<TaggingState>();

const props = defineProps<{
    app: AppDetail,
    beforeTags?: TagDetail[],
    overrideTags?: TagDetail[],
    fromAdmin?: boolean | undefined,
    readonly?: boolean
}>();

const emits = defineEmits<{
    (event: "close"),
    (event: "confirmed", tags: TagDetail[], admin?: boolean),
    (event: "rejected")
}>();

onMounted(async () => {
    const appDetail = await useAppsStore().getAppDetailAsync({
        appId: props.app.app_id,
        force: true
    });
    currentTags.value = props.overrideTags !== undefined ? [...props.overrideTags] : GembaseUtils.copy(appDetail.tags);
    currentState.value = appDetail.tagging_state;
});

function toggleTag(tagId: TTagId) {
    currentTags.value = TagsHelper.toggleTag("auditor", currentTags.value, tagId);
}

function onRevert() {
    currentTags.value = [...props.beforeTags ?? []];
}

const isReadOnly = computed(() => {
    if (props.fromAdmin && props.readonly !== undefined) {
        return props.readonly;
    }
    return currentState.value?.users_tags_override_request?.state === 'pending';
});

const fromOwner = computed(() => {
    return props.app.dev_id === useAuthStore().data.user.dev_detail.dev_id;
})

</script>

<template>
    <div class="w-[700px] gb-layout-tl gap-3">
        <div class="gb-layout-ml-row gap-2 pb-2">
            <img class="w-[40px] h-[40px] rounded-lg" :src="AppDetailUtils.getIcon(app)">
            <auditor-app-title-with-developer :app-detail="app"></auditor-app-title-with-developer>
        </div>
        <gembase-ui-window-subtitle close-id="fix-wrong-labels-popup">
            <span>
                Explore Mechanics and Content to discover features with high market potential and low threat score. Tap the features to change product’s position in the market.
            </span>
        </gembase-ui-window-subtitle>
        <div class="h-[calc(100vh-300px)]">
            <auditor-app-detail-tags :show-diff="true" :original-tags="beforeTags" class="gb-ui-svg-current pl-2 pr-2 pt-2 w-full h-full" @toggle-tag="toggleTag" :readonly="isReadOnly" :tags-def="portalStore.tagsTreeView" :app-detail="app" :tags="currentTags"></auditor-app-detail-tags>
        </div>
        <div class="gb-layout-tl-row gap-2">
            <template v-if="fromAdmin === true || fromOwner === true">
                <gb-button :disabled="isReadOnly" @click="emits('confirmed', currentTags)" class="gbc-bg-primary" text="Save changes" icon="save"></gb-button>
                <gb-button :disabled="isReadOnly" @click="emits('rejected')" class="gbc-bg-alert" text="Reject" icon="flip_card"></gb-button>
            </template>
            <template v-else>
                <gb-button :disabled="isReadOnly" @click="emits('confirmed', currentTags)" class="gbc-bg-primary" text="Request to change labels" icon="email"></gb-button>
                <gb-admin-button @click="emits('confirmed', currentTags, true)" text="Admin: Save changes"></gb-admin-button>
            </template>
        </div>
    </div>
</template>
