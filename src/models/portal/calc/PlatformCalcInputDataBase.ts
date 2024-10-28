import GembaseUtils from "@/utils/GembaseUtils";
import {EPlatformValuesCalcType} from "@/models/portal/calc/PlatformCalcData";

export class PlatformCalcInputDataBase {

    private readonly __calc: EPlatformValuesCalcType;

    constructor(calc: EPlatformValuesCalcType) {
        this.__calc = calc;
    }

    get calc(): string {
        return this.__calc;
    }

    getServerPayload(): object {
        return {
            calc: this.__calc
        }
    }

    hashInput(): number {
        return GembaseUtils.hashCode(JSON.stringify(this.__prepareDataForHash()));
    }

    protected __prepareDataForHash(): object {
        return {
            "calc": this.__calc
        }
    }
}