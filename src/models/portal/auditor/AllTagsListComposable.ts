import {
    IPlatformCalcAffinities, IPlatformCalcAffinity,
    IPlatformValuesCalcProgressData,
    IProductNodesAudiencesTsOptionsInput
} from "@/models/portal/calc/PlatformCalcData";
import {TagsViewTagData} from "@/models/portal/platformProduct/PlatformProductData";
import {TagDetail, TTagId} from "@/models/portal/apps/AppsData";
import {EBillingModuleId} from "@/models/portal/PortalConstants";
import {NODE_CATEGORY_CONTENT, NODE_CATEGORY_MECHANICS} from "@/models/portal/PortalDataTypes";
import {PlatformProductTreeView, TagsModel} from "@/models/portal/tags/TagsModel";
import {TagsHelper} from "@/models/portal/tags/TagsHelper";
import {computed, ref} from "vue";
import {usePortalStore} from "@/models/portal/PortalStore";
import {usePlatformCalcStore} from "@/models/portal/calc/PlatformCalcStore";
import {useGamesExplorerStore} from "@/models/portal/gamesExplorer/GamesExplorerStore";
import {PlatformCalcRequestToken} from "@/models/portal/calc/PlatformCalcRequestToken";
import {useTutorialStore} from "@/models/portal/tutorial/TutorialStore";
import {PlatformValuesHelper} from "@/models/portal/competitor/PlatformValuesHelper";

