import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {authApi} from '../services/api.ts';
import {AuthResponseWithUser} from "../types/responses/AuthResponse.ts";
import {AUTH_KEY_LS} from "../constants.ts";
import {UpdateProfileRequest} from "../../users/types/requests/UpdateProfileRequest.ts";
import {User} from "../../users/types/models/User.ts";

export function loadUserState(): AuthResponseWithUser | undefined {
    try {
        const serialStateJSON = localStorage.getItem(AUTH_KEY_LS)
        if (serialStateJSON === null) return undefined

        return JSON.parse(serialStateJSON)
    } catch (err) {
        return undefined
    }
}

interface AuthSliceState {
    authData: AuthResponseWithUser | null
}

const initialState: AuthSliceState = {
    authData: loadUserState() || null
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        updateUser: (state, payload: PayloadAction<User>) => {
            state.authData!.firstName = payload.payload.firstName
            state.authData!.lastName = payload.payload.lastName
            state.authData!.avatar = payload.payload.avatar
            state.authData!.bio = payload.payload.bio

            const storedUser = loadUserState()
            localStorage.setItem(AUTH_KEY_LS, JSON.stringify({
                ...storedUser,
                ...payload.payload
            }))
        }
    },
    selectors: {
        selectAuthData: state => state.authData,
    },
    extraReducers: (builder) => {
        builder
            .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action: PayloadAction<AuthResponseWithUser>) => {
                state.authData = action.payload
            })

            .addMatcher(authApi.endpoints.register.matchFulfilled, (state, action: PayloadAction<AuthResponseWithUser>) => {
                state.authData = action.payload
            })

            .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
                state.authData = null
            })
    }
})

export const { selectAuthData } = authSlice.selectors
export const { updateUser } = authSlice.actions
