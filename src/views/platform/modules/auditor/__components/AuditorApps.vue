<script setup lang="ts">

import {usePortalStore} from "@/models/portal/PortalStore";
import {computed, onMounted, onUnmounted, ref, watch} from "vue";
import {
    AppDetail,
    AppDetailGalleryImage,
    AppPlatformEnum,
    AppStoreEnum,
    AppTypeEnum,
    IAppImageSrc,
    TAppId,
    TTagId,
    TagDetail,
    TaggingState, IAppIcon
} from "@/models/portal/apps/AppsData";
import {
    AppDetailChanges,
    AppGalleryChanges,
    StoreAppSearch,
} from "@/models/portal/PortalDataTypes";
import {TagsViewTagData} from "@/models/portal/platformProduct/PlatformProductData";
import {PlatformProductTreeView, TagsModel} from "@/models/portal/tags/TagsModel";
import GembaseUtils from "@/utils/GembaseUtils";
import GembaseUiWindowCloseBtn from "@/views/ui/GembaseUiWindowCloseBtn.vue";
import AuditorAppDetailTags from "@/views/platform/modules/auditor/__components/__components/AuditorAppDetailTags.vue";
import AuditorAppDetailInfo from "@/views/platform/modules/auditor/__components/__components/AuditorAppDetailInfo.vue";
import AuditorAppDetailInfoEdit from "@/views/platform/modules/auditor/__components/__components/AuditorAppDetailInfoEdit.vue";
import AuditorPopupAddNewApp from "@/views/platform/modules/auditor/__components/__components/AuditorPopupAddNewApp.vue";
import AuditorPopupAddLiveApp from "@/views/platform/modules/auditor/__components/__components/AuditorPopupAddLiveApp.vue";
import AuditorPopupUploadImage from "@/views/platform/modules/auditor/__components/__components/AuditorPopupUploadImage.vue";
import AuditorPopupDiscardChanges from "@/views/platform/modules/auditor/__components/__components/AuditorPopupDiscardChanges.vue";
import AuditorPopupRemoveApp from "@/views/platform/modules/auditor/__components/__components/AuditorPopupRemoveApp.vue";
import {AuditorQueryParams} from "@/models/portal/auditor/AuditorData";
import PortalUiRouterLink from "@/views/ui/router/PortalUiRouterLink.vue";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import {useTaggingStore} from "@/models/portal/tags/TaggingStore";
import {PortalConstants} from "@/models/portal/PortalConstants";
import {useTutorialStore} from "@/models/portal/tutorial/TutorialStore";
import AuditorAppFixWrongLabelsPopup
    from "@/views/platform/modules/auditor/__components/__components/AuditorAppFixWrongLabelsPopup.vue";
import {TagsHelper} from "@/models/portal/tags/TagsHelper";
import EndpointRequest from "@/core/requests/EndpointRequest";
import GbAdminButton from "@/views/platform/ui/GbAdminButton.vue";
import AuditorAppKpis from "@/views/platform/modules/auditor/__components/__components/AuditorAppKpis.vue";
import AuditorAppDetailKpis from "@/views/platform/modules/auditor/__components/__components/AuditorAppDetailKpis.vue";
import {useAppsStore} from "@/models/portal/apps/AppsStore";
import GbWindow from "@/views/ui/popups/GbWindow.vue";
import GbPopup from "@/views/ui/popups/GbPopup.vue";
import InteractiveImage from "@/views/ui/img/InteractiveImage.vue";
import {useRouterQuery} from "@/core/router/query/RouterQueryComposable";
import PlatformAppIcon from "@/views/platform/modules/__components/PlatformAppIcon.vue";
import AuditorAppStoreIconLink
    from "@/views/platform/modules/auditor/__components/__components/AuditorAppStoreIconLink.vue";
import AuditorAppTitleWithDeveloper
    from "@/views/platform/modules/auditor/__components/__components/AuditorAppTitleWithDeveloper.vue";
import AuditorGamesExplorerDeveloperRouteElement
    from "@/views/platform/modules/auditor/__components/__components/AuditorGamesExplorerDeveloperRouteElement.vue";
import {useFullscreenLoading} from "@/models/ui/FullscreenLoadingComposable";

