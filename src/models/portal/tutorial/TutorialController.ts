import GembaseUtils from '@/utils/GembaseUtils'
import { ref } from 'vue'
import { EModuleId } from '../PortalConstants'
import { useTutorialStore } from './TutorialStore'
import { tunerPopupState } from '../auditor/AuditorData'
import type { TTagId } from '../apps/AppsData'
import type { GapsQueryParams } from '../gaps/GapsQueryParams'
import router from '@/router'
import { PORTAL_ROUTES } from '@/router/routes/PortalRoutes'

const tutorialHand = ref<HTMLElement>()
const tutorialHandVisible = ref<boolean>()

export class TutorialBase {
    public interval = 0

    private __destroyed = false
    private __handReason = ''
    private __el: HTMLElement | null = null
    private __show = false

    public destroy() {
        window.clearInterval(this.interval)
        this.__destroyed = true
        this.__hideHand()
    }

    public get destroyed(): boolean {
        return this.__destroyed
    }

    private __refreshHandVisibility() {
        if (this.__el === null) {
            tutorialHandVisible.value = false
            return
        }

        try {
            const display = window.getComputedStyle(this.__el, null).display
            if (display === 'none') {
                tutorialHandVisible.value = false
                return
            }
        } catch {
            tutorialHandVisible.value = false
            return
        }

        tutorialHandVisible.value = this.__show

        if (this.__show) {
            this.__syncHandWithEl()
        }
    }

    public loop() {
        this.__loop()
        this.__refreshHandVisibility()
    }

    protected __loop() {
        return
    }

    private __hideHand() {
        this.__show = false
        tutorialHandVisible.value = false
        tutorialHand.value?.classList.remove('tutorial-hand-anim')
    }

    private async __startHandAnim() {
        if (tutorialHand.value === undefined) {
            return
        }
        this.__hideHand()
        await GembaseUtils.sleep(100)
        if (this.__destroyed) {
            return
        }
        this.__show = true
        tutorialHandVisible.value = true
        tutorialHand.value.classList.add('tutorial-hand-anim')
    }

    showElementId(id: string) {
        if (tutorialHand.value === undefined) {
            return false
        }
        if (this.__handReason === id) {
            return
        }
        this.__hideHand()
        const el = document.getElementById(id)
        if (el !== null) {
            this.showHand(el, id)
        }
    }

    private __syncHandWithEl() {
        if (this.__el === null) {
            return
        }
        if (tutorialHand.value === undefined) {
            return
        }
        const { top, left, bottom, right } = this.__el.getBoundingClientRect()
        tutorialHand.value.style.left = `${left + (right - left) / 2}px`
        tutorialHand.value.style.top = `${top + (bottom - top) / 2 - 10}px`
    }

    showHand(el: HTMLElement, reason: string) {
        if (tutorialHand.value === undefined) {
            return false
        }
        if (this.__handReason === reason) {
            return
        }
        this.__el = el
        this.__handReason = reason
        this.__syncHandWithEl()
        this.__startHandAnim()
        this.__show = true
        return true
    }
}

export class TutorialAuditor extends TutorialBase {
    private __threat_score_tooltip_state = 0
    private __audience_tooltip_state = 0
    private __movedFromGuide = false

    private readonly __goal: EModuleId

    constructor(goal: EModuleId) {
        super()
        this.__goal = goal
    }

    protected __loop() {
        if (
            !this.__movedFromGuide &&
            router.currentRoute.value.path === PORTAL_ROUTES.PORTAL_INDEX
        ) {
            this.showElementId(`portal_menu_${PORTAL_ROUTES.PORTAL_MY_APPS}`)
            return
        }

        if (router.currentRoute.value.path === PORTAL_ROUTES.PORTAL_MY_APPS) {
            this.__movedFromGuide = true

            const appId = router.currentRoute.value.query['appId']

            if (appId === undefined) {
                return
            }

            if (appId !== useTutorialStore().tutorialAppId) {
                this.destroy()
                return
            }

            const show = router.currentRoute.value.query['show']

            if (show === 'audit') {
                const audienceAngle = router.currentRoute.value.query['audienceAngle']
                if (audienceAngle !== undefined) {
                    if (this.__goal === EModuleId.AUDITOR) {
                        if (this.__threat_score_tooltip_state !== 2) {
                            const el = document.getElementById('threat_score_tooltip_close')
                            if (el !== null) {
                                this.showHand(el, 'threat_score_tooltip_close')
                                this.__threat_score_tooltip_state = 1
                                return
                            }

                            if (this.__threat_score_tooltip_state === 1) {
                                this.__threat_score_tooltip_state = 2
                                return
                            }

                            this.showElementId('auditor_competitors_ts')
                            return
                        }

                        if (this.__audience_tooltip_state !== 2) {
                            const el = document.getElementById('auditor_audience_tooltip_close')
                            if (el !== null) {
                                this.showHand(el, 'auditor_audience_tooltip_close')
                                this.__audience_tooltip_state = 1
                                return
                            }

                            if (this.__audience_tooltip_state === 1) {
                                this.__audience_tooltip_state = 2
                                this.destroy()
                                return
                            }

                            this.showElementId('auditor_tutorial_node_audience')
                            return
                        }
                    }

                    if (this.__goal === EModuleId.PLAYERS_EXPLORER) {
                        this.showElementId('auditor_audit_players_explorer_btn')
                        return
                    }

                    if (this.__goal === EModuleId.GAMES_EXPLORER) {
                        this.showElementId('auditor_audit_games_explorer_btn')
                        return
                    }
                }

                const el = document.getElementById('auditor_audiences_select_options__1')
                if (el !== null) {
                    this.showHand(el, 'auditor_audiences_select_options__1')
                    return
                }

                this.showElementId('auditor_audiences_select')
                return
            }

            this.showElementId('auditor_audit')
            return
        }
    }
}

export class TutorialTuner extends TutorialBase {
    private __movedFromGuide = false

    protected __loop() {
        if (tunerPopupState.value === 1) {
            this.destroy()
            return
        }

        if (
            !this.__movedFromGuide &&
            router.currentRoute.value.path === PORTAL_ROUTES.PORTAL_GUIDE
        ) {
            this.showElementId(`portal_menu_${PORTAL_ROUTES.PORTAL_MY_APPS}`)
            return
        }
    }
}

export class TutorialGaps extends TutorialBase {
    private __movedFromGuide = false

    protected __loop() {
        if (
            !this.__movedFromGuide &&
            router.currentRoute.value.path === PORTAL_ROUTES.PORTAL_GUIDE
        ) {
            this.showElementId(`portal_menu_${PORTAL_ROUTES.PORTAL_GAPS}`)
        }

        this.destroy()
    }
}

export class TutorialStudies extends TutorialBase {
    private __movedFromGuide = false

    protected __loop() {
        if (
            !this.__movedFromGuide &&
            router.currentRoute.value.path === PORTAL_ROUTES.PORTAL_GUIDE
        ) {
            this.showElementId(`portal_menu_${PORTAL_ROUTES.PORTAL_STUDIES}`)
        }

        this.destroy()
    }
}
