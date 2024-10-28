import UserData from "@/models/user/UserData";

export interface LoginTokenResponse {
    state: "error" | "ok";
    user_data: UserData;
}

export interface LoginCredentialsResponse {
    state: "error" | "ok";
    user_data: UserData;
    client_token: string;
}