export const useAllTagsList = () => {

    const __requestToken = new PlatformCalcRequestToken();

    const mechanicsView = ref<PlatformProductTreeView<TagsViewTagData>>({
        categories: []
    });

    const contentView = ref<PlatformProductTreeView<TagsViewTagData>>({
        categories: []
    });

    const platformCalcAllTagsResult = ref<IPlatformCalcAffinities>();
    const progressData = ref<IPlatformValuesCalcProgressData>();

    const portalStore = usePortalStore();
    const tutorialStore = useTutorialStore();

    const calcProgress = computed((): number | undefined => {
        if (progressData.value !== undefined) {
            const p = progressData.value?.p;
            const t = progressData.value?.t;
            if (p !== undefined && t !== undefined && t > 0) {
                return (p / t) * 100;
            }
        }

        return undefined;
    });

    function clear() {
        platformCalcAllTagsResult.value = undefined;
    }

    async function calcAllTagsAuditor(options: {
        context: string,
        fromModule: EBillingModuleId,
        calcInput: IProductNodesAudiencesTsOptionsInput,
        toggledTags?: TagDetail[],
        callbacks?: {
            done?: () => void,
            progress?: () => void
        }
    }) {
        __requestToken.recreate();

        const request = await usePlatformCalcStore().allTags({
            context: options.context,
            requestToken: __requestToken,
            input: options.calcInput,
            responseCallback: {
                progress: callbackData => {
                    progressData.value = callbackData.response.payload?.progress_data;
                    __setResultAuditor({
                        result: callbackData.response.payload?.result_data,
                        toggledTags: options.toggledTags,
                        fromModule: options.fromModule
                    });
                    if (options.callbacks?.progress !== undefined) {
                        options.callbacks.progress();
                    }
                },
                done: callbackData => {
                    progressData.value = undefined;
                    __setResultAuditor({
                        result: callbackData.response.payload?.result_data,
                        toggledTags: options.toggledTags,
                        fromModule: options.fromModule
                    });
                    if (options.callbacks?.done !== undefined) {
                        options.callbacks.done();
                    }
                }
            }
        });

        if (!request.cached && request.requestGuid === __requestToken.guid) {
            clear();
        }

        return request;
    }

    async function calcAllTagsGamesExplorer(options: {
        context: string,
        tagDetails: TagDetail[]
    }) {
        __requestToken.recreate();

        const request = await usePlatformCalcStore().allTags({
            context: options.context,
            requestToken: __requestToken,
            input: {
                tag_details: options.tagDetails
            },
            responseCallback: {
                progress: callbackData => {
                    progressData.value = callbackData.response.payload?.progress_data;
                    __setResultGamesExplorer(callbackData.response.payload?.result_data);
                },
                done: callbackData => {
                    progressData.value = undefined;
                    __setResultGamesExplorer(callbackData.response.payload?.result_data);
                }
            }
        });

        if (!request.cached && request.requestGuid === __requestToken.guid) {
            clear();
        }

        return request;
    }

    const __setResultGamesExplorer = (data: IPlatformCalcAffinities | undefined = undefined) => {
        const item = useGamesExplorerStore().getFirstHasAudienceTs();
        if (item === undefined) {
            return;
        }

        const tagMap: Map<TTagId, IPlatformCalcAffinity> = new Map<TTagId, IPlatformCalcAffinity>();

        if (data !== undefined) {
            platformCalcAllTagsResult.value = data;
        }

        platformCalcAllTagsResult.value?.data.forEach((x) => {
            tagMap.set(x.affinity.tag_id, x);
        });

        useGamesExplorerStore().compareViewData.forEach((x) => {
            x.rows.forEach((y) => {
                y.values?.forEach((z) => {
                    if (z.tagId !== undefined && z.item?.id === item.id) {
                        z.calcItem = tagMap.get(z.tagId);
                    }
                });
            });
        });
    }

    const __setResultAuditor = (options: {
        result?: IPlatformCalcAffinities,
        toggledTags?: TagDetail[],
        fromModule: EBillingModuleId
    }) => {
        const tagsMechanics: TagsViewTagData[] = [];
        const tagsContent: TagsViewTagData[] = [];

        const tagMap: Map<TTagId, IPlatformCalcAffinity> = new Map<TTagId, IPlatformCalcAffinity>();

        if (options.result !== undefined) {
            platformCalcAllTagsResult.value = options.result;
        }

        if (platformCalcAllTagsResult.value !== undefined) {
            platformCalcAllTagsResult.value?.data.forEach((x) => {
                tagMap.set(x.affinity.tag_id, x);
            });
        }

        const moduleLocked = portalStore.isTunerLocked();

        portalStore.portalDefProduct.forEach((x) => {
            if (!x.is_survey) {
                return;
            }

            const tagNodeView: TagsViewTagData = {
                tagDef: x,
                readonly: !portalStore.canChangeTag(x.tag_id, options.fromModule),
                moduleLocked: moduleLocked
            }

            if (tagMap.has(x.tag_id)) {
                const r = tagMap.get(x.tag_id);
                if (r !== undefined) {
                    tagNodeView.audience = r.audience_stats;
                    tagNodeView.threatsScore = r.ts;
                    tagNodeView.competitorsCnt = r.cnt;
                }
            }

            if (x.category === NODE_CATEGORY_MECHANICS) {
                tagsMechanics.push(tagNodeView);
            } else if (x.category === NODE_CATEGORY_CONTENT) {
                tagsContent.push(tagNodeView);
            }
        });

        mechanicsView.value = TagsModel.createTreeView(tagsMechanics);
        contentView.value = TagsModel.createTreeView(tagsContent);

        function setFirstNodeTutorialId() {
            if (options.fromModule === EBillingModuleId.IDEAS) {
                [mechanicsView, contentView].forEach((x) => {
                    x.value.categories.forEach((y) => {
                        y.subcategories.forEach((z) => {
                            const tags = z.nodes.filter(
                                (zz) => tutorialStore.tutorialGapsTagsIds.includes(zz.tagDef.tag_id));
                            tags.forEach((zz) => zz.nodeElementId = `tutorial_gaps__${zz.tagDef.tag_id}`);
                        });
                    });
                });
            } else {
                const toggledTags = TagsHelper.getTagsList(options.toggledTags);
                for (let i = 0; i < mechanicsView?.value.categories.length; ++i) {
                    for (let j = 0; j < mechanicsView.value.categories[i].subcategories.length; ++j) {
                        const tag = mechanicsView.value.categories[i]
                            .subcategories[j].nodes.find(
                            (x) => toggledTags.includes(x.tagDef.tag_id));
                        if (tag !== undefined) {
                            tag.audienceElementId = "auditor_tutorial_node_audience";
                            tag.nodeElementId = "auditor_tutorial_node";
                            return;
                        }
                    }
                }
            }
        }

        setFirstNodeTutorialId();
    }

    return {progressData, clear, calcAllTagsGamesExplorer, calcAllTagsAuditor, calcProgress, platformCalcAllTagsResult, mechanicsView, contentView}
}