import GembaseUtils from "@/utils/GembaseUtils";
import {onUnmounted, ref, watch} from "vue";

export const useInlineLoading = (loadingId: string) => {

    const visible = ref(false);

    const __reasons: string[] = [];

    const show = (reason: string | undefined = undefined) => {
        if (reason === undefined) {
            reason = loadingId;
        }
        GembaseUtils.addToArrUnique(__reasons, reason);

        visible.value = true;
    }

    const hide = (reason: string | undefined = undefined) => {
        if (reason === undefined) {
            reason = loadingId;
        }
        GembaseUtils.removeFromArr(__reasons, reason);
        visible.value = __reasons.length > 0;
    }

    const set = (value: boolean, reason: string | undefined = undefined) => {
        value ? show(reason) : hide(reason);
    }

    const watchValue = (provider: () => boolean, reason: string | undefined = undefined) => {
        watch(provider, (value) => {
            set(value, reason);
        });
    }

    const clear = () => {
        __reasons.length = 0;
        visible.value = false;
    }

    onUnmounted(clear);

    return {show, hide, clear, set, watchValue, visible}
}