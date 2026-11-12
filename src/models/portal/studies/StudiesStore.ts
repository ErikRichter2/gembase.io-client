import { defineStore } from 'pinia'
import { type PortalStudiesDef, type PortalStudiesStudy } from '@/models/portal/studies/StudiesData'
import { StudiesHelper } from '@/models/portal/studies/StudiesHelper'
import { usePortalStore } from '@/models/portal/PortalStore'
import { EModuleId } from '@/models/portal/PortalConstants'
import GembaseUtils from '@/utils/GembaseUtils'
import { ref } from 'vue'
import { studiesCommands } from '@/commands/studiesCommands'
import ClientError from '@/errors/clientError'
import { useQueryModel } from '@/router/queryModelComposable'

export const FEATURES_POOL_IDS = ['features_1', 'features_2']

export const useStudiesStore = defineStore('studiesStore', () => {
    const initialized = ref<boolean>()
    const studies = ref<PortalStudiesStudy[]>([])
    const def = ref<PortalStudiesDef>({ age: [], countries: [], traits: [] })
    const isAsyncOp = ref<boolean>(false)

    async function init() {
        if (!initialized.value) {
            def.value = await studiesCommands.getStudiesDef()
            StudiesHelper.init(def.value)
            studies.value = await studiesCommands.getStudies()
            initialized.value = true
        }
    }

    function hasStudy(studyGuid?: string | null) {
        const study = studies.value.find((x) => x.guid === studyGuid)
        return study !== undefined
    }

    function getStudy(studyGuid?: string) {
        for (let i = 0; i < studies.value.length; ++i) {
            if (studies.value[i].guid === studyGuid) {
                return studies.value[i]
            }
        }
        throw new ClientError(`Study not found !`)
    }

    async function addStudy() {
        isAsyncOp.value = true

        const res = await studiesCommands.createStudy()

        studies.value = res.studies
        isAsyncOp.value = false

        return res.study_guid
    }

    async function saveStudy(study: PortalStudiesStudy) {
        await studiesCommands.saveStudy({
            study_guid: study.guid,
            data: study,
        })
    }

    async function launchStudy(study: PortalStudiesStudy) {
        study.state = 'preparing'
        await studiesCommands.launchStudy({
            study_guid: study.guid,
        })
    }

    async function copyStudy(study: PortalStudiesStudy) {
        const res = await studiesCommands.copyStudy({
            study_guid: study.guid,
        })
        studies.value = res.studies
    }

    async function generateCsvForInternalLaunch(studyGuid: string) {
        await studiesCommands.generateCsvForInternalLaunch({
            study_guid: studyGuid,
        })
    }

    async function simulateSurvey(studyGuid: string) {
        const res = await studiesCommands.simulateSurvey({
            study_guid: studyGuid,
        })
        studies.value = res
    }

    async function deleteStudy(studyGuid: string) {
        await studiesCommands.deleteStudy({
            study_guid: studyGuid,
        })
        const study = studies.value.find((x) => x.guid === studyGuid)
        if (study !== undefined) {
            GembaseUtils.removeFromArr(studies.value, study)
        }
    }

    function isLocked() {
        return usePortalStore().isModuleLocked(EModuleId.STUDIES)
    }

    const query = useQueryModel<{ study?: string; show?: string }>({ show: `concepts` }).query

    return {
        isLocked,
        deleteStudy,
        simulateSurvey,
        generateCsvForInternalLaunch,
        copyStudy,
        launchStudy,
        saveStudy,
        addStudy,
        getStudy,
        hasStudy,
        init,
        query,
        def,
        initialized,
        isAsyncOp,
        studies,
    }
})
