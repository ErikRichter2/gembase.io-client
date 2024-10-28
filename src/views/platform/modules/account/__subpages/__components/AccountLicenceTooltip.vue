<script setup lang="ts">

import {computed} from "vue";
import GembaseUtils from "@/utils/GembaseUtils";
import {useBillingStore} from "@/models/portal/billing/BillingStore";
import {TUserId} from "@/models/user/UserData";
import {EBillingModuleId} from "@/models/portal/PortalConstants";
import PlatformModuleLogoElement from "@/views/platform/__components/PlatformModuleLogoElement.vue";

const billingStore = useBillingStore();

interface ModuleDetailView {
    moduleId: EBillingModuleId;
    status: string;
    substatus: string;
    unusedSeats: number;
    licences: {
        name: string;
    }[];
}

const props = defineProps<{
    moduleId: EBillingModuleId;
    userOrRequestGuid?: TUserId | string;
}>();

const moduleDetail = computed((): ModuleDetailView => {

    const res: ModuleDetailView = {
        moduleId: props.moduleId,
        status: "",
        substatus: "",
        unusedSeats: 0,
        licences: []
    }

    const modulesSummaryView = billingStore.getModulesSummaryView;

    if (props.userOrRequestGuid === undefined) {
        res.substatus = "Add more users";
        for (let i = 0; i < modulesSummaryView.length; ++i) {
            const moduleSummary = modulesSummaryView[i];
            if (moduleSummary.moduleId === props.moduleId) {
                res.status = `${moduleSummary.freeSeats.length} users`;
                res.unusedSeats = moduleSummary.freeSeats.length;
                moduleSummary.freeSeats.forEach((x) => {
                    res.licences.push({
                        name: `User - Valid until ${GembaseUtils.timestampToShortDate(billingStore.getExpirationT(x))}`,
                    });
                });
                break;
            }
        }
    } else {
        res.status = "Inactive";
        res.unusedSeats = 0;
        res.substatus = "Add more users";
        for (let i = 0; i < modulesSummaryView.length; ++i) {
            const moduleSummary = modulesSummaryView[i];
            if (moduleSummary.moduleId === props.moduleId) {
                for (let j = 0; j < moduleSummary.usedSeats.length; ++j) {
                    if (moduleSummary.usedSeats[j].userOrRequestGuid === props.userOrRequestGuid) {
                        res.status = "Active";
                        res.unusedSeats = 1;
                        res.licences.push({
                            name: `Valid until ${GembaseUtils.timestampToShortDate(billingStore.getExpirationT(moduleSummary.usedSeats[j].billingGuid))}`
                        });
                        break;
                    }
                }
                break;
            }
        }
    }

    return res;
});

</script>

<template>
    <div  class="absolute z-50 bottom-8">
        <div class="gb-bg-window p-2">
            <div class="gb-inner-window">
                <div class="gb-layout-tl">
                    <div class="gb-layout-tl-row gap-5">
                        <platform-module-logo-element :billing-module-id="moduleId"></platform-module-logo-element>
                        <div class="whitespace-nowrap font-bold text-orange data-[unused='true']:text-dim-ocean" :data-unused="moduleDetail.unusedSeats > 0">
                            {{moduleDetail.status}}
                        </div>
                    </div>
                    <div class="gb-layout-tl text-xs whitespace-nowrap pt-4">
                        <div v-if="moduleDetail.unusedSeats === 0" class="text-gray-600">
                            {{moduleDetail.substatus}}
                        </div>
                        <div v-else>
                            <div v-for="licence in moduleDetail.licences" class="gb-layout-tl-row">
                                <div>
                                    {{licence.name}}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
