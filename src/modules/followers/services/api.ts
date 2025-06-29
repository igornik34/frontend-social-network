import {api} from "../../../shared/api/api.ts";
import {FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {PaginationParams} from "../../../shared/types/PaginationParams.ts";
import {BaseResponse} from "../../../shared/types/BaseResponse.ts";
import {FollowersRepo} from "./repo/FollowersRepo.ts";
import {Follower} from "../types/models/Follower.ts";
import {Following} from "../types/models/Following.ts";
import {GetFollowersRequest} from "../types/requests/GetFollowersRequest.ts";
import {GetFollowingRequest} from "../types/requests/GetFollowingRequest.ts";
import {updateUser} from "../../auth/slice/AuthSlice.ts";
import {usersApi} from "../../users/services/api.ts";

const followersRepo = new FollowersRepo()

export const followersApi = api.injectEndpoints({
    endpoints: build => ({
        getFollowers: build.infiniteQuery<BaseResponse<Follower>, Pick<GetFollowersRequest, 'userId' | 'query'>, PaginationParams>({
            infiniteQueryOptions: {
                initialPageParam: {
                    offset: 0,
                    limit: 20
                },
                getNextPageParam: (
                    lastPage,
                    _,
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
                    _,
                    __,
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
                    const res = await followersRepo.getFollowers({...params.pageParam, ...params.queryArg})
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
        getFollowings: build.infiniteQuery<BaseResponse<Following>, Pick<GetFollowingRequest, 'userId' | 'query'>, PaginationParams>({
            infiniteQueryOptions: {
                initialPageParam: {
                    offset: 0,
                    limit: 20
                },
                getNextPageParam: (
                    lastPage,
                    _,
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
                    _,
                    __,
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
                    const res = await followersRepo.getFollowing({...params.pageParam, ...params.queryArg})
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
            providesTags: [{type: 'Followings', id: 'LIST'}]
        }),
        follow: build.mutation<true, string>({
            queryFn: async (id) => {
                try {
                    const res = await followersRepo.follow(id)
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
                        usersApi.util.updateQueryData(
                            'getUserById',
                            id,
                            (draft) => {
                                draft.isFollowing = true
                            }
                        )
                    );
                } catch {
                    // Ошибка уже обработана в queryFn
                }
            }
        }),
        unfollow: build.mutation<true, string>({
            queryFn: async (id) => {
                try {
                    const res = await followersRepo.unfollow(id)
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
                        usersApi.util.updateQueryData(
                            'getUserById',
                            id,
                            (draft) => {
                                draft.isFollowing = false
                            }
                        )
                    );
                } catch {
                    // Ошибка уже обработана в queryFn
                }
            }
        }),
    })
})

export const {
    useFollowMutation,
    useGetFollowersInfiniteQuery,
    useGetFollowingsInfiniteQuery,
    useUnfollowMutation
} = followersApi