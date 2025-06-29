import { useEffect } from "react";
import {notificationWebSocketService} from "../services/notifications.websoket.ts";
import {notifications} from "@mantine/notifications";

export const useNotifications = (token: string | null) => {
    useEffect(() => {
        if (!token) return;

        notificationWebSocketService.connect(token);



        return () => {
            notificationWebSocketService.disconnect();
        };
    }, [token]);
};