// src/services/call-websocket.service.ts
import {io, Socket} from "socket.io-client";
import {API_URL, HOST, PORT_PEER} from "../../../constants.ts";
import Peer from 'peerjs';

const WS_URL = API_URL;
const NAMESPACE = "/calls";

export interface CallEvent {
    callId: string;
    userId?: string;
    calleeId?: string;
    callerName: string
    callerAvatar: string
    callType: 'audio' | 'video'
}

interface CallStatusUpdate {
    isMuted?: boolean;
    isVideoOn?: boolean;
    isScreenSharing?: boolean;
}

class CallWebSocketService {
    private socket: Socket | null = null;
    private peer: Peer | null = null;
    private peerId: string | null = null;

    connect(token: string, userId: string) {
        this.socket = io(`${WS_URL}${NAMESPACE}`, {
            auth: { token },
            forceNew: true,
            transports: ['websocket']
        });

        // Инициализируем PeerJS соединение
        this.peer = new Peer(userId, {
            host: HOST, // или ваш хост PeerJS сервера
            port: PORT_PEER,
            path: '/peerjs',
            key: 'peerjs',
            // secure: true
        });

        this.peer.on('open', (id) => {
            this.peerId = id;
            console.log('PeerJS connected with ID:', id);
        });

        this.peer.on('error', (err) => {
            console.error('PeerJS error:', err);
        });

        this.socket.on("connect", () => {
            console.log("[CallWebSocket] Connected");
        });

        this.socket.on("disconnect", (reason) => {
            console.log(`[CallWebSocket] Disconnected: ${reason}`);
        });

        return this.socket;
    }

    onIncomingCall(callback: (event: CallEvent) => void) {
        if(this.socket) {
            console.log('INCOME')
            this.socket.on("incomingCall", callback);
        }
    }

    onCallAnswered(callback: (event: CallEvent) => void) {
        if(this.socket) {
            this.socket.on("callAnswered", callback);
        }
    }

    onCallEnded(callback: (event: CallEvent) => void) {
        if(this.socket) {
            this.socket.on("callEnded", callback);
        }
    }


    onCallStatusUpdate(callback: (event: CallEvent) => void) {
        if(this.socket) {
            this.socket.on("callStatusUpdate", callback);
        }
    }
    offIncomingCall(callback: (event: CallEvent) => void) {
        if(this.socket) {
            this.socket.off("incomingCall", callback);
        }
    }

    offCallAnswered(callback: (event: CallEvent) => void) {
        if(this.socket) {
            this.socket.off("callAnswered", callback);
        }
    }

    offCallEnded(callback: (event: CallEvent) => void) {
        if(this.socket) {
            this.socket.off("callEnded", callback);
        }
    }


    offCallStatusUpdate(callback: (event: CallEvent) => void) {
        if(this.socket) {
            this.socket.off("callStatusUpdate", callback);
        }
    }

    // Call control methods
    async initiateCall(calleeId: string, callerName: string, callerAvatar: string, callType: 'audio' | 'video') {
        if(!this.socket) return
        return await this.socket.emitWithAck("initiateCall", {calleeId, callerName, callerAvatar, callType})
    }

    answerCall(callId: string) {
        this.socket?.emit("answerCall", { callId });
    }

    endCall(callId: string) {
        this.socket?.emit("endCall", { callId });
    }

    updateCallStatus(callId: string, status: CallStatusUpdate) {
        // Добавляем userId отправителя
        this.socket?.emit("callStatusUpdate", {
            callId,
            ...status,
            userId: this.peerId // Добавляем ID текущего пользователя
        });
    }

    getPeer() {
        return this.peer;
    }

    getSocket() {
        return this.socket;
    }

    getPeerId() {
        return this.peerId;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
        if (this.peer) {
            this.peer.destroy();
        }
        this.socket = null;
        this.peer = null;
        this.peerId = null;
    }
}

export const callWebSocketService = new CallWebSocketService();