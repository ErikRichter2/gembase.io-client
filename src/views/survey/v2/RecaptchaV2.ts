import GembaseUtils from "@/utils/GembaseUtils";
import {useRouterStore} from "@/core/router/RouterStore";

let __callback: ((any) => void) | null = null;

// @ts-ignore
window.onRecaptchaV2Loaded = function() {
    renderRecaptcha();
}

function renderRecaptcha() {
    window.grecaptcha.render('recaptcha_element', {
        sitekey: '6LfJxBMnAAAAABDWA3dLTfhKbQwcypz9MdkfB0Fg',
        // @ts-ignore
        'callback': onRecaptchaVerifyCallback,
        'expired-callback': onRecaptchaExpiredCallback,
        'error-callback': onRecaptchaErrorCallback
    });
}

function onRecaptchaVerifyCallback(response) {
    if (__callback !== null) {
        __callback(response);
        __callback = null;
    }
}

function onRecaptchaExpiredCallback() {
    __callback = null;
    useRouterStore().go(0);
}

function onRecaptchaErrorCallback() {
    __callback = null;
    useRouterStore().go(0);
}

export function showRecaptchaV2(callback: (any) => void) {
    __callback =  callback;

    if (window.grecaptcha !== undefined && window.grecaptcha !== null) {
        renderRecaptcha();
        return;
    }

    GembaseUtils.loadScript("https://www.google.com/recaptcha/api.js?onload=onRecaptchaV2Loaded&render=explicit");
}
