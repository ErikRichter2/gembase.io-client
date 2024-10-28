import { ReCaptchaInstance } from 'recaptcha-v3'

declare module '@vue/runtime-core' {
    export interface ComponentCustomProperties {
        $recaptcha: (action: string) => Promise<string>
        $recaptchaLoaded: () => Promise<boolean>
        $recaptchaInstance: ReCaptchaInstance
    }
}

export {}
