import GembaseUtils from "@/utils/GembaseUtils";

export class PlatformCalcRequestToken {
    private __guid: string;

    constructor() {
        this.__guid = GembaseUtils.guid();
    }

    get guid() {
        return this.__guid;
    }

    recreate() {
        this.__guid = GembaseUtils.guid();
        return this;
    }
}
