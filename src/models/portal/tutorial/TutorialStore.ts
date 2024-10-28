import {defineStore} from "pinia";
import {useAuthStore} from "@/models/auth/AuthStore";
import {EModuleId} from "@/models/portal/PortalConstants";
import EndpointRequest from "@/core/requests/EndpointRequest";
import {RoutesEnum} from "@/router/RoutesEnum";
import {tutorialHand, tutorialHandVisible} from "@/models/portal/tutorial/TutorialData";
import GembaseUtils from "@/utils/GembaseUtils";
import {TAppId, TTagId} from "@/models/portal/apps/AppsData";
import {ITutorialResponse} from "@/models/portal/PortalDataTypes";
import {tunerPopupState} from "@/models/portal/auditor/AuditorData";
import {useRouterStore} from "@/core/router/RouterStore";
import {useRouterQuery} from "@/core/router/query/RouterQueryComposable";
import {GapsQueryParams} from "@/models/portal/gaps/GapsQueryParams";

const authStore = useAuthStore();
const routerQuery = useRouterQuery<GapsQueryParams>();

export interface TutorialData {
    modules_seen?: EModuleId[];
}

class TutorialBase {

    public interval = 0;

    private __destroyed = false;
    private __handReason = "";
    private __el: HTMLElement | null = null;
    private __show = false;

    public destroy() {
        window.clearInterval(this.interval);
        this.__destroyed = true;
        this.__hideHand();
    }

    public get destroyed(): boolean {
        return this.__destroyed;
    }

    private __refreshHandVisibility() {
        if (this.__el === null) {
            tutorialHandVisible.value = false;
            return;
        }

        try {
            const display = window.getComputedStyle(this.__el, null).display;
            if (display === "none") {
                tutorialHandVisible.value = false;
                return;

            }
        } catch {
            tutorialHandVisible.value = false;
            return;
        }

        tutorialHandVisible.value = this.__show;

        if (this.__show) {
            this.__syncHandWithEl();
        }
    }

    public loop() {
        this.__loop();
        this.__refreshHandVisibility();
    }

    protected __loop() {
        return;
    }

    private __hideHand() {
        this.__show = false;
        tutorialHandVisible.value = false;
        tutorialHand.value?.classList.remove("tutorial-hand-anim");
    }

    private async __startHandAnim() {
        if (tutorialHand.value === undefined) {
            return;
        }
        this.__hideHand();
        await GembaseUtils.sleep(100);
        if (this.__destroyed) {
            return;
        }
        this.__show = true;
        tutorialHandVisible.value = true;
        tutorialHand.value.classList.add("tutorial-hand-anim");
    }

    showElementId(id: string) {
        if (tutorialHand.value === undefined) {
            return false;
        }
        if (this.__handReason === id) {
            return;
        }
        this.__hideHand();
        const el = document.getElementById(id);
        if (el !== null) {
            this.showHand(el, id);
        }
    }

    private __syncHandWithEl() {
        if (this.__el === null) {
            return;
        }
        if (tutorialHand.value === undefined) {
            return;
        }
        const { top, left, bottom, right } = this.__el.getBoundingClientRect();
        tutorialHand.value.style.left = `${left + ((right - left) / 2)}px`;
        tutorialHand.value.style.top = `${top + ((bottom - top) / 2) - 10}px`;
    }

    showHand(el: HTMLElement, reason: string) {
        if (tutorialHand.value === undefined) {
            return false;
        }
        if (this.__handReason === reason) {
            return;
        }
        this.__el = el;
        this.__handReason = reason;
        this.__syncHandWithEl();
        this.__startHandAnim();
        this.__show = true;
        return true;
    }
}

class TutorialAuditor extends TutorialBase {

    private __threat_score_tooltip_state = 0;
    private __audience_tooltip_state = 0;
    private __movedFromGuide = false;

    private readonly __goal: EModuleId;

    constructor(goal: EModuleId) {
        super();
        this.__goal = goal;
    }

