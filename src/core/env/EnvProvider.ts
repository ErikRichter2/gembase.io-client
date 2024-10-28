import {EnvEnum} from "@/core/env/EnvEnum";
import ClientError from "@/core/errors/ClientError";

export class EnvProvider {
    static get isProd(): boolean {
        return EnvProvider.env == EnvEnum.PROD;
    }

    static get isTest(): boolean {
        return EnvProvider.env == EnvEnum.TEST;
    }

    static get env(): EnvEnum {
        const env = import.meta.env.VITE_APP_ENV;

        if (env === "dev") {
            return EnvEnum.DEV;
        } else if (env === "test") {
            return EnvEnum.TEST
        } else if (env === "prod") {
            return EnvEnum.PROD;
        }

        throw new ClientError(`Unknown environment: ${env}`);
    }

    static get envName(): string {
        const env = EnvProvider.env;

        if (env === EnvEnum.DEV) {
            return "DEV";
        } else if (env === EnvEnum.TEST) {
            return "TEST";
        } else if (env === EnvEnum.PROD) {
            return "PROD";
        }

        throw new ClientError(`Unknown environment: ${env}`);
    }
}