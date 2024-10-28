import {onUnmounted} from "vue";
import {useUiStore} from "@/models/ui/UiStore";
import GembaseUtils from "@/utils/GembaseUtils";

export const useFullscreenLoading = (loadingId: string | undefined = undefined) => {

    const __reasons = new Set<string>();
    const __rootKey = loadingId ?? GembaseUtils.guid();

    function __getKey(reason: string | undefined = undefined): string {
        return `${__rootKey}${reason ?? ''}`
    }

    const show = (params?: {
        reason?: string,
        timeout?: number,
        transparentBg?: boolean
    }) => {
        const k = __getKey(params?.reason);
        useUiStore().showLoadingDialog(k, params?.timeout ?? 0, params?.transparentBg ?? false);
        __reasons.add(k);
    }

    const hide = (reason: string | undefined = undefined) => {
        const k = __getKey(reason);
        useUiStore().hideLoadingDialog(k);
        __reasons.delete(k);
    }

    onUnmounted(() => {
        __reasons.forEach((x) => useUiStore().hideLoadingDialog(x));
        __reasons.clear();
    });

    return {show, hide}
}
