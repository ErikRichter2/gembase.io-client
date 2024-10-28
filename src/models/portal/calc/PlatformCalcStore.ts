import {defineStore} from "pinia";
import GembaseUtils from "@/utils/GembaseUtils";
import {TagsHelper} from "@/models/portal/tags/TagsHelper";
import {
    PlatformValuesServiceChecker, runCallbacks
} from "@/models/portal/platformValues/PlatformValuesServiceChecker";
import EndpointRequest from "@/core/requests/EndpointRequest";
import {
    EPlatformValuesCalcType,
    IAudienceAnglesOptions,
    ICompetitorsForAngleOptions,
    ICompetitorsOptions,
    IPlatformCalcOptions,
    IPlatformCalcResponse,
    IPlatformCalcResponseBase,
    IPlatformCalcServiceRequest,
    IProductNodesAudiencesTsOptions, ISearchOpportunitiesOptions
} from "@/models/portal/calc/PlatformCalcData";
import {AppTypeEnum} from "@/models/portal/apps/AppsData";
import {useAppsStore} from "@/models/portal/apps/AppsStore";
import {PlatformCalcRequestToken} from "@/models/portal/calc/PlatformCalcRequestToken";

const __platformCalcCache: Map<number, any> = new Map<number, any>();
const __serviceCheckers: Map<number, PlatformValuesServiceChecker> = new Map<number, PlatformValuesServiceChecker>();

function __onServiceCheckerResponse(clientHashKey: number, response: IPlatformCalcResponseBase) {
    if (response.metadata.state === "error" || response.metadata.state === "done") {
        __serviceCheckers.delete(clientHashKey);
    }
}

