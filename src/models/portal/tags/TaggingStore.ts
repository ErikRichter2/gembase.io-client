import {defineStore} from "pinia";
import EndpointRequest from "@/core/requests/EndpointRequest";
import {TAppId, TaggingState} from "@/models/portal/apps/AppsData";
import {__taggedInSession, TaggingProcessChecker} from "@/models/portal/tags/TaggingProcessChecker";
import GembaseUtils from "@/utils/GembaseUtils";

interface ITaggingListener {
    context: string,
    appId: TAppId,
    callback: (TaggingState) => void
}

const __taggedApps: TAppId[] = [];
const __listeners: ITaggingListener[] = [];
const __taggingStateCheckers: Map<TAppId, TaggingProcessChecker> =
    new Map<TAppId, TaggingProcessChecker>();

function __addListener(listener: ITaggingListener) {
    __listeners.push(listener);
    if (!__taggingStateCheckers.has(listener.appId)) {
        const taggingStateChecker = new TaggingProcessChecker(
            listener.appId
        );
        __taggingStateCheckers.set(listener.appId, taggingStateChecker);
        taggingStateChecker.start(__taggingCheckerCallback);
    }
}

function __taggingCheckerCallback(
    taggingStateChecker: TaggingProcessChecker,
    taggingState: TaggingState) {

    if (taggingState.state === "done") {
        __taggedApps.push(taggingState.app_id);
    }

    __listeners.forEach((x) => {
        if (x.appId === taggingStateChecker.appId) {
            x.callback(taggingState);
        }
    });

    if (taggingStateChecker.stopped) {
        __taggingStateCheckers.delete(taggingStateChecker.appId);
        const toRemove: ITaggingListener[] = [];
        __listeners.forEach((x) => {
            if (x.appId === taggingStateChecker.appId) {
                toRemove.push(x);
            }
        });
        toRemove.forEach((x) => GembaseUtils.removeFromArr(__listeners, x));
    }
}

function __removeContext(context: string) {
    const toRemove: ITaggingListener[] = [];
    __listeners.forEach((x) => {
        if (x.context === context) {
            toRemove.push(x);
        }
    });
    toRemove.forEach((x) => GembaseUtils.removeFromArr(__listeners, x));

    const toRemoveChecker: TAppId[] = [];
    for (const [k, v] of __taggingStateCheckers) {
        const found = __listeners.find((y) => y.appId === k);
        if (!found) {
            toRemoveChecker.push(k);
        }
    }
    toRemoveChecker.forEach((x) => {
        if (__taggingStateCheckers.has(x)) {
            const c = __taggingStateCheckers.get(x);
            if (c !== undefined) {
                c.stop();
                __taggingStateCheckers.delete(x);
            }
        }
    });
}

export type TaggingContext = "auditor" | "games_explorer";

export const useTaggingStore = defineStore('taggingStore', {
    state: () => ({
    }),
    actions: {
        async tagStoreAppIfNotTagged(
            appId: TAppId,
            taggingContext: TaggingContext,
            adminForce = false
        ) {
            if (!adminForce && __taggedApps.includes(appId)) {
                return {
                    state: "done",
                    app_id: appId
                } as TaggingState;
            }
            GembaseUtils.removeFromArr(__taggedApps, appId);
            const response = await EndpointRequest.process2<TaggingState>("portal:tag_store_app_if_not_tagged", {
                app_id: appId,
                tagging_context: taggingContext,
                admin_force: adminForce
            });
            if (response.state === "done") {
                GembaseUtils.addToArrUnique(__taggedApps, appId);
            }
            return response;
        },
        async tagConceptApp(
            appId: TAppId,
            taggingContext: TaggingContext
        ) {
            GembaseUtils.addToArrUnique(__taggedInSession, appId);
            return await EndpointRequest.process2<TaggingState>("portal:tag_concept_app", {
                app_id: appId,
                tagging_context: taggingContext
            });
        },
        checkTaggingState(
            context: string,
            appId: TAppId,
            callback: (taggingState: TaggingState) => void
        ) {
            if (__taggedApps.includes(appId)) {
                callback({
                    app_id: appId,
                    state: "done"
                });
                return;
            }

            __addListener({
                context: context,
                appId: appId,
                callback: callback
            });
        },
        removeContext(context: string) {
            __removeContext(context);
        },
        removeTaggedApp(appId: TAppId) {
            GembaseUtils.removeFromArr(__taggedApps, appId);
        }
    }
});
