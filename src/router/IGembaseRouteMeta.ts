import {EModuleId} from "@/models/portal/PortalConstants";
import {IGbRouteMeta} from "@/core/router/IGbRouteMeta";

export default interface IGembaseRouteMeta extends IGbRouteMeta {
    requiresAuth?: boolean;
    title?: string;
    icon?: string;
    wip?: boolean;
    admin?: boolean;
    user?: string;
    moduleId?: EModuleId;
}
