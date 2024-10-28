import {TTagId, TagDetail} from "@/models/portal/apps/AppsData";
import {AllowedTagsPerLockedModuleDef} from "@/models/portal/PortalDataTypes";
import {PlatformProductDefData} from "@/models/portal/platformProduct/PlatformProductData";
import GembaseUtils from "@/utils/GembaseUtils";
import {EBillingModuleId} from "@/models/portal/PortalConstants";

interface TagCacheTimestamp {
    timestamp: number,
    tagDef: PlatformProductDefData,
    tagId: TTagId
}

export class TagsHelper {

    static TAG_RANK_PRIMARY = 1;
    static TAG_RANK_SECONDARY = 2;
    static TAG_RANK_TERTIARY = 3;
    static TAG_RANK_NONE = 0;

    static TAG_SUBCATEGORY_GENRE = 21;
    static TAG_SUBCATEGORY_TOPICS = 43;
    static TAG_SUBCATEGORY_BEHAVIORS = 4;
    static TAG_SUBCATEGORY_IPS = 48;
    static TAG_SUBCATEGORY_COMPLEXITY = 6;
    static TAG_SUBCATEGORY_MULTIPLAYER = 26;
    static TAG_SUBCATEGORY_PLATFORMS = 29;
    static TAG_SUBCATEGORY_ACTIVITIES = 1;
    static TAG_SUBCATEGORY_SOCIALS = 39;
    static TAG_SUBCATEGORY_HOBBIES = 22;
    static TAG_SUBCATEGORY_MOVIES = 25;
    static TAG_SUBCATEGORY_MONETIZATION = 64;

    static TAG_PLATFORM_MOBILE = 1;
    static TAG_PLATFORM_PC = 2;

    static SORT_SUBCATEGORIES = [
        TagsHelper.TAG_SUBCATEGORY_GENRE,
        TagsHelper.TAG_SUBCATEGORY_PLATFORMS,
        TagsHelper.TAG_SUBCATEGORY_TOPICS,
        TagsHelper.TAG_SUBCATEGORY_COMPLEXITY,
        TagsHelper.TAG_SUBCATEGORY_MONETIZATION,
        TagsHelper.TAG_SUBCATEGORY_MULTIPLAYER,
        TagsHelper.TAG_SUBCATEGORY_BEHAVIORS,
        TagsHelper.TAG_SUBCATEGORY_IPS,
    ];

    static TAG_RANKS = [TagsHelper.TAG_RANK_PRIMARY, TagsHelper.TAG_RANK_SECONDARY, TagsHelper.TAG_RANK_TERTIARY]

    private static __potentialTertiaryTagsPerAppIdSubcategory: Map<string, TagCacheTimestamp[]> = new Map<string, TagCacheTimestamp[]>();
    private static __tagsDef: PlatformProductDefData[] = [];

    static init(tagsDef: PlatformProductDefData[]) {
        TagsHelper.__tagsDef = tagsDef;
    }

    static getTagRank(tags: TagDetail[] | undefined, tagId: TTagId | undefined): number {
        if (tags === undefined || tagId === undefined) {
            return 0;
        }

        for (let i = 0; i < tags.length; ++i) {
            if (tags[i].tag_id === tagId) {
                return tags[i].tag_rank;
            }
        }

        return 0;
    }

    static toggleTagInplace(context: string | null, tags: TagDetail[] | undefined, tagId: TTagId | undefined, ignoreRank = false) {
        if (tags !== undefined) {
            const res = this.toggleTag(context, tags, tagId, ignoreRank);
            if (res !== undefined) {
                tags.length = 0;
                tags.push(...res);
            }
        }
    }

    static toggleTag(context: string | null, tags: TagDetail[], tagId: TTagId | undefined, ignoreRank = false): TagDetail[] {
        if (tagId === undefined) {
            return tags;
        }
        const tagsCopy = GembaseUtils.copy(tags);
        const hasTag = TagsHelper.hasTag(tagsCopy, tagId);
        const tagDef = this.__getTagDef(tagId);

        if (tagDef === undefined) {
            return tags;
        }

        const isRankeable = !ignoreRank && this.isRankeableSubcategory(tagId);

        if (hasTag) {
            for (let i = 0; i < tagsCopy.length; ++i) {
                if (tagsCopy[i].tag_id === tagId) {
                    tagsCopy.splice(i, 1);
                    if (isRankeable) {
                        TagsHelper.__removeTagToggleTimestamp(context, tagId);
                    }
                    break;
                }
            }
        } else {
            const tag = {
                tag_id: tagId,
                tag_rank: TagsHelper.TAG_RANK_NONE
            }

            if (context !== null && isRankeable) {
                this.__setTagToggleTimestamp(context, tagId);
            }

            tagsCopy.push(tag);
        }

        if (isRankeable) {
            this.__setTagRanksAuto(context, tagsCopy, tagDef.subcategory);
        }

        return tagsCopy;
    }