const portalStore = usePortalStore();
const taggingStore = useTaggingStore();
const routerQuery = useRouterQuery<AuditorQueryParams>();
const fullscreenLoading = useFullscreenLoading();

enum ETabId {
    DETAILS,
    TAGS,
    KPIS
}

const currentApp = ref<AppDetail>();
const currentAppChanges = ref<AppDetailChanges>();
const currentGalleryChanges = ref<AppGalleryChanges>();
const currentIconChange = ref<{file: File, imageUrl: string}>();
const currentTab = ref<ETabId>(ETabId.KPIS);
const isEdit = ref(false);
const initialized = ref(false);
const isAddNewPopup = ref(false);
const isAddLiveGamePopup = ref(false);
const uploadImagePopup = ref(false);
const uploadImageType = ref<"gallery" | "icon">("gallery");
const discardEditChangesPopup = ref(false);
const removeAppConfirmPopup = ref(false);
const editLabelsPopup = ref(false);
const selectedGalleryImage = ref<IAppImageSrc>();
const editLabelsPopupConfirmation = ref(false);
const autoLabelBlinker = ref(0);

const context = "auditor-apps";

let tagsTreeCategoryView: PlatformProductTreeView<TagsViewTagData> | undefined = undefined;
let isTempApp = false;
let prevAppIdBeforeTempApp: TAppId | null = null;
let taggingRetryDeltaSecondsSetInterval = 0;
let landingProgressSetInterval = 0;

const actualTags = computed((): TagDetail[] | undefined => {
    if (isEdit.value) {
        return currentAppChanges.value?.tags;
    }
    return currentApp.value?.tags;
});

watch(() => routerQuery.query.value.appId, () => {
    if (initialized.value && routerQuery.query.value.show === undefined) {
        refreshCurrentApp();
    }
});

async function refreshCurrentApp(force = false) {
    fullscreenLoading.show({
        reason: "portal-my-apps",
        timeout: 500
    });

    const appId = routerQuery.query.value.appId;

    if (!force && appId !== undefined && appId === currentApp.value?.app_id) {
        fullscreenLoading.hide("portal-my-apps");
        return;
    }

    if (appId === undefined) {
        if (useTutorialStore().isAuditorTutorial()) {
            await routerQuery.replace({appId: useTutorialStore().tutorialAppId});
            fullscreenLoading.hide("portal-my-apps");
            return;
        } else if (portalStore.my_apps.length > 0) {
            await routerQuery.replace({appId: portalStore.my_apps[0]});
            fullscreenLoading.hide("portal-my-apps");
            return;
        } else {
            fullscreenLoading.hide("portal-my-apps");
            currentApp.value = undefined;
            return;
        }
    }

    const appDetail = await useAppsStore().getAppDetailAsync({
        appId: appId,
        includeGallery: true
    });

    if (appId !== routerQuery.query.value.appId) {
        fullscreenLoading.hide("portal-my-apps");
        return;
    }

    currentApp.value = appDetail;

    if (currentApp.value?.app_id !== undefined && currentApp.value?.app_type === AppTypeEnum.STORE) {
        await taggingStore.tagStoreAppIfNotTagged(currentApp.value.app_id, "auditor");
    }

    selectedGalleryImage.value = undefined;
    if (currentApp.value?.gallery !== undefined) {
        if (currentApp.value?.gallery.length > 0) {
            selectedGalleryImage.value = currentApp.value?.gallery[0];
        }
    }

    startTaggingProcessChecker();

    fullscreenLoading.hide("portal-my-apps");
}

onMounted(async () => {
    fullscreenLoading.show();

    const tags: TagsViewTagData[] = [];
    portalStore.portalDefProduct.forEach((x) => {
        tags.push({
            tagDef: x,
            readonly: portalStore.isAuditorLocked()
        })
    });

    tagsTreeCategoryView = TagsModel.createTreeView(tags);

    await portalStore.loadDevsAppsDetails();
    await portalStore.getMyAppDetailsAsync();

    selectedGalleryImage.value = undefined;
    initialized.value = true;

    await refreshCurrentApp();

    fullscreenLoading.hide();

    startTaggingRetryCountdown();
});

onUnmounted(() => {
    stopTaggingProcessChecker();
    stopCheckForScrapState();
});

