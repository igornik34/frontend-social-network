import React, { FC, ReactNode, useEffect } from 'react';
import {useAuth} from "../../auth/context/AuthContext.tsx";
import {notificationWebSocketService} from "../services/notifications.websoket.ts";
import {notifications} from "@mantine/notifications";
import {Group, Text} from "@mantine/core";
import {NotificationIcon} from "../components/NotificationIcon.tsx";
import {getNotificationText} from "../utils/getNotificationText.ts";
import {notificationsApi} from "../services/api.ts";
import {useAppDispatch} from "../../../app/store/store.ts";
import {messengerApi} from "../../messenger/services/api.ts";
import {Message} from "../../messages/types/models/Message.ts";

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: FC<NotificationProviderProps> = ({ children }) => {
    const dispatch = useAppDispatch()
    const { authData } = useAuth(); // Получаем токен из контекста авторизации

    useEffect(() => {
        if (!authData?.accessToken) return;

        // Подключаемся к WebSocket
        notificationWebSocketService.connect(authData?.accessToken);

        notificationWebSocketService.onNotification((notification) => {
            if(notification.type !== 'message') {
                dispatch(
                    notificationsApi.util.updateQueryData(
                        'getUnreadCountNotifications',
                        undefined,
                        (draft) => {
                            draft.count += 1
                        }
                    )
                );
                notifications.show({
                    color: 'blue',
                    title: '',
                    message: <Group>
                        <NotificationIcon type={notification.type} />
                        <Text size="sm" fw={500}>
                            {getNotificationText(notification)}
                        </Text>
                    </Group>
                })
            } else {
                dispatch(
                    messengerApi.util.updateQueryData(
                        'getUnreadCountMessages',
                        undefined,
                        (draft) => {
                            draft.count = Array.from(new Set([...draft.count, notification.metadata.chatId]))
                        }
                    )
                );
                console.log(notification.metadata)
                dispatch(
                    messengerApi.util.updateQueryData(
                        'getChats',
                        {query: ''},
                        (draft) => {
                            for (const page of draft.pages) {
                                const index = page.data.findIndex(p => p.id === notification.metadata.chatId);
                                if (index !== -1) {
                                    page.data[index].unreadCount += 1
                                    page.data[index].lastMessage = notification.metadata as Message
                                }
                            }
                        }
                    )
                );
            }
        });

        return () => {
            // Отключаемся при размонтировании
            notificationWebSocketService.disconnect();
        };
    }, [authData]);

    return <>{children}</>;
};