import './css/gembase_core.css';
import './css/index.css';

import { createPinia } from 'pinia';
import VueGtag from "vue-gtag";

import ApiService from "@/core/services/ApiService";
import { initInlineSvg } from "@/plugins/inline-svg";
import AppErrorHandler from "@/core/errors/AppErrorHandler";
import {portalRoutes} from "@/router/routes/PortalRoutes";
import {surveyRoutes} from "@/router/routes/SurveyRoutes";
import {debugRoutes} from "@/router/routes/DebugRoutes";
import {homeRoutes} from "@/router/routes/HomeRoutes";
import GembaseUtils from "@/utils/GembaseUtils";
import {app} from "@/app";
import AppConfig from "@/config/AppConfig";
import {useRouterStore, vueRouterInstance} from "@/core/router/RouterStore";
import {systemRoutes} from "@/router/SystemRoutes";
import {useUiStore} from "@/models/ui/UiStore";

console.log(`[Gembase] [${AppConfig.envName}] ${GembaseUtils.getBuildVersionAndTime()?.version}`);

async function __init() {
    // store
    app.use(createPinia());

    // error handler
    AppErrorHandler.init(app);

    // api
    ApiService.init(app);

    // libs
    initInlineSvg(app);

    // router
    const routerStore = useRouterStore();
    routerStore.addRoutes(homeRoutes);
    routerStore.addRoutes(portalRoutes);
    routerStore.addRoutes(debugRoutes);
    routerStore.addRoutes(surveyRoutes);
    routerStore.addRoutes([systemRoutes]);

    await routerStore.init(app);

    // Google Analytics
    if (AppConfig.isProd) {
        app.use(VueGtag, {config: { id: "G-N13ZBDM367" }}, vueRouterInstance);
    }

    AppErrorHandler.setOnShowError((error: string, reload: string | undefined = undefined) => {
        const uiStore = useUiStore();
        if (uiStore.isErrorPopup) {
            return;
        }
        uiStore.isErrorPopup = true;
        uiStore.hideAllLoadingDialogs();
        uiStore.showMessageDialog({
            data: {
                type: 'error',
                body: error,
                onClose: () => {
                    uiStore.isErrorPopup = false;
                    if (reload !== undefined) {
                        if (reload === "self") {
                            location.reload();
                        } else {
                            location.replace(reload);
                        }
                    }
                }
            }
        });
    });

    app.mount("#app");
}

__init();
