import { isRejectedWithValue } from '@reduxjs/toolkit'
import type { Middleware } from '@reduxjs/toolkit'
import { notifications } from '@mantine/notifications'
import {api} from "../../../shared/api/api.ts";
import {authApi} from "../../../modules/auth/services/api.ts";

export const rtkQueryErrorLogger: Middleware =
    (store) => (next) => async (action) => {
        if (isRejectedWithValue(action)) {
            console.warn('We got a rejected action!')

            let errorMessage = 'Произошла ошибка'

            if (!!action.payload && typeof action.payload === 'object') {
                if ('message' in action.payload) {
                    errorMessage = (action.payload as { message: string }).message
                } else if ('data' in action.payload && typeof action.payload.data === 'string') {
                    errorMessage = action.payload.data as string
                    console.log(errorMessage)
                    if (action?.payload?.data === 'Unauthorized') {
                        try {
                            // Используем прямой вызов API без хуков
                            await authApi.endpoints.refresh.initiate()(store.dispatch, store.getState, undefined)
                            return
                        } catch (error) {
                            await authApi.endpoints.logout.initiate()(store.dispatch, store.getState, undefined)
                        }
                    }
                } else {
                    errorMessage = JSON.stringify(action.payload)
                }
            } else if (typeof action.payload === 'string') {
                errorMessage = action.payload
            }

            notifications.show({
                title: 'Ошибка!',
                color: 'red',
                message: errorMessage
            })
        }
        return next(action)
    }