export const usePlatformCalcStore = defineStore('platformCalcStore', {
    state: () => ({
    }),
    actions: {
        async __initCalc(
            options: {
                calcType: EPlatformValuesCalcType,
                calcOptions: IPlatformCalcOptions<any>
            }
        ) {

            options.calcOptions.requestToken ??= new PlatformCalcRequestToken();

            const serviceRequest: IPlatformCalcServiceRequest = {
                cached: false,
                calcOptions: options.calcOptions,
                serverHashKey: 0,
                requestGuid: options.calcOptions.requestToken.guid
            }

            const clientHashKey = GembaseUtils.hashCode(
                JSON.stringify({
                    calc: options.calcType,
                    input: options.calcOptions.input
                }));

            if (__platformCalcCache.has(clientHashKey)) {
                serviceRequest.cached = true;

                runCallbacks({
                    state: "done",
                    callbackData: {
                        serviceRequest: serviceRequest,
                        response: {
                            metadata: {
                                state: "done",
                                hash_key: 0,
                                platform_id: 0,
                            },
                            payload: {
                                result_data: __platformCalcCache.get(clientHashKey),
                            }
                        }
                    },
                    callbacks: options.calcOptions.responseCallback
                });

                return serviceRequest;
            }

            if (__serviceCheckers.has(clientHashKey)) {
                if (options.calcOptions.context !== null &&
                    options.calcOptions.responseCallback !== null &&
                    options.calcOptions.responseCallback !== undefined) {
                    (GembaseUtils.mapGet(
                        __serviceCheckers,
                        clientHashKey
                    ).addCallback(
                        serviceRequest,
                        options.calcOptions
                    ));
                }
                return serviceRequest;
            }

            const response =
                await EndpointRequest.process2<IPlatformCalcResponse<object>>(
                    "platform_values:init_calc", {
                        calc: options.calcType,
                        input_data: options.calcOptions.input
                    });

            if (serviceRequest.requestGuid !== options.calcOptions.requestToken.guid) {
                return serviceRequest;
            }

            if (response.metadata.state === "done" && response.payload?.result_data !== undefined) {
                serviceRequest.cached = true;
                __platformCalcCache.set(clientHashKey, response.payload.result_data);

                runCallbacks({
                    state: "done",
                    callbackData: {
                        serviceRequest: serviceRequest,
                        response: {
                            metadata: response.metadata,
                            payload: {
                                result_data: response.payload.result_data,
                            }
                        }
                    },
                    callbacks: options.calcOptions.responseCallback
                });
                return serviceRequest;
            } else {
                if (options.calcOptions.context !== null) {
                    serviceRequest.serverHashKey = response.metadata.hash_key;
                    const serviceChecker =
                        new PlatformValuesServiceChecker({
                            calcType: options.calcType,
                            clientHashKey: clientHashKey,
                            serverHashKey: response.metadata.hash_key,
                            controllerCallback: __onServiceCheckerResponse
                        });
                    __serviceCheckers.set(clientHashKey, serviceChecker);
                    if (options.calcOptions.responseCallback !== null &&
                        options.calcOptions.responseCallback !== undefined
                    ) {
                        serviceChecker.addCallback(serviceRequest, options.calcOptions);
                    }
                    serviceChecker.run();
                }
                return serviceRequest;
            }
        },
        async audienceAngles(
            options: IAudienceAnglesOptions
        ) {
            options.input.tag_details ??= [];

            if (options.opportunity !== undefined) {
                const hasRank = options.input.tag_details.find(
                    (x) => x.tag_rank !== 0
                );
                if (hasRank === undefined) {
                    options.input.tag_details.forEach((x) => {
                        if (TagsHelper.isRankeableSubcategory(x.tag_id)) {
                            if (options.input.tag_details !== undefined) {
                                TagsHelper.setTagRankAuto(x, options.input.tag_details);
                            }
                        }
                    });
                }
            }

            return this.__initCalc(
                {
                    calcType: EPlatformValuesCalcType.CALC_AUDIENCES_ANGLES,
                    calcOptions: options
                }
            )
        },
        async competitorsForAngle(
            options: ICompetitorsForAngleOptions
        ) {

            options.input.exclude_apps_from_competitors ??= {
                app_ids: []
            };

            if (options.input.app_id !== undefined) {

                const appDetail = await useAppsStore().getAppDetailAsync({
                    appId: options.input.app_id
                });

                options.input.tier = appDetail.tier;
                options.input.growth = appDetail.growth;
                options.input.tag_details = appDetail.tags;

                if (appDetail.app_type !== AppTypeEnum.CONCEPT) {
                    options.input.store = appDetail.store;
                }

                options.input.exclude_apps_from_competitors.app_ids.push(appDetail.app_id);
                options.input.dev_id = appDetail.dev_id;
            }

            options.input.tag_details ??= [];
            options.input.tag_details.sort((a, b) => a.tag_id.localeCompare(b.tag_id));
            options.input.exclude_apps_from_competitors.app_ids.sort();
            options.responseCallback ??= {};

            return this.__initCalc(
                {
                    calcType: EPlatformValuesCalcType.CALC_COMPETITORS_FOR_AUDIENCE_ANGLE,
                    calcOptions: options
                }
            )
        },
        async competitors(
            options: ICompetitorsOptions
        ) {

            options.requestToken ??= new PlatformCalcRequestToken();

            return this.audienceAngles({
                context: options.context,
                requestToken: options.requestToken,
                opportunity: options.opportunity,
                appId: options.input.app_id,
                input: {
                    dev_id: options.input.dev_id,
                    tag_details: options.input.tag_details,
                    include_angle: options.input.include_angle,
                    exclusive_angle: options.input.exclusive_angle,
                },
                responseCallback: {
                    error: () => options.responseCallback?.finally,
                    done: response => {
                        if (response.response.payload?.result_data === undefined ||
                            response.response.payload.result_data.length === 0) {
                            return;
                        }
                        const anglesToSort = [...response.response.payload.result_data];
                        anglesToSort.sort((a, b) => b.audience_stats.total_audience - a.audience_stats.total_audience);
                        const audienceAngleData = anglesToSort[0];
                        this.competitorsForAngle({
                            context: options.context,
                            requestToken: options.requestToken,
                            input: {
                                audience_angle_row_id: audienceAngleData.row_id,
                                dev_id: options.input.dev_id,
                                app_id: options.input.app_id,
                                tag_details: options.input.tag_details,
                                tier: options.input.tier,
                                growth: options.input.growth,
                                advanced_filter: options.input.advanced_filter,
                                exclude_apps_from_competitors: options.input.exclude_apps_from_competitors,
                                store: options.input.store,
                            },
                            responseCallback: options.responseCallback
                        });
                    }
                }
            });
        },
        async allTags(
            options: IProductNodesAudiencesTsOptions
        ) {
            options.input.exclude_apps_from_competitors ??= {
                app_ids: []
            };

            if (options.input.app_id !== null &&
                options.input.app_id !== undefined) {
                const appDetail = await useAppsStore().getAppDetailAsync({
                    appId: options.input.app_id
                });
                options.input.tier = appDetail.tier;
                options.input.growth = appDetail.growth;

                if (appDetail.app_type !== AppTypeEnum.CONCEPT) {
                    options.input.store = appDetail.store;
                }

                options.input.exclude_apps_from_competitors.app_ids.push(options.input.app_id);
            }

            options.input.tag_details ??= [];
            options.input.tag_details.sort((a, b) => a.tag_id.localeCompare(b.tag_id));
            options.input.exclude_apps_from_competitors.app_ids.sort();

            return this.__initCalc({
                calcType: EPlatformValuesCalcType.CALC_PRODUCT_NODES_AUDIENCES_TS,
                calcOptions: options
            });
        },
        async searchOpportunities(
            options: ISearchOpportunitiesOptions
        ) {
            options.input.tag_details ??= [];
            options.input.tag_details.sort((a, b) => a.tag_id.localeCompare(b.tag_id));

            return this.__initCalc({
                calcType: EPlatformValuesCalcType.CALC_GAPS_SEARCH_OPPORTUNITIES,
                calcOptions: options
            });
        },
        removeContext(context: string) {
            __serviceCheckers.forEach((x) => {
                x.removeCallback(context);
            });
        }
    }
});
