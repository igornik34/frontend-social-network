import {api} from "../../../shared/api/api.ts";
import {FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {PaginationParams} from "../../../shared/types/PaginationParams.ts";
import {BaseResponse} from "../../../shared/types/BaseResponse.ts";
import {MessengerRepo} from "./repo/MessengerRepo.ts";
import {Chat} from "../types/models/Chat.ts";

const messengerRepo = new MessengerRepo()

export const messengerApi = api.injectEndpoints({
    endpoints: build => ({
        getChats: build.infiniteQuery<BaseResponse<Chat>, {query: string}, PaginationParams>({
            infiniteQueryOptions: {
                initialPageParam: {
                    offset: 0,
                    limit: 20
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
                    const res = await messengerRepo.getChats({...params.pageParam, ...params.queryArg})
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
        }),
        getChatById: build.query<Omit<Chat, 'lastMessage'>, string>({
            queryFn: async (id) => {
                try {
                    const res = await messengerRepo.getChatById(id)
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
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;

                    dispatch(
                        messengerApi.util.updateQueryData(
                            'getUnreadCountMessages',
                            undefined,
                            (draft) => {
                                draft.count = draft.count.filter(el => el !== id)
                            }
                        )
                    );

                    dispatch(
                        messengerApi.util.updateQueryData(
                            'getChats',
                            {query: ''},
                            (draft) => {
                                for (const page of draft.pages) {
                                    const index = page.data.findIndex(p => p.id === id);
                                    if (index !== -1) {
                                        page.data[index].unreadCount = 0
                                        page.data[index].lastMessage.read = true
                                    }
                                }
                            }
                        )
                    );
                } catch {
                    // Ошибка уже обработана в queryFn
                }
            }
        }),
        getUnreadCountMessages: build.query<{count: string[]}, void>({
            queryFn: async () => {
                try {
                    const res = await messengerRepo.getUnreadCountMessage()
                    return {data: {count: res}}
                } catch (error) {
                    return {
                        error: {
                            status: 'CUSTOM_ERROR',
                            data: error && typeof error === 'object' && 'message' in error ? error.message : 'Неизвестная ошибка',
                        } as FetchBaseQueryError,
                    };
                }
            }
        }),
    })
})

export const {
    useGetChatsInfiniteQuery,
    useGetChatByIdQuery,
    useGetUnreadCountMessagesQuery
} = messengerApi