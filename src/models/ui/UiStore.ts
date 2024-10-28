import {defineStore} from "pinia";
import GembaseUtils from "@/utils/GembaseUtils";
import AppErrorHandler from "@/core/errors/AppErrorHandler";
import {IMessageDialogData} from "@/models/ui/UiData";

const timeout_loadings: string[] = [];
const loadings_reasons: string[] = [];

export const useUiStore = defineStore('uiStore', {
    state: () => ({
        data: {
            isLoadingDialog: false,
            isLoadingDialogTransparentBg: false,
            mouseX: 0,
            mouseY: 0,
            windowW: 0,
            windowH: 0,
            screenW: 0,
            screenH: 0
        },
        videoSrc: undefined as string | undefined,
        messageDialogs: [] as IMessageDialogData[],
        isErrorPopup: false
    }),
    actions: {
        showLoadingDialog(reason = "default", timeout_ms = 0, transparentBg = false) {
            if (timeout_ms > 0) {
                if (!timeout_loadings.includes(reason)) {
                    timeout_loadings.push(reason);
                }
                GembaseUtils.sleep(timeout_ms).then(() => {
                    if (timeout_loadings.includes(reason)) {
                        this.data.isLoadingDialogTransparentBg = transparentBg;
                        this.data.isLoadingDialog = true;
                    }
                })
            } else {
                if (!loadings_reasons.includes(reason)) {
                    loadings_reasons.push(reason);
                }
                this.data.isLoadingDialogTransparentBg = transparentBg;
                this.data.isLoadingDialog = true;
            }
        },
        hideLoadingDialog(reason = "default") {
            if (timeout_loadings.includes(reason)) {
                timeout_loadings.splice(timeout_loadings.indexOf(reason), 1);
            }
            if (loadings_reasons.includes(reason)) {
                loadings_reasons.splice(loadings_reasons.indexOf(reason), 1);
            }
            if (loadings_reasons.length === 0) {
                this.data.isLoadingDialog = false;
            }
        },
        hideAllLoadingDialogs() {
            timeout_loadings.length = 0;
            loadings_reasons.length = 0;
            this.data.isLoadingDialog = false;
        },
        showMessageDialog(
            options: {
                data: IMessageDialogData
            }) {
            options.data.id ??= GembaseUtils.guid();
            this.messageDialogs.push(options.data);
        },
        hideMessageDialog(dialogId?: string) {
            const ix = this.messageDialogs.findIndex((x) => x.id === dialogId);
            if (ix >= 0) {
                this.messageDialogs.splice(ix, 1);
            }
        },
        showErrorPopupDefault(text: string, reload: string | undefined = undefined) {
            AppErrorHandler.showErrorPopupDefault(text, reload);
        },
    },
    getters: {
        isMobile(): boolean {
            return this.data.windowW <= 800;
        }
    }
});
