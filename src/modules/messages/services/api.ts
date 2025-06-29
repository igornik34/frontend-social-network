// api/chatApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {api} from "../../../shared/api/api.ts";
import {MessagesRepo} from "./repo/MessagesRepo.ts";
import {SendMessageRequest} from "../types/requests/SendMessageRequest.ts";
import {BaseResponse} from "../../../shared/types/BaseResponse.ts";
import {Chat} from "../../messenger/types/models/Chat.ts";
import {PaginationParams} from "../../../shared/types/PaginationParams.ts";
import {FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {GetMessagesByChatIdRequest} from "../types/requests/GetMessagesByChatIdRequest.ts";
import {Message} from "../types/models/Message.ts";
import {SendMessageResponse} from "../types/responses/SendMessageResponse.ts";
import {SendReactionRequest} from "../types/requests/SendReactionRequest.ts";
import {MarkAsReadMessagesRequest} from "../types/requests/MarkAsReadMessagesRequest.ts";

const messagesRepo = new MessagesRepo();

export const messagesApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getMessages: builder.infiniteQuery<BaseResponse<Message>, GetMessagesByChatIdRequest, PaginationParams>({
            infiniteQueryOptions: {
                initialPageParam: {
                    offset: 0,
                    limit: 100
                },
                getNextPageParam: (
                    lastPage,
                    allPages,
                    lastPageParam,
                ) => {
                    const nextOffset = lastPageParam.offset + lastPageParam.limit
                    const remainingItems = lastPage?.total - nextOffset

                    if (remainingItems <= 0) {
                        return undefined
                    }

                    return {
                        ...lastPageParam,
                        offset: nextOffset,
                    }
                },
                getPreviousPageParam: (
                    firstPage,
                    allPages,
                    firstPageParam,
                ) => {
                    const prevOffset = firstPageParam.offset - firstPageParam.limit
                    if (prevOffset < 0) return undefined

                    return {
                        ...firstPageParam,
                        offset: firstPageParam.offset - firstPageParam.limit,
                    }
                },
            },
            queryFn: async (params) => {
                try {
                    const res = await messagesRepo.getMessages({...params.pageParam, ...params.queryArg})
                    return {data: res}
                } catch (error) {
                    return {
                        error: {
                            status: 'CUSTOM_ERROR',
                            data: error && typeof error === 'object' && 'message' in error ? error.message : 'Неизвестная ошибка',
                        } as FetchBaseQueryError,
                    };
                }
            },
            async onCacheEntryAdded(
                { chatId },
                { cacheDataLoaded, updateCachedData, cacheEntryRemoved }
            ) {
                // Создаём WebSocket соединение при подписке
                try {
                    await cacheDataLoaded;

                    await messagesRepo.connect(chatId);

                    // Подписываемся на новые сообщения
                    messagesRepo.onMessage((message: Message) => {
                        console.log('hello')
                        updateCachedData((draft) => {
                            if (draft.pages.length > 0) {
                                // увеличиваем лимит страницы, чтобы влез пост
                                draft.pageParams[0].limit += 1
                                draft.pages[0].data.unshift(message);
                            } else {
                                draft.pageParams = [{
                                    limit: 5,
                                    offset: 0
                                }]
                                draft.pages = [{
                                    data: [message],
                                    total: 1
                                }]
                            }
                        });
                    });

                    // Подписываемся на новые сообщения
                    messagesRepo.onReaction((message: Message) => {
                        console.log('hello')
                        updateCachedData((draft) => {
                            for (const page of draft.pages) {
                                const index = page.data.findIndex(p => p.id === message.id);
                                if (index !== -1) {
                                    page.data[index].reactions = message.reactions
                                    break;
                                }
                            }
                        });
                    });

                    messagesRepo.onMarkMessages((messageIds: string[]) => {
                        updateCachedData((draft) => {
                            const messageIdsSet = new Set(messageIds);
                            let remaining = messageIds.length;

                            for (const page of draft.pages) {
                                for (const message of page.data) {
                                    if (messageIdsSet.has(message.id)) {
                                        message.read = true;
                                        remaining--;

                                        // Если все сообщения найдены, выходим раньше
                                        if (remaining === 0) return;
                                    }
                                }
                            }
                        });
                    });

                    await cacheEntryRemoved;
                    messagesRepo.disconnect();
                } catch {
                    // Ошибка подключения - нет действий
                }
            },
        }),

        getIsTyping: builder.query<{isTyping: boolean, userId: string | null}, void>({
            queryFn: () => {
                const res = {
                    isTyping: false,
                    userId: null
                }
                return {data: res}
            },
            async onCacheEntryAdded(
                _,
                { cacheDataLoaded, updateCachedData, cacheEntryRemoved }
            ) {
                try {
                    await cacheDataLoaded;

                    let typingTimer: NodeJS.Timeout | null = null;
                    const TYPING_DURATION = 3000; // 3 секунды

                    const handleTyping = (userId: string) => {
                        // Обновляем состояние на "печатает"
                        updateCachedData((draft) => {
                            draft.isTyping = true;
                            draft.userId = userId
                        });

                        // Сбрасываем предыдущий таймер, если он был
                        if (typingTimer) {
                            clearTimeout(typingTimer);
                        }

                        // Устанавливаем новый таймер для сброса состояния
                        typingTimer = setTimeout(() => {
                            updateCachedData((draft) => {
                                draft.isTyping = false;
                                draft.userId = userId
                            });
                            typingTimer = null;
                        }, TYPING_DURATION);
                    };

                    // Подписываемся на событие набора текста
                    const sub = messagesRepo.onTyping(handleTyping);

                    await cacheEntryRemoved;

                    // Очищаем таймер при отписке
                    if (typingTimer) {
                        clearTimeout(typingTimer);
                    }
                    // Отписываемся от события
                    sub()
                } catch {
                    // Ошибка подключения - нет действий
                }
            },
        }),

        sendMessage: builder.mutation<SendMessageResponse, FormData>({
            queryFn: async (req) => {
                try {
                    const id = await messagesRepo.sendMessage(req);
                    console.log(id)
                    return { data: id };
                } catch (error) {
                    return {
                        error: {
                            status: 'CUSTOM_ERROR',
                            data: error && typeof error === 'object' && 'message' in error ? error.message : 'Неизвестная ошибка',
                        } as FetchBaseQueryError,
                    };
                }
            },
        }),

        sendReaction: builder.mutation<SendMessageResponse, SendReactionRequest>({
            queryFn: async (req) => {
                try {
                    const id = await messagesRepo.sendReaction(req);
                    console.log(id)
                    return { data: id };
                } catch (error) {
                    return {
                        error: {
                            status: 'CUSTOM_ERROR',
                            data: error && typeof error === 'object' && 'message' in error ? error.message : 'Неизвестная ошибка',
                        } as FetchBaseQueryError,
                    };
                }
            },
        }),

        sendTyping: builder.mutation<void, string>({
            queryFn: async (req) => {
                try {
                    const id = await messagesRepo.typing(req);
                    return { data: id };
                } catch (error) {
                    return {
                        error: {
                            status: 'CUSTOM_ERROR',
                            data: error && typeof error === 'object' && 'message' in error ? error.message : 'Неизвестная ошибка',
                        } as FetchBaseQueryError,
                    };
                }
            },
        }),

        markMessages: builder.mutation<string[], MarkAsReadMessagesRequest>({
            queryFn: async (req) => {
                try {
                    const id = await messagesRepo.markAsReadMessages(req);
                    console.log(id)
                    return { data: id };
                } catch (error) {
                    return {
                        error: {
                            status: 'CUSTOM_ERROR',
                            data: error && typeof error === 'object' && 'message' in error ? error.message : 'Неизвестная ошибка',
                        } as FetchBaseQueryError,
                    };
                }
            },


        }),

        sendNewMessage: builder.mutation<SendMessageResponse, SendMessageRequest>({
            queryFn: async ({  content, recipientId }) => {
                try {
                    const message = await messagesRepo.sendNewMessage({
                        recipientId,
                        content,
                    });
                    console.log(message)
                    return { data: message };
                } catch (error) {
                    return {
                        error: {
                            status: 'CUSTOM_ERROR',
                            data: error && typeof error === 'object' && 'message' in error ? error.message : 'Неизвестная ошибка',
                        } as FetchBaseQueryError,
                    };
                }
            },
        }),
    }),
});

export const {
    useGetMessagesInfiniteQuery,
    useSendNewMessageMutation,
    useSendMessageMutation,
    useSendReactionMutation,
    useMarkMessagesMutation,
    useSendTypingMutation,
    useGetIsTypingQuery
} = messagesApi;