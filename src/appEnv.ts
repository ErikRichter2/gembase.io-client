import ClientError from './errors/clientError'

export enum EnvEnum {
    PROD,
    TEST,
    DEV,
}

class AppEnv {
    get isProd(): boolean {
        return this.env == EnvEnum.PROD
    }

    get isDev(): boolean {
        return this.env == EnvEnum.DEV
    }

    get isTest(): boolean {
        return this.env == EnvEnum.TEST
    }

    get env(): EnvEnum {
        const env = import.meta.env.VITE_APP_ENV

        if (env === 'dev') {
            return EnvEnum.DEV
        } else if (env === 'test') {
            return EnvEnum.TEST
        } else if (env === 'prod') {
            return EnvEnum.PROD
        }

        throw new ClientError(`Unknown environment: ${env}`)
    }

    get envName(): string {
        const env = this.env

        if (env === EnvEnum.DEV) {
            return 'DEV'
        } else if (env === EnvEnum.TEST) {
            return 'TEST'
        } else if (env === EnvEnum.PROD) {
            return 'PROD'
        }

        throw new ClientError(`Unknown environment: ${env}`)
    }

    get serverRoot(): string {
        return import.meta.env.VITE_APP_SERVER_ROOT
    }
}

export const appEnv = new AppEnv()
