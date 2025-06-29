import { combineReducers, configureStore } from '@reduxjs/toolkit'
import type { PreloadedState } from '@reduxjs/toolkit'
import {api} from "../../shared/api/api.ts";
import {setupListeners} from "@reduxjs/toolkit/query";
import {authMiddleware} from "../../modules/auth/services/middleware/authMiddleware.ts";
import {rtkQueryErrorLogger} from "./middleware/handlingError.tsx";
import {authSlice} from "../../modules/auth/slice/AuthSlice.ts";
import {useDispatch, useSelector} from "react-redux";

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  auth: authSlice.reducer,
})

export const setupStore = (preloadedState?: PreloadedState<RootState>) => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      // adding the api middleware enables caching, invalidation, polling and other features of `rtk-query`
      getDefaultMiddleware({
        // Отключение проверки на неизменяемость состояния для повышения производительности.
        // Может быть полезно в больших приложениях, но отключение этой проверки может скрывать ошибки.
        immutableCheck: false,
        // Отключение проверки на сериализуемость состояния для повышения производительности.
        // Важно, чтобы все действия и состояния были сериализуемыми, но эта проверка может быть отключена для повышения производительности.
        serializableCheck: false,
        actionCreatorCheck: false
      }).concat(api.middleware).concat(authMiddleware).concat(rtkQueryErrorLogger),
    preloadedState,
  })
}

setupListeners(setupStore().dispatch)

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

export const store = setupStore()