    private static __removeTagToggleTimestamp(context: string | null, tagId: TTagId) {
        if (context === null) {
            return;
        }

        const arr = TagsHelper.__potentialTertiaryTagsPerAppIdSubcategory.get(context);
        if (arr !== undefined) {
            for (let i = 0; i < arr.length; ++i) {
                if (arr[i].tagId === tagId) {
                    arr[i].timestamp = 0;
                    return;
                }
            }
        }
    }

    private static __setTagToggleTimestamp(context: string, tagId: TTagId) {
        const arr2 = TagsHelper.__potentialTertiaryTagsPerAppIdSubcategory.get(context);
        if (arr2 !== undefined) {
            for (let i = 0; i < arr2.length; ++i) {
                if (arr2[i].tagId === tagId) {
                    arr2[i].timestamp = GembaseUtils.serverTimestamp();
                    return;
                }
            }
        }

        const tagDef = TagsHelper.__getTagDef(tagId);
        if (tagDef !== undefined) {
            if (!TagsHelper.__potentialTertiaryTagsPerAppIdSubcategory.has(context)) {
                TagsHelper.__potentialTertiaryTagsPerAppIdSubcategory.set(context, []);
            }
            const arr = TagsHelper.__potentialTertiaryTagsPerAppIdSubcategory.get(context);
            arr?.push({
                tagId: tagId,
                tagDef: tagDef,
                timestamp: GembaseUtils.serverTimestamp()
            });
        }
    }

    private static __setTagRankToLatestChangedTagWithoutRank(context: string | null, tags: TagDetail[], subcategory: string, rank: number) {
        let maxTag: TagCacheTimestamp | undefined = undefined;
        const rankedTags = TagsHelper.getRankedTags(tags, subcategory);

        if (context !== null) {
            const arr = TagsHelper.__potentialTertiaryTagsPerAppIdSubcategory.get(context);
            if (arr !== undefined) {
                for (let i = 0; i < arr.length; ++i) {
                    const t = arr[i];
                    if (t.timestamp > 0 && t.tagDef.subcategory === subcategory) {
                        if (maxTag === undefined || t.timestamp > maxTag.timestamp) {
                            if (!TagsHelper.hasTag(rankedTags, t.tagId)) {
                                maxTag = t;
                            }
                        }
                    }
                }
            }
        }

        if (maxTag !== undefined) {
            TagsHelper.__setTagRank(tags, maxTag.tagId, rank);
        }
    }

    private static __setTagRanksAuto(context: string | null, tags: TagDetail[], subcategory: string) {
        if (!TagsHelper.__hasRank(tags, subcategory, TagsHelper.TAG_RANK_PRIMARY)) {
            if (TagsHelper.__hasRank(tags, subcategory, TagsHelper.TAG_RANK_SECONDARY)) {
                TagsHelper.__switchTagRank(tags, subcategory, TagsHelper.TAG_RANK_SECONDARY, TagsHelper.TAG_RANK_PRIMARY);
            } else if (TagsHelper.__hasRank(tags, subcategory, TagsHelper.TAG_RANK_TERTIARY)) {
                TagsHelper.__switchTagRank(tags, subcategory, TagsHelper.TAG_RANK_TERTIARY, TagsHelper.TAG_RANK_PRIMARY);
            } else {
                TagsHelper.__setTagRankToLatestChangedTagWithoutRank(context, tags, subcategory, TagsHelper.TAG_RANK_PRIMARY);
            }
        }

        if (!TagsHelper.__hasRank(tags, subcategory, TagsHelper.TAG_RANK_SECONDARY)) {
            if (TagsHelper.__hasRank(tags, subcategory, TagsHelper.TAG_RANK_TERTIARY)) {
                TagsHelper.__switchTagRank(tags, subcategory, TagsHelper.TAG_RANK_TERTIARY, TagsHelper.TAG_RANK_SECONDARY);
            } else {
                TagsHelper.__setTagRankToLatestChangedTagWithoutRank(context, tags, subcategory, TagsHelper.TAG_RANK_SECONDARY);
            }
        }

        if (!TagsHelper.__hasRank(tags, subcategory, TagsHelper.TAG_RANK_TERTIARY)) {
            TagsHelper.__setTagRankToLatestChangedTagWithoutRank(context, tags, subcategory, TagsHelper.TAG_RANK_TERTIARY);
        }
    }

