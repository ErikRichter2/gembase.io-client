export class LocalStorageModel {
    static setItem(id: string, val: string) {
        window.localStorage.setItem(id, val);
    }

    static removeItem(id: string) {
        window.localStorage.removeItem(id);
    }

    static getItem(id: string): string | undefined {
        const val = window.localStorage.getItem(id);
        if (val === null) {
            return undefined;
        }
        return val;
    }

    static hasItem(id: string): boolean {
        return LocalStorageModel.getItem(id) !== undefined;
    }
}