const currentTabFinal = computed((): ETabId => {
    if (currentApp.value?.app_type !== AppTypeEnum.STORE && currentTab.value === ETabId.KPIS) {
        return ETabId.DETAILS;
    }

    return currentTab.value;
})

function startTaggingRetryCountdown() {
    window.clearInterval(taggingRetryDeltaSecondsSetInterval);
    taggingRetryDeltaSecondsSetInterval = window.setInterval(() => {
        if (currentApp.value?.tagging_state !== undefined && currentApp.value?.tagging_state.retry_countdown !== undefined) {
            if (currentApp.value.tagging_state.retry_countdown > 0) {
                currentApp.value.tagging_state.retry_countdown -= 1;
            }
        }
    }, 1000);
}

function onEditConcept() {
    isEdit.value = true;
    createAppChanges();
}

function onRemoveImage(imageId: number) {
    if (currentGalleryChanges.value !== undefined) {
        for (let i = 0; i < currentGalleryChanges.value.gallery.length; ++i) {
            const image = currentGalleryChanges.value.gallery[i];
            if (image.id === imageId) {
                currentGalleryChanges.value.gallery.splice(i, 1);
                if (image.id > 0) {
                    if (currentAppChanges.value !== undefined) {
                        currentAppChanges.value.removed_images ??= [];
                        currentAppChanges.value.removed_images.push(image.id);
                        currentAppChanges.value.wasChange = true;
                    }
                }
                break;
            }
        }
        if (currentGalleryChanges.value.added_images !== undefined) {
            for (let i = 0; i < currentGalleryChanges.value.added_images.length; ++i) {
                if (currentGalleryChanges.value.added_images[i].id === imageId) {
                    currentGalleryChanges.value.added_images.splice(i, 1);
                    currentGalleryChanges.value.wasChange = true;
                    break;
                }
            }
        }
    }
}

function uploadImage(e: Event, imageType?: string | "icon" | "gallery") {
    const htmlInput = e.target as HTMLInputElement;
    if (htmlInput.files !== null) {
        const image = htmlInput.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onload = e => {
            const imageUrl = e.target?.result as string

            if (imageType === "icon") {
                currentIconChange.value = {
                    file: image,
                    imageUrl: imageUrl
                };
            } else {
                if (currentGalleryChanges.value !== undefined) {
                    const imageId = -(currentGalleryChanges.value.added_images.length + 1);
                    currentGalleryChanges.value.added_images.push({
                        id: imageId,
                        file: image
                    });
                    currentGalleryChanges.value.gallery.push({
                        id: imageId,
                        img_order: currentGalleryChanges.value.gallery.length + 1,
                        store_url: imageUrl
                    });
                    currentGalleryChanges.value.wasChange = true;
                }
            }


            uploadImagePopup.value = false;
        };
    }
}

function createAppChanges() {
    if (currentApp.value !== undefined) {
        const gallery: AppDetailGalleryImage[] = [];
        if (currentApp.value.gallery !== undefined) {
            gallery.push(...currentApp.value.gallery);
        }
        currentAppChanges.value = {
            description: currentApp.value.description,
            title: currentApp.value.title,
            icon: currentApp.value.icon,
            removed_images: [],
            tags: [...currentApp.value.tags]
        }
        currentGalleryChanges.value = {
            gallery: gallery,
            added_images: []
        }
    } else {
        currentGalleryChanges.value = {
            gallery: [],
            added_images: []
        }
        currentAppChanges.value = {
            description: "",
            icon: "",
            title: "",
            removed_images: [],
        }
    }
}

function onTitleChange(title: string) {
    if (currentAppChanges.value !== undefined) {
        currentAppChanges.value.title = title;
        currentAppChanges.value.wasChange = true;
    }
}

const myApps = computed((): AppDetail[] => {
    const res: AppDetail[] = [];

    if (initialized.value === false) {
        return res;
    }

    portalStore.my_apps.forEach((x) => {
        res.push(useAppsStore().getAppDetail(x));
    });

    return res;
});

