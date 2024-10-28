import {BillingBaseInstanceView} from "@/models/portal/billing/BillingBaseInstanceView";

export class BillingDiscountInstanceView extends BillingBaseInstanceView {
    public id = 0;

    public get isDiscount() {
        return true;
    }

    public get isDiscountForModule() {
        return false;
    }

    public get priceText() {
        return "per month";
    }

    get hideGembase(): boolean {
        return true;
    }
}
