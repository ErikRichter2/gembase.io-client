import {ReCaptchaInstance} from "recaptcha-v3";
import {VueReCaptcha} from "vue-recaptcha-v3";
import AppConfig from "@/config/AppConfig";
import GembaseUtils from "@/utils/GembaseUtils";
import ClientError from "@/core/errors/ClientError";
import {app} from "@/app";

class RecaptchaModel {
    static __captcha: ReCaptchaInstance | null = null;

    static isEnabled(): boolean {
        return AppConfig.isProd;
    }

    static async init() {
        if (!RecaptchaModel.isEnabled()) {
            return;
        }
        if (RecaptchaModel.__captcha === null) {
            app.use(VueReCaptcha, {
                siteKey: '6LeljQImAAAAAKijd5eIg8w47gU1Wdv2qfihZ-9c',
                loaderOptions: {}
            });
            await app.config.globalProperties.$recaptchaLoaded();
            RecaptchaModel.__captcha = app.config.globalProperties.$recaptchaInstance.value as ReCaptchaInstance;
        }
    }

    static async execute(action: string): Promise<string> {
        if (!RecaptchaModel.isEnabled()) {
            return "";
        }
        for (let i = 0; i < 5; ++i) {
            await RecaptchaModel.init();
            if (RecaptchaModel.__captcha !== null) {
                return await RecaptchaModel.__captcha.execute(action);
            } else {
                await GembaseUtils.sleep(500);
            }
        }

        throw new ClientError("Error while initializing recaptcha");
    }

    static async hideBadge() {
        if (!RecaptchaModel.isEnabled()) {
            return;
        }
        await RecaptchaModel.init();
        RecaptchaModel.__captcha?.hideBadge();
    }

    static async showBadge() {
        if (!RecaptchaModel.isEnabled()) {
            return;
        }
        await RecaptchaModel.init();
        RecaptchaModel.__captcha?.showBadge();
    }

}

export const recaptchaModel = RecaptchaModel;