// src/modules/auth/components/ProtectedRoute/ProtectedRoute.tsx
import { useAppSelector } from "../../../../app/store/store.ts";
import { selectAuthData } from "../../slice/AuthSlice.ts";
import { Navigate, Outlet } from "react-router-dom";
import { AuthRouter } from "../../routes.ts";
import { Box, Loader } from "@mantine/core";
import { useEffect, useState } from "react";

export const ProtectedRoute = () => {
    const authData = useAppSelector(selectAuthData);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsCheckingAuth(false);
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    if (isCheckingAuth) {
        return (
            <Box style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <Loader size="xl" />
            </Box>
        );
    }

    return authData ? <Outlet /> : <Navigate to={AuthRouter.routes.login} replace />;
};