async function setTempApp() {
    fullscreenLoading.show({
        reason: "set-temp-app"
    });

    prevAppIdBeforeTempApp = null;
    if (currentApp.value !== undefined) {
        prevAppIdBeforeTempApp = currentApp.value.app_id;
    }

    const appId = "TemporaryConcept";
    currentApp.value = {
        store: AppStoreEnum.GOOGLE_PLAY,
        app_id: appId,
        description: "",
        app_type: AppTypeEnum.CONCEPT,
        title: "",
        icon: "",
        platform: AppPlatformEnum.MOBILE,
        app_id_in_store: "",
        tier: 0,
        growth: 0,
        app_store_url: "",
        locked: false,
        tagged_by_user: 0,
        released_year: 0,
        rating: 0,
        installs: 0,
        tam: 0,
        tags: [],
        tagging_state: {
            state: "not_tagged",
            app_id: appId
        }
    }

    createAppChanges();
    isTempApp = true;
    isAddNewPopup.value = false;
    isEdit.value = true;
    currentTab.value = ETabId.DETAILS;

    await routerQuery.replace({appId: appId});

    fullscreenLoading.hide("set-temp-app");
}


function stopCheckForScrapState() {
    if (landingProgressSetInterval > 0) {
        window.clearInterval(landingProgressSetInterval);
        landingProgressSetInterval = 0;
    }
}

async function onSaveChanges() {
    fullscreenLoading.show();

    if (currentApp.value !== undefined && currentAppChanges.value !== undefined) {
        if (isTempApp) {
            const appDetail = await portalStore.createConceptAppFromTemp(
                currentAppChanges.value
            );
            await routerQuery.replace({appId: appDetail.app_id});
            await refreshCurrentApp(true);
        } else {
            currentApp.value = await portalStore.saveConceptApp(
                currentApp.value.app_id,
                currentAppChanges.value,
                currentGalleryChanges.value,
                currentIconChange.value?.file
            );
        }
    }

    isTempApp = false;
    currentAppChanges.value = undefined;
    currentIconChange.value = undefined;
    isEdit.value = false;

    fullscreenLoading.hide();
}

async function startTaggingProcessChecker() {
    stopTaggingProcessChecker();

    if (currentApp.value?.app_id !== undefined) {
        taggingStore.checkTaggingState(
            context,
            currentApp.value.app_id,
            async (taggingState: TaggingState) => {
                if (currentApp.value === undefined) {
                    return;
                }

                if (taggingState.app_id !== currentApp.value.app_id) {
                    return;
                }

                currentApp.value.tagging_state = taggingState;

                if (taggingState.state === "done") {
                    currentApp.value = await useAppsStore().getAppDetailAsync({
                        appId: currentApp.value.app_id,
                        force: true
                    });
                }
            }
        )
    }
}

function stopTaggingProcessChecker() {
    taggingStore.removeContext(context);
    if (taggingRetryDeltaSecondsSetInterval > 0) {
        window.clearInterval(taggingRetryDeltaSecondsSetInterval);
        taggingRetryDeltaSecondsSetInterval = 0;
    }
}

function toggleTag(tagId: TTagId) {
    if (!isEdit.value) {
        return;
    }
    if (currentAppChanges.value === undefined) {
        return;
    }
    if (currentAppChanges.value.tags === undefined) {
        currentAppChanges.value.tags = [];
    }
    currentAppChanges.value.tags = TagsHelper.toggleTag("auditor", currentAppChanges.value.tags, tagId);
}

async function onRemoveApp() {
    removeAppConfirmPopup.value = false;

    if (currentApp.value === undefined) {
        return;
    }

    fullscreenLoading.show({
        reason: "on-delete"
    });

    let ix = portalStore.my_apps.indexOf(currentApp.value?.app_id);
    if (ix === portalStore.my_apps.length - 1) {
        ix -= 1;
    }

    await portalStore.removeAppFromMyApps(currentApp.value?.app_id);
    await routerQuery.replace({appId: undefined});

    fullscreenLoading.hide("on-delete");
}

async function copy() {
    if (currentApp.value === undefined) {
        return;
    }

    if (portalStore.isAuditorLocked()) {
        return;
    }

    fullscreenLoading.show();
    currentApp.value = await portalStore.createConceptAsCopy(currentApp.value?.app_id);
    await routerQuery.push({appId: currentApp.value?.app_id});
    fullscreenLoading.hide();
}

