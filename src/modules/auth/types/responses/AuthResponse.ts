import {AuthUser} from "../models/AuthUser.ts";

export interface AuthResponse {
    accessToken: string
    refreshToken: string
}

export interface AuthResponseWithUser extends AuthUser, AuthResponse {}