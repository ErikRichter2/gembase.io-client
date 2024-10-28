import {FullPageScrollData, FullPageScrollModel} from "@/models/ui/FullPageScrollModel";
import {ref} from "vue";

export const homePageScrollModel = new FullPageScrollModel(ref<FullPageScrollData>({
    sections: []
}));
