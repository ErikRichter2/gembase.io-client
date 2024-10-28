import GembaseUtils from "@/utils/GembaseUtils";
import {ModuleDataView} from "@/models/portal/billing/BillingData";
import ClientError from "@/core/errors/ClientError";
import {modulesDataView} from "@/models/portal/billing/BillingStore";

export class BillingBaseInstanceView {
    public name = "";
    public title = "";
    public desc = "";
    public shortDesc = "";
    public priceInItemsPerMonthPerSeat = 0;
    public priceInItemsPerMonthPerSeatOverride: number | undefined = undefined;
    public icon = "";
    public alwaysChecked = false;
    public autoCheck = false;
    public forceGreen = false;
    public guid: string;
    public discount = 0;

    constructor() {
        this.guid = GembaseUtils.guid();
    }

    public get isDiscount() {
        return false;
    }

    public get isDiscountForModule() {
        return false;
    }

    public get priceText() {
        return "per month";
    }

    public get priceInItems() {
        return this.priceInItemsPerMonthPerSeatOverride ?? this.priceInItemsPerMonthPerSeat;
    }

    get moduleId(): number | undefined {
        return undefined;
    }

    get currentSeats(): number | undefined {
        return undefined;
    }

    get moduleIcon(): string | undefined {
        return undefined;
    }

    get moduleLabel(): string | undefined {
        return undefined;
    }

    get hideGembase(): boolean {
        return false;
    }

    get moduleDataView(): ModuleDataView {
        const m = modulesDataView.value.find((x) => x.guid === this.guid);
        if (m === undefined) {
            throw new ClientError("Module data not found");
        }
        return m;
    }
}
