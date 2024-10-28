import {EnvProvider} from "@/core/env/EnvProvider";

const firebaseConfigProd = {
    apiKey: "AIzaSyC9B3Uzdy-ohEeTIrMPS8FpV2LpYQSHGb0",
    authDomain: "gembase-dashboard.firebaseapp.com",
    databaseURL: "https://gembase-dashboard-default-rtdb.firebaseio.com",
    projectId: "gembase-dashboard",
    storageBucket: "gembase-dashboard.appspot.com",
    messagingSenderId: "584451914160",
    appId: "1:584451914160:web:8dc386ded96c12d695fe75",
    measurementId: "G-J4VYPDSZYZ"
};

const firebaseConfigTest = {
    apiKey: "AIzaSyB_zL6M4dHylf8vPrQWOaIKwc4pz1lm5CY",
    authDomain: "gembase-dashboard-test.firebaseapp.com",
    databaseURL: "https://gembase-dashboard-test-default-rtdb.firebaseio.com",
    projectId: "gembase-dashboard-test",
    storageBucket: "gembase-dashboard-test.appspot.com",
    messagingSenderId: "811944685940",
    appId: "1:811944685940:web:15424dcd57588b62ccbc21"
};

export enum EnvEnum {
    PROD,
    TEST,
    DEV,
    DEMO,
}

export default class AppConfig {

    static get firebaseConfig(): any {
        switch (AppConfig.env) {
            case EnvEnum.PROD:
                return firebaseConfigProd;
            case EnvEnum.TEST:
                return firebaseConfigTest;
            case EnvEnum.DEV:
                return firebaseConfigTest;
        }
    }

    static get isProd(): boolean {
        return EnvProvider.isProd;
    }

    static get isTest(): boolean {
        return EnvProvider.isTest;
    }

    static get env(): EnvEnum {
        return EnvProvider.env;
    }

    static get envName(): string {
        return EnvProvider.envName;
    }
}
