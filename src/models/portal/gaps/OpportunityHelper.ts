import {TagDetail} from "@/models/portal/apps/AppsData";
import GembaseUtils from "@/utils/GembaseUtils";
import {TagsHelper} from "@/models/portal/tags/TagsHelper";
import {IPlatformCalcAffinity} from "@/models/portal/calc/PlatformCalcData";
import {usePortalStore} from "@/models/portal/PortalStore";

export class OpportunityHelper {

    private readonly __data: IPlatformCalcAffinity;

    public constructor(data: IPlatformCalcAffinity) {
        this.__data = data;
    }

    get tags(): TagDetail[] {
        const tags: TagDetail[] = GembaseUtils.copy(this.__data.input_tags) ?? [];

        const f = tags.find((x) => x.tag_id === this.__data.affinity.tag_id);
        if (f === undefined) {
            TagsHelper.toggleTagInplace("opportunity-helper", tags, this.__data.affinity.tag_id)
        }
        return tags;
    }

    get title(): string {
        const arr: string[] = [];
        const aff = this.__data.affinity.tag_id;
        this.__data.input_tags?.forEach((x) => {
            if (arr.length < 3 && x.tag_id !== aff) {
                arr.push(usePortalStore().getTagName(x.tag_id));
            }
        });
        arr.push(usePortalStore().getTagName(aff));
        return arr.join(" ");
    }

}