async function onHintSelected(hint: StoreAppSearch) {
    isAddLiveGamePopup.value = false;
    isAddNewPopup.value = false;
    fullscreenLoading.show();
    const appDetail = await portalStore.addAppFromStoreToMyApps(hint.app_id_in_store, hint.store);
    await routerQuery.replace({appId: appDetail.app_id});
    fullscreenLoading.hide();
}

async function onCloseEditMode(discardChanges = false) {
    if (!discardChanges) {
        if (currentIconChange.value !== undefined || currentAppChanges.value?.wasChange === true || currentGalleryChanges.value?.wasChange === true) {
            discardEditChangesPopup.value = true;
            return;
        }
    }

    currentIconChange.value = undefined;
    currentAppChanges.value = undefined;
    isEdit.value = false;
    isTempApp = false;
    isAddNewPopup.value = false;
    isAddLiveGamePopup.value = false;
    if (prevAppIdBeforeTempApp != null) {
        await routerQuery.push({appId: prevAppIdBeforeTempApp});
        prevAppIdBeforeTempApp = null;
    }
}

const taggingProcessRetryCountdown = computed((): string | null => {
    if (currentApp.value?.tagging_state?.state === "retry") {
        startTaggingRetryCountdown();
        return GembaseUtils.deltaSecondsFormat(currentApp.value?.tagging_state?.retry_countdown);
    }
    return null;
});

async function onAddCurrentAppToMyApps() {
    if (currentApp.value !== undefined) {
        await portalStore.addAppFromStoreToMyApps(currentApp.value.app_id_in_store, currentApp.value.store);
        await routerQuery.push({appId: currentApp.value?.app_id});
    }
}

const autoLabelButtonTitle = computed((): string => {
    return taggingProcessRetryCountdown.value !== null ? `Auto-Label resumes in ${taggingProcessRetryCountdown.value}` : "Auto-Label";
});

const auditButtonTooltip = computed(() => {
    const res = "Show potential";
    if (isAuditButtonDisabled.value === true) {
        return "Label or Auto-label game first.";
    } else if (currentApp.value?.tagging_state?.state !== "done") {
        return `${res} (available when game is labeled)`;
    }
    return res;
});

const taggingProgressWidth = computed((): number | undefined => {
    if (currentApp.value?.tagging_state?.state === "done") {
        return undefined;
    }
    if (currentApp.value?.tagging_state?.state !== "queue" &&
        currentApp.value?.tagging_state?.state !== "working") {
        return undefined;
    }
    if (currentApp.value?.tagging_state?.progress !== undefined) {
        return currentApp.value?.tagging_state?.progress;
    }
    return 0;
});

async function onAutoLabel() {
    if (currentApp.value === undefined || currentApp.value?.app_type !== AppTypeEnum.CONCEPT) {
        return;
    }
    currentTab.value = ETabId.TAGS;
    await portalStore.tagConceptApp(currentApp.value.app_id, "auditor");
    startTaggingProcessChecker();
}

async function onConfirmUserTagsOverride(tagsOverride: TagDetail[], admin?: boolean) {
    fullscreenLoading.show();
    if (admin && portalStore.isAdmin) {
        await EndpointRequest.process2("admin:save_tags_for_existing_app", {
            app_id: currentApp.value?.app_id,
            tags_details: tagsOverride
        });
        window.location.reload();
    } else {
        const res = await EndpointRequest.process2<{
            state: "pending" | "accepted"
        }>("portal:request_tags_override_by_user", {
            app_id: currentApp.value?.app_id,
            tags_details: tagsOverride
        });
        if (res.state === "accepted") {
            window.location.reload();
        } else {
            editLabelsPopupConfirmation.value = true;
        }
    }
    editLabelsPopup.value = false;
    if (currentApp.value?.tagging_state !== undefined) {
        currentApp.value.tagging_state.users_tags_override_request = {
            state: "pending"
        }
    }
    fullscreenLoading.hide();
}

const appIcon = computed((): IAppIcon | undefined => {
    if (currentIconChange.value !== undefined) {
        return {
            locked: false,
            icon: currentIconChange.value.imageUrl
        };
    }

    return currentApp.value;
});

