import {api} from "../../../shared/api/api.ts";
import {FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {PaginationParams} from "../../../shared/types/PaginationParams.ts";
import {BaseResponse} from "../../../shared/types/BaseResponse.ts";
import {NotificationsRepo} from "./repo/NotificationsRepo.ts";
import {Post} from "../../feed/types/models/Post.ts";
import {UserNotification} from "../types/models/UserNotification.ts";
import {MarkAsReadMessagesRequest} from "../../messages/types/requests/MarkAsReadMessagesRequest.ts";
import {usersApi} from "../../users/services/api.ts";

const notificationsRepo = new NotificationsRepo()

export const notificationsApi = api.injectEndpoints({
    endpoints: build => ({
        getNotifications: build.infiniteQuery<BaseResponse<UserNotification>, void, PaginationParams>({
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
                    const res = await notificationsRepo.getNotifications(params.pageParam)
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
        markNotifications: build.mutation<string[], string[]>({
            queryFn: async (req) => {
                try {
                    const ids = await notificationsRepo.markAsView(req);
                    return { data: ids };
                } catch (error) {
                    return {
                        error: {
                            status: 'CUSTOM_ERROR',
                            data: error && typeof error === 'object' && 'message' in error ? error.message : 'Неизвестная ошибка',
                        } as FetchBaseQueryError,
                    };
                }
            },
            async onQueryStarted(ids, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;

                    dispatch(
                        notificationsApi.util.updateQueryData(
                            'getUnreadCountNotifications',
                            undefined,
                            (draft) => {
                                draft.count -= ids.length
                            }
                        )
                    );

                    dispatch(
                        notificationsApi.util.updateQueryData(
                            'getNotifications',
                            undefined,
                            (draft) => {
                                const messageIdsSet = new Set(ids);
                                let remaining = ids.length;

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
                            }
                        )
                    )
                } catch {
                    // Ошибка уже обработана в queryFn
                }
            }
        }),
        getUnreadCountNotifications: build.query<{count: number}, void>({
            queryFn: async () => {
                try {
                    const count = await notificationsRepo.getCountUnreadNotifications();
                    return {
                        data: {
                            count
                        }
                    };
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
    })
})

export const {
    useGetNotificationsInfiniteQuery,
    useMarkNotificationsMutation,
    useGetUnreadCountNotificationsQuery
} = notificationsApi