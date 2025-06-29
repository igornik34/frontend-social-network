import {api} from "../../../shared/api/api.ts";
import {AuthRepo} from "./repo/AuthRepo.ts";
import {AuthResponse, AuthResponseWithUser} from "../types/responses/AuthResponse.ts";
import {RegisterRequest} from "../types/requests/RegisterRequest.ts";
import {FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {AxiosError} from "axios";
import {LoginRequest} from "../types/requests/LoginRequest.ts";

const authRepo = new AuthRepo()

export const authApi = api.injectEndpoints({
    endpoints: build => ({
        register: build.mutation<AuthResponseWithUser, RegisterRequest>({
            queryFn: async (req) => {
                try {
                    const res = await authRepo.register(req)
                    return {data: res}
                } catch (error) {
                    return {
                        error: {
                            status: 'CUSTOM_ERROR',
                            data: error && typeof error === 'object' && 'message' in error ? error.message : 'Неизвестная ошибка',
                        } as FetchBaseQueryError,
                    };
                }
            }
        }),
        login: build.mutation<AuthResponseWithUser, LoginRequest>({
            queryFn: async (req) => {
                try {
                    const res = await authRepo.login(req)
                    return {data: res}
                } catch (error) {
                    return {
                        error: {
                            status: 'CUSTOM_ERROR',
                            data: error && typeof error === 'object' && 'message' in error ? error.message : 'Неизвестная ошибка',
                        } as FetchBaseQueryError,
                    };
                }
            }
        }),
        logout: build.mutation<true, void>({
            queryFn: async () => {
                try {
                    const res = await authRepo.logout()
                    return {data: res}
                } catch (error) {
                    console.log(error)
                    return {
                        error: {
                            status: 'CUSTOM_ERROR',
                            data: error && typeof error === 'object' && 'message' in error ? error.message : 'Неизвестная ошибка',
                        } as FetchBaseQueryError,
                    };
                }
            }
        }),
        refresh: build.mutation<AuthResponse, void>({
            queryFn: async () => {
                try {
                    const res = await authRepo.refresh()
                    return {data: res}
                } catch (error) {
                    console.log(error)
                    return {
                        error: {
                            status: 'CUSTOM_ERROR',
                            data: error && typeof error === 'object' && 'message' in error ? error.message : 'Неизвестная ошибка',
                        } as FetchBaseQueryError,
                    };
                }
            }
        })
    })
})

export const {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useRefreshMutation
} = authApi