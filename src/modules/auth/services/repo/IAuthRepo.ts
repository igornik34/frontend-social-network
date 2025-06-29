import {RegisterRequest} from "../../types/requests/RegisterRequest.ts";
import {AuthResponse, AuthResponseWithUser} from "../../types/responses/AuthResponse.ts";
import {LoginRequest} from "../../types/requests/LoginRequest.ts";

export interface IAuthRepo {
    register(req: RegisterRequest): Promise<AuthResponseWithUser>
    login(req: LoginRequest): Promise<AuthResponseWithUser>
    refresh(): Promise<AuthResponse>
    logout(): Promise<true>
}