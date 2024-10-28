import {IPlatformProductNode} from "@/models/portal/platformProduct/PlatformProductData";
import {IPlatformProductNodeProvider} from "@/models/portal/competitor/PortalCompetitorData";
import {TagsHelper} from "@/models/portal/tags/TagsHelper";

export interface PlatformProductTreeView<T extends (IPlatformProductNode | IPlatformProductNodeProvider)> {
    categories: PlatformProductTreeViewCategory<T>[];
}

export interface PlatformProductTreeViewCategory<T extends (IPlatformProductNode | IPlatformProductNodeProvider)> {
    name: string;
    subcategories: PlatformProductTreeViewSubcategory<T>[];
}

export interface PlatformProductTreeViewSubcategory<T extends (IPlatformProductNode | IPlatformProductNodeProvider)> {
    name: string;
    clientName: string;
    subcategoryId: number;
    nodes: T[];
    locked?: boolean;
    wip?: boolean;
}



export class TagsModel {

    static createTreeView<T extends (IPlatformProductNode | IPlatformProductNodeProvider)>(
        inputData: T[],
        customSort: ((a: T, b: T) => number) | undefined = undefined
    ): PlatformProductTreeView<T> {
        const res: PlatformProductTreeView<T> = {
            categories: []
        }

        function getTagDef(it: IPlatformProductNode | IPlatformProductNodeProvider): IPlatformProductNode {
            if ((it as IPlatformProductNodeProvider).tagDef !== undefined) {
                return (it as IPlatformProductNodeProvider).tagDef;
            } else {
                return (it as IPlatformProductNode);
            }
        }

        for (let i = 0; i < inputData.length; ++i) {
            const row = inputData[i];
            const tagDef = getTagDef(row);

            if (tagDef.hidden) {
                continue;
            }

            let c: PlatformProductTreeViewCategory<T> | null = null;
            for (let j = 0; j < res.categories.length; ++j) {
                if (res.categories[j].name === tagDef.category) {
                    c = res.categories[j];
                    break;
                }
            }

            if (c === null) {
                c = {
                    name: tagDef.category,
                    subcategories: []
                }
                res.categories.push(c);
            }

            let sc: PlatformProductTreeViewSubcategory<T> | null = null;
            for (let j = 0; j < c.subcategories.length; ++j) {
                if (c.subcategories[j].name === tagDef.subcategory) {
                    sc = c.subcategories[j];
                    break;
                }
            }

            if (sc === null) {
                sc = {
                    subcategoryId: tagDef.subcategory_int,
                    name: tagDef.subcategory,
                    clientName: tagDef.subcategory_client_name ?? tagDef.subcategory,
                    nodes: []
                }
                c.subcategories.push(sc);
            }

            sc.nodes.push(row);
            if (tagDef.locked) {
                sc.locked = true;
            }
            if (tagDef.wip === 1) {
                sc.wip = true;
            }
        }

        res.categories.forEach((x) => {
            x.subcategories.sort((a, b) => {
                const ixa = TagsHelper.SORT_SUBCATEGORIES.indexOf(a.subcategoryId);
                const ixb = TagsHelper.SORT_SUBCATEGORIES.indexOf(b.subcategoryId);
                if (ixa >= 0 && ixb >= 0) {
                    return ixa - ixb;
                }
                if (ixa >= 0) {
                    return -1;
                }
                if (ixb >= 0) {
                    return 1;
                }
                return 0;
            });
        });

        res.categories.forEach((x) => {
            x.subcategories.forEach((y) => {
                y.nodes.sort((a, b) => {
                    const defA = getTagDef(a);
                    const defB = getTagDef(b);
                    return defA.node.localeCompare(defB.node);
                });
                if (customSort !== undefined) {
                    y.nodes.sort(customSort);
                }
            })
        });

        return res;
    }
}
