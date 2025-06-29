import { Middleware } from '@reduxjs/toolkit'
import { authApi } from '../api.ts'
import {AUTH_KEY_LS} from "../../constants.ts";
import {AuthResponseWithUser} from "../../types/responses/AuthResponse.ts";

export const authMiddleware: Middleware = (store) => (next) => (action) => {
    if (authApi.endpoints.login.matchFulfilled(action)) {
        const payload = action.payload

        localStorage.setItem(AUTH_KEY_LS, JSON.stringify(payload))
    } else if (authApi.endpoints.refresh.matchFulfilled(action)) {
        const {accessToken, refreshToken} = action.payload

        const user = JSON.parse(localStorage.getItem(AUTH_KEY_LS) || '{}') as AuthResponseWithUser
        localStorage.setItem(AUTH_KEY_LS, JSON.stringify({
            ...user,
            accessToken
        }))

        window.location.reload()
        return
    } else if (authApi.endpoints.logout.matchFulfilled(action)) {
        localStorage.removeItem(AUTH_KEY_LS)
    }

    return next(action)
}