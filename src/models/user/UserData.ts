import {DevDetail} from "@/models/portal/apps/AppsData";

export default interface UserData {
    guid: TUserId;
    name: string;
    email: string;
    role: number;
    position_area: number;
    position_role: number;
    tos_agree_t: number | null;
    organization: {
        role: "admin" | "member";
    } | null,
    dev_detail: DevDetail;
    fake_login?: boolean;
    concepts_counter: number;
    added_to_my_apps: number;
    tutorial_finished: boolean;
    free_trial?: number;
}

export declare type TUserId = string;