async function onAdminAutoLabel() {
    if (currentApp.value?.app_id !== undefined && currentApp.value?.app_type === AppTypeEnum.STORE) {
        await taggingStore.tagStoreAppIfNotTagged(
            currentApp.value.app_id, "auditor", true);
        await startTaggingProcessChecker();
    }
}

const isAuditButtonDisabled = computed(() => {
    return currentApp.value?.tagging_state?.state !== 'done' || currentApp.value?.tags?.length === 0;
});

</script>

<template>
    <gb-window :hide-close="isEdit">
        <div class="h-full w-full min-w-[400px] max-w-[calc(100vw-100px)]">
            <gembase-ui-window-close-btn v-if="isEdit" :prevent-route-back="true" @on-close="onCloseEditMode"></gembase-ui-window-close-btn>

            <div class="gb-layout-ml">
                <div class="gb-layout-tl">
                    <div class="gb-ui-window-header">
                        {{ isEdit ? 'Edit concept' : `Manage your apps${portalStore.titleDemo()}` }}
                    </div>
                    <div v-if="currentApp === undefined && myApps.length === 0" class="gb-inner-window">
                        <div class="gb-layout-tl gap-2 p-2">
                            <div>No games in portfolio. Please add a new:</div>
                            <auditor-popup-add-new-app @confirm="(x) => x ? setTempApp() : isAddLiveGamePopup = true"></auditor-popup-add-new-app>
                        </div>
                    </div>
                    <div v-else-if="!isEdit" class="gb-layout-ml-row gap-2 w-full h-full pl-2 pr-2 pb-1">
                        <div class="gb-layout-ml-row gb-ui-scroll-h max-w-[750px] gap-[2px] h-[50px]">
                            <template v-for="app in myApps" :key="app.app_id">
                                <div class="relative pb-1">
                                    <portal-ui-router-link :replace="true" :query="routerQuery.getMerge({appId: app.app_id})">
                                        <interactive-image class="w-[40px] h-[40px] rounded-md">
                                            <platform-app-icon :app-icon="app" :default-black-border="true" :selected="app.app_id === currentApp?.app_id" class="w-full h-full"></platform-app-icon>
                                        </interactive-image>
                                    </portal-ui-router-link>
                                </div>
                            </template>
                        </div>
                        <gb-button @click="isAddNewPopup = true;" tooltip="Add new app to my apps" icon="plus" class="gbc-bg-primary"></gb-button>
                        <auditor-games-explorer-developer-route-element v-if="portalStore.my_apps.length > 0" dev-id="" :my-apps="true"></auditor-games-explorer-developer-route-element>
                    </div>
                </div>
                <!-- APP DETAIL >> -->
                <div v-if="currentApp !== undefined" class="gb-inner-window">
                    <div class="gb-layout-ml w-full gap-2 pt-5 pb-2">
                        <div class="gb-layout-ml-row pl-2 w-full gap-2 font-bold text-[1em]">
                            <a :href="currentApp.app_store_url" target="_blank">
                                <div class="w-[70px] h-[70px]">
                                    <platform-app-icon class="w-full h-full rounded-xl" :default-black-border="true" :app-icon="appIcon"></platform-app-icon>
                                </div>
                            </a>
                            <template v-if="isEdit">
                                <input class="w-full text-black" placeholder="Enter title ..." @input="event => onTitleChange((event.target as HTMLInputElement).value)" :value="currentApp !== undefined ? currentApp.title : ''">
                            </template>
                            <div v-else class="gb-layout-tl">
                                <div class="gb-layout-m-between w-full pr-2">
                                    <div class="gb-layout-ml-row pl-1 gap-2">
                                        <auditor-app-title-with-developer :app-detail="currentApp"></auditor-app-title-with-developer>
                                        <div class="gb-layout-tl-row gap-2">
                                            <gb-button v-if="currentApp.app_type === AppTypeEnum.STORE && !portalStore.my_apps.includes(currentApp.app_id)" @click="onAddCurrentAppToMyApps" class="gbc-bg-primary" icon="plus" data-tooltip="Add to my games in Auditor"></gb-button>
                                            <auditor-games-explorer-developer-route-element v-if="currentApp.dev_id !== undefined" :dev-id="currentApp.dev_id"></auditor-games-explorer-developer-route-element>
                                            <auditor-app-store-icon-link :app="currentApp"></auditor-app-store-icon-link>
                                        </div>
                                    </div>
                                </div>
                                <auditor-app-kpis :app-detail="currentApp"></auditor-app-kpis>
                            </div>
                        </div>
                        <div class="gb-layout-row pl-2 pr-2 text-[0.8em] w-[900px] max-h-[600px] h-[calc(100vh-450px)] data-[edit='true']:h-[calc(100vh-400px)]" :data-edit="isEdit">
                            <!-- DETAILS >> -->
                            <div v-if="currentTabFinal === ETabId.DETAILS" class="gb-layout-row w-full h-full gap-5">
                                <auditor-app-detail-info-edit v-if="isEdit && currentAppChanges !== undefined" v-model="currentAppChanges" :gallery="currentGalleryChanges" @on-add-image="uploadImageType = 'gallery'; uploadImagePopup = true;" @on-remove-image="onRemoveImage"></auditor-app-detail-info-edit>
                                <auditor-app-detail-info v-else :app-detail="currentApp"></auditor-app-detail-info>
                            </div>
                            <!-- << DETAILS -->
                            <!-- TAGS >> -->
                            <template v-if="currentTabFinal === ETabId.TAGS">
                                <auditor-app-detail-tags class="gb-ui-svg-current w-full h-full" @toggle-tag="toggleTag" :tags-def="tagsTreeCategoryView" :readonly="!isEdit " :app-detail="currentApp" :tags="actualTags" :tagging-progress-width="taggingProgressWidth"></auditor-app-detail-tags>
                            </template>
                            <!-- << TAGS -->
                            <!-- KPIS >> -->
                            <template v-if="currentTabFinal === ETabId.KPIS">
                                <auditor-app-detail-kpis :app-detail="currentApp"></auditor-app-detail-kpis>
                            </template>
                            <!-- << KPIS -->
                        </div>
                        <div class="gb-layout-b-between pl-2 pr-2 w-full">
                            <div class="gb-layout-bc-row gap-2 h-[40px]">
                                <gb-button v-if="currentApp.app_type === AppTypeEnum.STORE && (currentTabFinal === ETabId.DETAILS || currentTabFinal === ETabId.TAGS)" @click="currentTab = ETabId.KPIS" class="gbc-bg-secondary" text="KPIs" icon="tags"></gb-button>
                                <gb-button v-if="currentTabFinal === ETabId.DETAILS || currentTabFinal === ETabId.KPIS" @click="currentTab = ETabId.TAGS" class="gbc-bg-secondary" text="Labels" icon="tags"></gb-button>
                                <gb-button v-if="currentTabFinal === ETabId.TAGS || currentTabFinal === ETabId.KPIS" @click="currentTab = ETabId.DETAILS" class="gbc-bg-secondary" text="Details" icon="edit_question"></gb-button>

                                <div v-if="currentTabFinal === ETabId.TAGS" class="relative w-fit">
                                    <gb-button v-if="currentApp.app_type === AppTypeEnum.STORE" :demo="portalStore.isAuditorLocked()"  @click="editLabelsPopup = true" class="gbc-bg-primary" text="Fix wrong labels" icon="edit_question.svg"></gb-button>
                                    <div class="absolute w-full gb-layout text-[12px] whitespace-nowrap">
                                        <div v-if="currentApp?.tagging_state?.users_tags_override_request?.state === 'pending'" class=" text-yellow">
                                            Fix is being reviewed...
                                        </div>
                                    </div>
                                </div>
                                <gb-admin-button @click="onAdminAutoLabel" :hide-on-prod="true" text="auto-label"></gb-admin-button>
                                <div v-if="!isEdit" class="relative w-fit">
                                    <gb-button @click="onAutoLabel" class="gbc-bg-primary" :blink-anim="autoLabelBlinker" :demo="!portalStore.canTagConcept(currentApp.app_id)" :disabled="!(currentApp?.app_type === AppTypeEnum.CONCEPT)" icon="auto_tag" :tooltip="autoLabelButtonTitle" text="Auto-Label"></gb-button>
                                    <div class="absolute w-full gb-layout text-[12px] whitespace-nowrap">
                                        <div class="text-primary" v-if="taggingProcessRetryCountdown !== null">
                                            Overload. Please try later.
                                        </div>
                                        <div v-else-if="portalStore.isAdmin && currentApp.tagged_t !== null" data-admin="true">
                                            Labeled {{GembaseUtils.timestampDaysDiff(currentApp.tagged_t)}} days ago
                                        </div>
                                        <div v-else-if="currentApp?.tagging_state?.state === 'queue' || currentApp?.tagging_state?.state === 'working'" class="text-yellow">
                                            Game is being labeled ...
                                        </div>
                                    </div>
                                </div>
                                <gb-button v-if="!isEdit && currentApp.app_type === AppTypeEnum.CONCEPT" @click="onEditConcept" :demo="portalStore.isAuditorLocked()" class="gbc-bg-primary" icon="mechanics" text="Edit"></gb-button>
                                <gb-button v-if="!isEdit && portalStore.my_apps.includes(currentApp.app_id)" @click="copy" class="gbc-bg-primary" :demo="portalStore.isAuditorLocked()" tooltip="Copy game" icon="copy"></gb-button>
                                <gb-button v-if="!isEdit && portalStore.my_apps.includes(currentApp.app_id)" @click="removeAppConfirmPopup = true" class="gbc-bg-primary" icon="delete" tooltip="Remove game"></gb-button>
                                <gb-button v-if="isEdit" @click="uploadImageType = 'icon'; uploadImagePopup = true;" class="gbc-bg-primary" text="Choose icon"></gb-button>
                            </div>
                            <div class="gb-layout-row">
                                <gb-button v-if="isEdit" @click="onSaveChanges" class="gbc-bg-primary" icon="check_single" text="Save changes"></gb-button>
                                <div v-if="!isEdit" class="relative">
                                    <portal-ui-router-link :query="{appId: currentApp.app_id, show: 'audit'} as AuditorQueryParams" :disabled="currentApp.locked || currentApp?.tagging_state?.state !== 'done' || currentApp?.tags.length === 0">
                                        <gb-button @click="() => {if (isAuditButtonDisabled) {autoLabelBlinker += 1;}}" id="auditor_audit" class="gbc-bg-primary" :demo="currentApp.locked" :inactive="isAuditButtonDisabled" :icon="PortalConstants.ICON_TUNER" :tooltip="auditButtonTooltip" text="Audit"></gb-button>
                                    </portal-ui-router-link>
                                    <div v-if="isAuditButtonDisabled" class="absolute text-[0.5em] whitespace-nowrap">Label the game first.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- << APP DETAIL -->
            </div>
        </div>

        <gb-popup v-model="isAddNewPopup" header="Add new:">
            <auditor-popup-add-new-app @confirm="(x) => x ? setTempApp() : isAddLiveGamePopup = true"></auditor-popup-add-new-app>
        </gb-popup>
        <gb-popup v-model="isAddLiveGamePopup" header="Add new live game:">
            <auditor-popup-add-live-app @confirm="onHintSelected"></auditor-popup-add-live-app>
        </gb-popup>
        <gb-popup v-model="uploadImagePopup">
            <auditor-popup-upload-image @change="uploadImage" :image-type="uploadImageType"></auditor-popup-upload-image>
        </gb-popup>
        <gb-popup v-model="discardEditChangesPopup" header="Exit without saving changes ?">
            <auditor-popup-discard-changes @confirm="() => {discardEditChangesPopup = false; onCloseEditMode(true);}"></auditor-popup-discard-changes>
        </gb-popup>
        <gb-popup v-model="removeAppConfirmPopup" header="Remove app ?">
            <auditor-popup-remove-app v-if="currentApp" :app="currentApp" @confirm="onRemoveApp"></auditor-popup-remove-app>
        </gb-popup>
        <gb-popup v-model="editLabelsPopup">
            <auditor-app-fix-wrong-labels-popup @confirmed="onConfirmUserTagsOverride" @close="editLabelsPopup = false" v-if="currentApp" :app="currentApp"></auditor-app-fix-wrong-labels-popup>
        </gb-popup>
        <gb-popup v-model="editLabelsPopupConfirmation">
            <div class="pt-10">Your proposed labels changes have been sent for a review.</div>
        </gb-popup>

    </gb-window>
</template>
