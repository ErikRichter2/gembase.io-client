import {onUnmounted} from "vue";
import {usePlatformCalcStore} from "@/models/portal/calc/PlatformCalcStore";

export const usePlatformCalcContext = (__contextId: string) => {

    const contextId = __contextId;

    onUnmounted(() => {
        usePlatformCalcStore().removeContext(contextId);
    });

    return {contextId}
}