import { IMessagesRepo } from "./IMessagesRepo";
import { SendMessageRequest } from "../../types/requests/SendMessageRequest";
import { SendMessageResponse } from "../../types/responses/SendMessageResponse";
import { io, Socket } from "socket.io-client";
import { API_URL } from "../../../../constants.ts";
import { httpClient } from "../../../../shared/utils/httpClient.ts";
import { GetMessagesByChatIdRequest } from "../../types/requests/GetMessagesByChatIdRequest.ts";
import { BaseResponse } from "../../../../shared/types/BaseResponse.ts";
import { Message } from "../../types/models/Message.ts";
import { PaginationParams } from "../../../../shared/types/PaginationParams.ts";
import { loadUserState } from "../../../auth/slice/AuthSlice.ts";
import {SendReactionRequest} from "../../types/requests/SendReactionRequest.ts";
import {MarkAsReadMessagesRequest} from "../../types/requests/MarkAsReadMessagesRequest.ts";

export class MessagesRepo implements IMessagesRepo {
    private readonly baseUrl: string;
    private socket: Socket | null = null;
    private messageHandlers: ((message: any) => void)[] = [];
    private reactionHandlers: ((reaction: any) => void)[] = [];
    private markedMessagesHandlers: ((messageIds: any) => void)[] = [];
    private typingHandlers: ((userId: string) => void)[] = [];
    private connectionPromise: Promise<void> | null = null;
    private currentConversationId: string | null = null;

    constructor() {
        this.baseUrl = API_URL;
    }

    private initializeSocket(conversationId: string): Socket {
        console.log(conversationId, "CONV")
        return io(`${this.baseUrl}/chat`, {
            auth: {
                token: loadUserState()!.accessToken
            },
            query: {
                conversationId
            },
            transports: ['websocket'],
            autoConnect: false // Подключаем вручную после инициализации
        });
    }

    async connect(conversationId: string): Promise<void> {
        if (this.connectionPromise && this.currentConversationId === conversationId) {
            return this.connectionPromise;
        }

        // Если пытаемся подключиться к другому чату, сначала отключаемся
        if (this.socket) {
            this.disconnect();
        }

        this.currentConversationId = conversationId;
        this.socket = this.initializeSocket(conversationId);

        this.connectionPromise = new Promise((resolve, reject) => {
            if (!this.socket) {
                reject(new Error('Socket initialization failed'));
                return;
            }

            this.socket.on('connect', () => {
                console.log('Socket.IO connected to conversation:', conversationId);
                resolve();
            });

            this.socket.on('connect_error', (err) => {
                console.error('Socket.IO connection error:', err);
                reject(err);
                this.connectionPromise = null;
            });

            this.socket.on('error', (err) => {
                console.error('Socket error:', err);
            });

            this.socket.on('new-message', (message) => {
                console.log('hello')
                this.messageHandlers.forEach(handler => handler(message));
            });

            this.socket.on('new-reaction', (reaction) => {
                console.log('hello')
                this.reactionHandlers.forEach(handler => handler(reaction));
            });

            this.socket.on('marked-messages', (reaction) => {
                console.log('hello')
                console.log(reaction)
                this.markedMessagesHandlers.forEach(handler => handler(reaction));
            });

            this.socket.on('typing', (userId: string) => {
                console.log(this.typingHandlers)
                this.typingHandlers.forEach(handler => handler(userId));
            });

            this.socket.connect();
        });

        return this.connectionPromise;
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.connectionPromise = null;
        this.currentConversationId = null;
    }

    onMessage(handler: (message: any) => void): () => void {
        this.messageHandlers.push(handler);
        console.log(123)
        return () => {
            console.log(789)
            this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
        };
    }

    onReaction(handler: (message: any) => void): () => void {
        this.reactionHandlers.push(handler);
        console.log(123)
        return () => {
            console.log(789)
            this.reactionHandlers = this.reactionHandlers.filter(h => h !== handler);
        };
    }

    onMarkMessages(handler: (messageIds: any) => void): () => void {
        this.markedMessagesHandlers.push(handler);
        console.log(123)
        return () => {
            console.log(789)
            this.markedMessagesHandlers = this.markedMessagesHandlers.filter(h => h !== handler);
        };
    }

    onTyping(handler: (userId: string) => void): () => void {
        this.typingHandlers.push(handler);
        return () => {
            this.typingHandlers = this.typingHandlers.filter(h => h !== handler);
        };
    }

