import {EBillingModuleId} from "@/models/portal/PortalConstants";
import GembaseUtils from "@/utils/GembaseUtils";
import {BillingBaseInstanceView} from "@/models/portal/billing/BillingBaseInstanceView";

export class BillingModuleInstanceView extends BillingBaseInstanceView {
    public id: EBillingModuleId = EBillingModuleId.AUDIT;

    public get priceInItems() {
        return GembaseUtils.roundPrice(this.priceInItemsPerMonthPerSeatOverride ?? this.priceInItemsPerMonthPerSeat);
    }

    get moduleId(): EBillingModuleId | undefined {
        return this.id;
    }

    get currentSeats(): number | undefined {
        if (this.moduleDataView.checked) {
            return this.moduleDataView.seats;
        }
        return 0;
    }
}
