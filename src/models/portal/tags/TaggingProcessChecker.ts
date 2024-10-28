import GembaseUtils from "@/utils/GembaseUtils";
import {TAppId, TaggingState} from "@/models/portal/apps/AppsData";
import EndpointRequest from "@/core/requests/EndpointRequest";

export const __taggedInSession: TAppId[] = [];

export class TaggingProcessChecker {

    private __stopped = false;
    private readonly __appId: TAppId;

    constructor(appId: TAppId) {
        this.__appId = appId;
    }

    async start(callback: (TaggingProcessChecker, TaggingState) => void) {

        let counter = 999;
        let notTaggedCounter = 20;

        while (!this.__stopped && counter > 0) {
            counter--;

            if (this.__stopped) {
                return;
            }

            const response = await EndpointRequest.process2<TaggingState>("portal:get_tagging_state", {
                app_id: this.__appId
            });

            if (this.__stopped) {
                return;
            }

            if (response.state === "not_tagged") {
                if (__taggedInSession.includes(this.__appId)) {
                    notTaggedCounter--;
                    if (notTaggedCounter < 0) {
                        this.stop();
                    } else {
                        response.state = "queue";
                    }
                } else {
                    this.stop();
                }
            } else if (response.state !== "queue" && response.state !== "working") {
                this.stop();
            }

            callback(this, response);

            if (this.__stopped) {
                break;
            }

            await GembaseUtils.sleep(1000);
        }
    }

    stop() {
        this.__stopped = true;
    }

    get stopped() {
        return this.__stopped;
    }

    get appId() {
        return this.__appId;
    }
}