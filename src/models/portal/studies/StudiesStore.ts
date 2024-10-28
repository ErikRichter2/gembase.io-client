import {defineStore} from "pinia";
import EndpointRequest from "@/core/requests/EndpointRequest";
import {PortalStudiesDef, PortalStudiesQuery, PortalStudiesStudy} from "@/models/portal/studies/StudiesData";
import ClientError from "@/core/errors/ClientError";
import {StudiesHelper} from "@/models/portal/studies/StudiesHelper";
import {usePortalStore} from "@/models/portal/PortalStore";
import {EModuleId} from "@/models/portal/PortalConstants";
import GembaseUtils from "@/utils/GembaseUtils";
import {useRouterQuery} from "@/core/router/query/RouterQueryComposable";

export const FEATURES_POOL_IDS = ["features_1", "features_2"]

export const useStudiesStore = defineStore('studiesStore', {
    state: () => ({
        initialized: false,
        studies: [] as PortalStudiesStudy[],
        def: {} as PortalStudiesDef,
        isAsyncOp: false,
        routerQuery: useRouterQuery<PortalStudiesQuery>()
    }),
    actions: {
        async init() {
            if (!this.initialized) {
                this.def = await EndpointRequest.process2<PortalStudiesDef>("studies:get_studies_def");
                StudiesHelper.init(this.def);
                this.studies = await EndpointRequest.process2<PortalStudiesStudy[]>("studies:get_studies");
                this.initialized = true;
            }
        },
        hasStudy(studyGuid?: string | null) {
            const study = this.studies.find((x) => x.guid === studyGuid);
            return study !== undefined;
        },
        getStudy(studyGuid?: string) {
            for (let i = 0; i < this.studies.length; ++i) {
                if (this.studies[i].guid === studyGuid) {
                    return this.studies[i];
                }
            }
            throw new ClientError(`Study not found !`);
        },
        async addStudy() {
            this.isAsyncOp = true;

            const res = await EndpointRequest.process2<{
                state: string;
                study_guid: string;
                studies: PortalStudiesStudy[]
            }>("studies:create_study");

            this.studies = res.studies;
            this.isAsyncOp = false;

            return res.study_guid;
        },
        async saveStudy(study: PortalStudiesStudy) {
            await EndpointRequest.process2<{
                state: string;
            }>("studies:save_study", {
                study_guid: study.guid,
                data: study
            });
        },
        async launchStudy(study: PortalStudiesStudy) {
            study.state = "preparing";
            await EndpointRequest.process2<{
                state: string;
            }>("studies:launch_study", {
                study_guid: study.guid
            });
        },
        async copyStudy(study: PortalStudiesStudy) {
            const res = await EndpointRequest.process2<{
                state: string;
                study_guid: string;
                studies: PortalStudiesStudy[];
            }>("studies:copy_study", {
                study_guid: study.guid
            });
            this.studies = res.studies;
        },
        async generateCsvForInternalLaunch(studyGuid: string) {
            await EndpointRequest.process2<string>("studies:generate_csv_for_internal_launch", {
                study_guid: studyGuid
            });
        },
        async simulateSurvey(studyGuid: string) {
            const res = await EndpointRequest.process2<PortalStudiesStudy[]>("studies:simulate_survey", {
                study_guid: studyGuid
            });
            this.studies = res;
        },
        isLocked() {
            return usePortalStore().isModuleLocked(EModuleId.STUDIES);
        },
        async deleteStudy(studyGuid: string) {
            await EndpointRequest.process2("studies:delete_study", {
                study_guid: studyGuid
            });
            const study = this.studies.find((x) => x.guid === studyGuid);
            if (study !== undefined) {
                GembaseUtils.removeFromArr(this.studies, study);
            }
        }
    }
});