    protected __loop() {
        if (!this.__movedFromGuide && useRouterStore().isCurrentRoute(RoutesEnum.PORTAL_GUIDE)) {
            this.showElementId(`portal_menu_${RoutesEnum.PORTAL_MY_APPS}`);
            return;
        }

        if (useRouterStore().isCurrentRoute(RoutesEnum.PORTAL_MY_APPS)) {
            this.__movedFromGuide = true;

            const appId = useRouterStore().getQueryKey("appId");

            if (appId === undefined) {
                return;
            }

            if (appId !== useTutorialStore().tutorialAppId) {
                this.destroy();
                return;
            }

            const show = useRouterStore().getQueryKey("show");

            if (show === "audit") {
                const audienceAngle = useRouterStore().getQueryKey("audienceAngle");
                if (audienceAngle !== undefined) {

                    if (this.__goal === EModuleId.AUDITOR) {
                        if (this.__threat_score_tooltip_state !== 2) {
                            const el = document.getElementById("threat_score_tooltip_close");
                            if (el !== null) {
                                this.showHand(el, "threat_score_tooltip_close");
                                this.__threat_score_tooltip_state = 1;
                                return;
                            }

                            if (this.__threat_score_tooltip_state === 1) {
                                this.__threat_score_tooltip_state = 2;
                                return;
                            }

                            this.showElementId("auditor_competitors_ts");
                            return;
                        }

                        if (this.__audience_tooltip_state !== 2) {
                            const el = document.getElementById("auditor_audience_tooltip_close");
                            if (el !== null) {
                                this.showHand(el, "auditor_audience_tooltip_close");
                                this.__audience_tooltip_state = 1;
                                return;
                            }

                            if (this.__audience_tooltip_state === 1) {
                                this.__audience_tooltip_state = 2;
                                this.destroy();
                                return;
                            }

                            this.showElementId("auditor_tutorial_node_audience");
                            return;
                        }
                    }

                    if (this.__goal === EModuleId.PLAYERS_EXPLORER) {
                        this.showElementId("auditor_audit_players_explorer_btn");
                        return;
                    }

                    if (this.__goal === EModuleId.GAMES_EXPLORER) {
                        this.showElementId("auditor_audit_games_explorer_btn");
                        return;
                    }

                }

                const el = document.getElementById("auditor_audiences_select_options__1");
                if (el !== null) {
                    this.showHand(el, "auditor_audiences_select_options__1");
                    return;
                }

                this.showElementId("auditor_audiences_select");
                return;
            }

            this.showElementId("auditor_audit");
            return;
        }

        this.destroy();
    }
}

class TutorialTuner extends TutorialBase {

    private __movedFromGuide = false;

    protected __loop() {

        if (tunerPopupState.value === 1) {
            this.destroy();
            return;
        }

        if (!this.__movedFromGuide && useRouterStore().isCurrentRoute(RoutesEnum.PORTAL_GUIDE)) {
            this.showElementId(`portal_menu_${RoutesEnum.PORTAL_MY_APPS}`);
            return;
        }

        if (useRouterStore().isCurrentRoute(RoutesEnum.PORTAL_MY_APPS)) {
            this.__movedFromGuide = true;
            const appId = useRouterStore().getQueryKey("appId");

            if (appId === undefined) {
                return;
            }

            if (appId !== useTutorialStore().tutorialAppId) {
                this.destroy();
                return;
            }

            const show = useRouterStore().getQueryKey("show");

            if (show === "audit") {
                this.showElementId("auditor_tutorial_node");
                return;
            }

            this.showElementId("auditor_audit");
            return;
        }

        this.destroy();
    }
}

class TutorialGaps extends TutorialBase {

    private __movedFromGuide = false;

    protected __loop() {

        if (!this.__movedFromGuide && useRouterStore().isCurrentRoute(RoutesEnum.PORTAL_GUIDE)) {
            this.showElementId(`portal_menu_${RoutesEnum.PORTAL_GAPS}`);
            return;
        }

        if (useRouterStore().isCurrentRoute(RoutesEnum.PORTAL_GAPS)) {
            if (routerQuery.query.value.show === "results") {
                this.__movedFromGuide = true;
                this.showElementId("gaps_card__0__0");
                return;
            }

            this.__movedFromGuide = true;
            const searchBtn = document.getElementById("gaps_search_btn");

            if (searchBtn !== null) {
                if (searchBtn.dataset.na !== "true") {
                    this.showElementId("gaps_search_btn");
                    return;
                }
            }

            const labels = useRouterStore().getQueryKey("labels");

            let tagsIds: TTagId[] = [];
            if (labels !== undefined) {
                tagsIds = labels.split(",");
            }

            const tutorialGapsTagsIds = useTutorialStore().tutorialGapsTagsIds;
            for (let i = 0; i < tutorialGapsTagsIds.length; ++i) {
                if (!tagsIds.includes(tutorialGapsTagsIds[i])) {
                    this.showElementId(`tutorial_gaps__${tutorialGapsTagsIds[i]}`);
                    return
                }
            }

            if (tagsIds.length >= 3) {
                this.showElementId("gaps_search_btn");
                return;
            }

            return;
        }

        this.destroy();
    }
}

