export default class ClientError extends Error {
    reloadAfter: boolean | undefined = false;

    constructor(message?: string, reloadAfter?: boolean) {
        super(message);
        this.reloadAfter = reloadAfter;
    }
}