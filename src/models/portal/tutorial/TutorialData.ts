import { ref } from 'vue'

import { type EModuleId } from '@/models/portal/PortalConstants'

export interface ITutorialData {
    modules_seen?: EModuleId[]
}

export const tutorialHand = ref<HTMLElement>()
export const tutorialHandVisible = ref(false)