class TutorialStudies extends TutorialBase {

    private __movedFromGuide = false;

    protected __loop() {

        if (!this.__movedFromGuide && useRouterStore().isCurrentRoute(RoutesEnum.PORTAL_GUIDE)) {
            this.showElementId(`portal_menu_${RoutesEnum.PORTAL_STUDIES}`);
            return;
        }

        if (useRouterStore().isCurrentRoute(RoutesEnum.PORTAL_STUDIES)) {
            this.__movedFromGuide = true;

            const show = useRouterStore().getQueryKey("show");
            if (show !== undefined) {
                this.destroy();
                return;
            }

            this.showElementId("add_study_btn");
            return;
        }

        this.destroy();
    }
}


let tutorialController: TutorialBase | null = null;

export const useTutorialStore = defineStore('tutorialStore', {
    state: () => ({
        initialized: false,
        tutorialData: {} as TutorialData,
        tutorialUiToggled: true,
        tutorialId: "",
        tutorialStep: "",
        tutorialAppId: "" as TAppId,
        tutorialGapsTagsIds: [] as TTagId[],
        isIntroductionVideo: false
    }),
    actions: {
        init(response: ITutorialResponse) {
            if (this.initialized) {
                return;
            }

            this.tutorialData = response.tutorial;
            this.tutorialAppId = response.app_id;
            this.tutorialGapsTagsIds = response.gaps.tag_ids;

            this.initialized = true;
        },
        async commandReset() {
            await EndpointRequest.process2("tutorial:reset");
            this.tutorialData = {}
            authStore.data.user.tutorial_finished = false;
        },
        async commandModuleSeen(moduleId: EModuleId) {
            if (this.tutorialData.modules_seen?.includes(moduleId)) {
                return;
            }
            this.tutorialData.modules_seen ??= [];
            this.tutorialData.modules_seen.push(moduleId);
            authStore.data.user.tutorial_finished = await EndpointRequest.process2<boolean>("tutorial:module_seen", {
                module_id: moduleId
            });
        },
        startTutorial(tutorialId: string) {
            tutorialController?.destroy();
            tutorialController = null;
            this.tutorialId = tutorialId;
            if (tutorialId.includes("module__")) {
                const moduleId = parseInt(tutorialId.replace("module__", ""));
                if (moduleId === EModuleId.AUDITOR ||
                    moduleId === EModuleId.GAMES_EXPLORER ||
                    moduleId === EModuleId.PLAYERS_EXPLORER) {
                    tutorialController = new TutorialAuditor(moduleId);
                } else if (moduleId === EModuleId.TUNER) {
                    tutorialController = new TutorialTuner();
                } else if (moduleId === EModuleId.GAPS) {
                    tutorialController = new TutorialGaps();
                } else if (moduleId === EModuleId.STUDIES) {
                    tutorialController = new TutorialStudies();
                }
            }
            if (tutorialController !== null) {
                tutorialController.interval = window.setInterval(() => tutorialController?.loop(), 100);
            }
        },
        isAuditorTutorial() {
            if ([
                `module__${EModuleId.AUDITOR}`,
                `module__${EModuleId.TUNER}`,
                `module__${EModuleId.GAMES_EXPLORER}`,
                `module__${EModuleId.PLAYERS_EXPLORER}`
            ].includes(this.tutorialId)) {
                return tutorialController != null && !tutorialController.destroyed;
            }
            return false;
        },
        onIntroduction() {
            this.isIntroductionVideo = true;
        }
    },
    getters: {
        isTutorial(): boolean {
            return authStore.isLogged && !authStore.data.user.tutorial_finished;
        },
        tutorialProgress(): number {
            if (!this.isTutorial) {
                return 100;
            }
            const cnt = this.tutorialData.modules_seen?.length;
            if (cnt !== undefined) {
                return cnt < 3 ? Math.round(100 * (cnt / 3)) : 100;
            }
            return 0;
        }
    }
});
