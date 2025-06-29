import {api} from "../../../shared/api/api.ts";
import {FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {PaginationParams} from "../../../shared/types/PaginationParams.ts";
import {BaseResponse} from "../../../shared/types/BaseResponse.ts";
import {UsersRepo} from "./repo/UsersRepo.ts";
import {User} from "../types/models/User.ts";
import {loadUserState, updateUser} from "../../auth/slice/AuthSlice.ts";
import {AUTH_KEY_LS} from "../../auth/constants.ts";

const usersRepo = new UsersRepo()

export const usersApi = api.injectEndpoints({
    endpoints: build => ({
        searchUsers: build.infiniteQuery<BaseResponse<User>, string, PaginationParams>({
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
                    const res = await usersRepo.search({...params.pageParam, query: params.queryArg})
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
        updateProfile: build.mutation<User, FormData>({
            queryFn: async (req) => {
                try {
                    const res = await usersRepo.update(req)
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
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data: user } = await queryFulfilled;

                    dispatch(
                        usersApi.util.updateQueryData(
                            'getUserById',
                            user.id,
                            (draft) => {
                                draft.firstName = user.firstName
                                draft.lastName = user.lastName
                                draft.avatar = user.avatar
                                draft.bio = user.bio
                            }
                        )
                    );

                    dispatch(updateUser(user))
                } catch {
                    // Ошибка уже обработана в queryFn
                }
            }
        }),
        getUserById: build.query<User, string>({
            queryFn: async (id) => {
                try {
                    const res = await usersRepo.getById(id)
                    return {data: res}
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
    useGetUserByIdQuery,
    useLazyGetUserByIdQuery,
    useUpdateProfileMutation,
    useSearchUsersInfiniteQuery,
} = usersApi