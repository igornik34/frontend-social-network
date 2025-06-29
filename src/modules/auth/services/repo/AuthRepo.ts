import {IAuthRepo} from "./IAuthRepo.ts";
import {RegisterRequest} from "../../types/requests/RegisterRequest.ts";
import {AuthResponse, AuthResponseWithUser} from "../../types/responses/AuthResponse.ts";
import {API_URL} from "../../../../constants.ts";
import {httpClient} from "../../../../shared/utils/httpClient.ts";
import {LoginRequest} from "../../types/requests/LoginRequest.ts";

console.log(API_URL)

export class AuthRepo implements IAuthRepo {
    async register(req: RegisterRequest): Promise<AuthResponseWithUser> {
        return await httpClient.post(`${API_URL}/auth/register`, req)
    }
    async login(req: LoginRequest): Promise<AuthResponseWithUser> {
        return await httpClient.post(`${API_URL}/auth/login`, req, {
            withCredentials: true
        })
    }
    async refresh(): Promise<AuthResponse> {
        return await httpClient.post(`${API_URL}/auth/refresh`, {}, {
            withCredentials: true
        })
    }
    async logout(): Promise<true> {
        return await httpClient.post(`${API_URL}/auth/logout`)
    }
}