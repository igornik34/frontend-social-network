import React, { createContext, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthResponseWithUser } from "../types/responses/AuthResponse.ts"
import { selectAuthData } from "../slice/AuthSlice.ts"
import { useAppSelector } from "../../../app/store/store.ts"
import { AuthRouter } from "../routes.ts"
import { useLogoutMutation } from "../services/api.ts"
import {api} from "../../../shared/api/api.ts";

interface AuthContextType {
    authData: AuthResponseWithUser | undefined;
    handleLogout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate()
    const authData = useAppSelector(selectAuthData)
    const [logout] = useLogoutMutation()

    useEffect(() => {
        if (!authData) {
            navigate(AuthRouter.routes.login)
        }
    }, [authData, navigate])

    const handleLogout = async () => {
        try {
            await logout().unwrap()
            // Очищаем кэш всех запросов RTK Query
            api.util.resetApiState()
            navigate(AuthRouter.routes.login)
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    return (
        <AuthContext.Provider value={{ authData, handleLogout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}