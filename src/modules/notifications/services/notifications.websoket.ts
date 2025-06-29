// src/shared/websocket/notifications.websocket.ts

import { io, Socket } from "socket.io-client";
import {API_URL} from "../../../constants.ts";
import {UserNotification} from "../types/models/UserNotification.ts";

const WS_URL = API_URL; // замените на ваш URL
const NAMESPACE = "/notifications";

class NotificationWebSocketService {
    private socket: Socket | null = null;

    connect(token: string) {
        this.socket = io(`${WS_URL}${NAMESPACE}`, {
            auth: {
                token,
            },
            forceNew: true,
            transports: ['websocket']
        });

        this.socket.on("connect", () => {
            console.log(`[WebSocket] Connected as user`);
        });

        this.socket.on("disconnect", (reason) => {
            console.log(`[WebSocket] Disconnected: ${reason}`);
        });

        return this.socket;
    }

    onNotification(callback: (notification: UserNotification) => void) {
        if (this.socket) {
            this.socket.on("notification", callback);
        }
    }

    // Отправка событий на сервер (если нужно)
    emit(event: string, payload: any) {
        if (this.socket) {
            this.socket.emit(event, payload);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export const notificationWebSocketService = new NotificationWebSocketService();