    public static setTagRankAuto(tagDetail: TagDetail, tags: TagDetail[]) {
        const tagDef = TagsHelper.__getTagDef(tagDetail.tag_id);

        if (tagDef === undefined) {
            return;
        }

        const subcategory = tagDef.subcategory;

        if (!TagsHelper.__hasRank(tags, subcategory, TagsHelper.TAG_RANK_PRIMARY)) {
            tagDetail.tag_rank = TagsHelper.TAG_RANK_PRIMARY;
        }
        else if (!TagsHelper.__hasRank(tags, subcategory, TagsHelper.TAG_RANK_SECONDARY)) {
            tagDetail.tag_rank = TagsHelper.TAG_RANK_SECONDARY;
        }
        else if (!TagsHelper.__hasRank(tags, subcategory, TagsHelper.TAG_RANK_TERTIARY)) {
            tagDetail.tag_rank = TagsHelper.TAG_RANK_TERTIARY;
        }
    }

    private static __switchTagRank(tags: TagDetail[], subcategory: string, tagRankFrom: number, tagRankTo: number) {
        for (let i = 0; i < tags.length; ++i) {
            const tagDef = TagsHelper.__getTagDef(tags[i].tag_id);
            if (tagDef?.subcategory === subcategory) {
                if (tags[i].tag_rank === tagRankFrom) {
                    tags[i].tag_rank = tagRankTo;
                    return;
                }
            }
        }
    }

    private static __setTagRank(tags: TagDetail[], tagId: TTagId, tagRank: number) {
        for (let i = 0; i < tags.length; ++i) {
            if (tags[i].tag_id === tagId) {
                tags[i].tag_rank = tagRank;
                return;
            }
        }
    }

    static hasTag(tags: TagDetail[] | undefined, tagId: TTagId | undefined) {
        if (tags === undefined || tagId === undefined) {
            return false;
        }
        for (let i = 0; i < tags.length; ++i) {
            if (tags[i].tag_id === tagId) {
                return true;
            }
        }
        return false;
    }

    static getTagsList(tags: TagDetail[] | undefined): TTagId[] {
        const res: TTagId[] = [];

        if (tags !== undefined) {
            for (let i = 0; i < tags.length; ++i) {
                res.push(tags[i].tag_id);
            }
        }

        return res;
    }

    private static __getTagDef(tagId: TTagId): PlatformProductDefData | undefined {
        for (let i = 0; i < TagsHelper.__tagsDef.length; ++i) {
            if (TagsHelper.__tagsDef[i].tag_id === tagId) {
                return TagsHelper.__tagsDef[i];
            }
        }
        return undefined;
    }

    static getRankedTags(tags: TagDetail[] | undefined, onlyForSubcategory: string | null = null): TagDetail[] {
        const res: TagDetail[] = [];

        if (tags !== undefined) {
            for (let i = 0; i < tags.length; ++i) {
                if (tags[i].tag_rank != 0) {
                    if (onlyForSubcategory === null || TagsHelper.__getTagDef(tags[i].tag_id)?.subcategory === onlyForSubcategory) {
                        res.push(tags[i]);
                    }
                }
            }
        }

        return res;
    }

    static isRankeableSubcategory(tagId: TTagId): boolean {
        const tagDef = TagsHelper.__getTagDef(tagId);

        if (tagDef === undefined || tagDef.subcategory !== 'Genre' && tagDef.subcategory !== 'Topics') {
            return false;
        }

        return true;
    }

    private static __hasRank(tags: TagDetail[], subcategory: string, tagRank: number): boolean {
        const rankedTags = TagsHelper.getRankedTags(tags, subcategory);
        for (let i = 0; i < rankedTags.length; ++i) {
            if (rankedTags[i].tag_rank === tagRank) {
                return true;
            }
        }

        return false;
    }

    static canChange(moduleLocked: boolean, moduleId: EBillingModuleId, tagId: TTagId, allowedTagsPerLockedModule: AllowedTagsPerLockedModuleDef[]) {
        if (!moduleLocked) {
            return true;
        }

        for (let i = 0; i < allowedTagsPerLockedModule.length; ++i) {
            if (allowedTagsPerLockedModule[i].tag_id === tagId && allowedTagsPerLockedModule[i].module_id === moduleId) {
                return true;
            }
        }

        return false;
    }
}