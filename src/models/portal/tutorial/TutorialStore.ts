import { defineStore } from 'pinia'
import { EModuleId } from '@/models/portal/PortalConstants'
import { type ITutorialResponse } from '@/models/portal/PortalDataTypes'
import { computed, ref } from 'vue'
import {
    TutorialAuditor,
    TutorialGaps,
    TutorialStudies,
    TutorialTuner,
    type TutorialBase,
} from './TutorialController'
import ClientError from '@/errors/clientError'
import { portalCommands } from '@/commands/portalCommands'
import type { TAppId, TTagId } from '../apps/AppsData'
import { useSessionStore } from '@/stores/SessionStore'

interface ITutorialStoreData {
    serverData: ITutorialResponse
    tutorialUiToggled?: boolean
    tutorialStep?: string
}

let tutorialController: TutorialBase | null

export const useTutorialStore = defineStore('tutorialStore', () => {
    const initialized = ref<boolean>(false)
    const tutorialUiToggled = ref<boolean>(true)
    const tutorialId = ref<string>(``)
    const tutorialStep = ref<string>(``)
    const tutorialAppId = ref<TAppId>(``)
    const tutorialGapsTagsIds = ref<TTagId[]>([])
    const isIntroductionVideo = ref<boolean>(false)

    const _storeData = ref<ITutorialStoreData>()

    const sessionStore = useSessionStore()

    function init(serverData: ITutorialResponse) {
        if (initialized.value) {
            return
        }

        _storeData.value = {
            serverData: serverData,
        }

        initialized.value = true
    }

    const storeData = computed(() => {
        if (_storeData.value === undefined) {
            throw new ClientError('Data not loaded')
        }

        return _storeData.value
    })

    async function resetTutorial() {
        await portalCommands.resetTutorial()
        _storeData.value = undefined
        sessionStore.userData.tutorial_finished = false
    }

    async function setModuleAsSeen(moduleId: EModuleId) {
        if (storeData.value.serverData.tutorial.modules_seen?.includes(moduleId)) {
            return
        }
        storeData.value.serverData.tutorial.modules_seen ??= []
        storeData.value.serverData.tutorial.modules_seen.push(moduleId)
    }

    function startTutorial(_tutorialId: string) {
        tutorialController?.destroy()
        tutorialController = null
        tutorialId.value = _tutorialId
        if (tutorialId.value.includes('module__')) {
            const moduleId = parseInt(tutorialId.value.replace('module__', ''))
            if (
                moduleId === EModuleId.AUDITOR ||
                moduleId === EModuleId.GAMES_EXPLORER ||
                moduleId === EModuleId.PLAYERS_EXPLORER
            ) {
                tutorialController = new TutorialAuditor(moduleId)
            } else if (moduleId === EModuleId.TUNER) {
                tutorialController = new TutorialTuner()
            } else if (moduleId === EModuleId.GAPS) {
                tutorialController = new TutorialGaps()
            } else if (moduleId === EModuleId.STUDIES) {
                tutorialController = new TutorialStudies()
            }
        }
        if (tutorialController !== null) {
            tutorialController.interval = window.setInterval(() => tutorialController?.loop(), 100)
        }
    }

    function isAuditorTutorial() {
        if (
            [
                `module__${EModuleId.AUDITOR}`,
                `module__${EModuleId.TUNER}`,
                `module__${EModuleId.GAMES_EXPLORER}`,
                `module__${EModuleId.PLAYERS_EXPLORER}`,
            ].includes(tutorialId.value)
        ) {
            return tutorialController != null && !tutorialController.destroyed
        }
        return false
    }

    const isTutorial = computed(
        () => sessionStore.isLogged && !sessionStore.userData.tutorial_finished,
    )

    function onIntroduction() {
        isIntroductionVideo.value = true
    }

    function tutorialProgress(): number {
        if (!isTutorial.value) {
            return 100
        }
        const cnt = storeData.value.serverData.tutorial.modules_seen?.length
        if (cnt !== undefined) {
            return cnt < 3 ? Math.round(100 * (cnt / 3)) : 100
        }
        return 0
    }

    return {
        init,
        tutorialId,
        tutorialAppId,
        isAuditorTutorial,
        tutorialGapsTagsIds,
        storeData,
        isTutorial,
        tutorialUiToggled,
        tutorialProgress,
        onIntroduction,
        resetTutorial,
        setModuleAsSeen,
        startTutorial,
    }
})