    async sendMessage(req: FormData): Promise<SendMessageResponse> {
        // Преобразуем FormData в объект, который можно отправить через WebSocket
        const messageData: Record<string, any> = {
            chatId: req.get('chatId'),
            recipientId: req.get('recipientId'),
            content: req.get('content')
        };

        // Обрабатываем файлы отдельно
        const files = req.getAll('attachments') as File[];
        if (files.length > 0) {
            messageData.attachments = await Promise.all(
                files.map(async (file) => ({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: await this.fileToBase64(file)
                }))
            );
        }

        if (!this.socket?.connected || this.currentConversationId !== messageData.chatId) {
            try {
                await this.connect(messageData.chatId as string);
            } catch (err) {
                console.error('Connect failed:', err);
                throw err;
            }
        }

        return new Promise((resolve, reject) => {
            if (!this.socket) {
                reject(new Error('Socket not initialized'));
                return;
            }

            this.socket.emit('send-message', messageData, (response: SendMessageResponse) => {
                if (response?.id) {
                    resolve(response);
                } else {
                    const errorMsg = response?.message || 'Invalid server response';
                    reject(new Error(errorMsg));
                }
            });

            this.socket.on('error', reject);
            this.socket.on('disconnect', () => reject(new Error('Socket disconnected')));
        });
    }

    private fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async sendReaction(req: SendReactionRequest): Promise<SendMessageResponse> {

        return new Promise((resolve, reject) => {
            if (!this.socket) {
                console.error('Socket not initialized after connect');
                reject(new Error('Socket not initialized'));
                return;
            }

            this.socket.emit('send-reaction', {
                messageId: req.messageId,
                reactions: req.reactions,
            }, (response: SendMessageResponse) => {
                console.log('Socket callback received', response); // Это не вызывается?
                if (response?.id) {
                    resolve(response);
                } else {
                    const errorMsg = response?.message || 'Invalid server response';
                    console.error('Error in callback:', errorMsg);
                    reject(new Error(errorMsg));
                }
            });

            // Добавьте обработчики для отладки
            this.socket.on('error', (err) => {
                console.error('Socket error:', err);
                reject(err);
            });

            this.socket.on('disconnect', () => {
                console.error('Socket disconnected during operation');
                reject(new Error('Socket disconnected'));
            });
        });
    }

    async markAsReadMessages(req: MarkAsReadMessagesRequest): Promise<string[]> {
        return new Promise((resolve, reject) => {
            if (!this.socket) {
                console.error('Socket not initialized after connect');
                reject(new Error('Socket not initialized'));
                return;
            }

            this.socket.emit('mark-as-read', {
                chatId: req.chatId,
                messageIds: req.messageIds,
            }, (response: string[]) => {
                console.log('Socket callback received', response); // Это не вызывается?
                if (response) {
                    resolve(response);
                } else {
                    const errorMsg = response?.message || 'Invalid server response';
                    console.error('Error in callback:', errorMsg);
                    reject(new Error(errorMsg));
                }
            });

            // Добавьте обработчики для отладки
            this.socket.on('error', (err) => {
                console.error('Socket error:', err);
                reject(err);
            });

            this.socket.on('disconnect', () => {
                console.error('Socket disconnected during operation');
                reject(new Error('Socket disconnected'));
            });
        });
    }

    async typing(chatId: string): Promise<void> {
        if (!this.socket?.connected) {
            throw new Error('Socket not connected');
        }
        this.socket!.emit('send-typing', {chatId});
    }

    async editMessage(messageId: string, content: string): Promise<void> {
        if (!this.socket?.connected) {
            throw new Error('Socket not connected');
        }

        return new Promise((resolve, reject) => {
            this.socket!.emit('edit-message', {
                messageId,
                content
            }, (response: { success: boolean; message?: string }) => {
                if (response.success) {
                    resolve();
                } else {
                    reject(new Error(response.message));
                }
            });
        });
    }

    async deleteMessage(messageId: string): Promise<void> {
        if (!this.socket?.connected) {
            throw new Error('Socket not connected');
        }

        return new Promise((resolve, reject) => {
            this.socket!.emit('delete-message', { messageId }, (response: { success: boolean; message?: string }) => {
                if (response.success) {
                    resolve();
                } else {
                    reject(new Error(response.message));
                }
            });
        });
    }

    async sendNewMessage(req: SendMessageRequest): Promise<SendMessageResponse> {
        return await httpClient.post(`${this.baseUrl}/messages`, req)
    }

    async getMessages({ chatId, query, offset, limit }: GetMessagesByChatIdRequest & PaginationParams): Promise<BaseResponse<Message>> {
        return httpClient.get(`${this.baseUrl}/messages/${chatId}`, {
            params: {
                query,
                offset,
                limit
            }
        });
    }
}