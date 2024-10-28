import {EModuleId, PortalConstants} from "@/models/portal/PortalConstants";
import {BillingDiscountInstanceView} from "@/models/portal/billing/BillingDiscountInstanceView";

export class PlayerResearchDiscount extends BillingDiscountInstanceView {
    public get isDiscountForModule() {
        return true;
    }

    public get priceText() {
        return "any game";
    }

    get moduleIcon(): string | undefined {
        return PortalConstants.getModule(EModuleId.PLAYERS_EXPLORER).icon;
    }

    get moduleLabel(): string | undefined {
        return "Players research";
    }
}
