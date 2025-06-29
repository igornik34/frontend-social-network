import {api} from "../../../shared/api/api.ts";
import {FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {FeedRepo} from "./repo/FeedRepo.ts";
import {PaginationParams} from "../../../shared/types/PaginationParams.ts";
import {Post} from "../types/models/Post.ts";
import {CommentUser} from "../../comments/types/models/CommentUser.ts";
import {BaseResponse} from "../../../shared/types/BaseResponse.ts";
import {GetPostsByUserRequest} from "../types/requests/GetPostsByUserRequest.ts";
import {PostCacheManager} from "./postCacheManager.ts";

const feedRepo = new FeedRepo()

export const feedApi = api.injectEndpoints({
    endpoints: build => ({
        getPosts: build.infiniteQuery<BaseResponse<Post>, void, PaginationParams>({
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
                    const res = await feedRepo.getPosts(params.pageParam)
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
        getPostsByUser: build.infiniteQuery<BaseResponse<Post>, Omit<GetPostsByUserRequest, 'offset' | 'limit'>, PaginationParams>({
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
                    const res = await feedRepo.getPostsByUserId({...params.pageParam, ...params.queryArg})
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
        createPost: build.mutation<Post, FormData>({
            queryFn: async (req) => {
                try {
                    const res = await feedRepo.createPost(req)
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
            async onQueryStarted(_, { dispatch, queryFulfilled, getState }) {
                try {
                    const { data: newPost } = await queryFulfilled;

                    dispatch(
                        feedApi.util.updateQueryData(
                            'getPosts',
                            undefined,
                            (draft) => {
                                if (draft.pages.length > 0) {
                                    // увеличиваем лимит страницы, чтобы влез пост
                                    draft.pageParams[0].limit += 1
                                    draft.pages[0].data.unshift(newPost);
                                } else {
                                    draft.pageParams = [{
                                        limit: 5,
                                        offset: 0
                                    }]
                                    draft.pages = [{
                                        data: [newPost],
                                        total: 1
                                    }]
                                }
                            }
                        )
                    );

                } catch {
                    // Ошибка уже обработана в queryFn
                }
            }
        }),
        updatePost: build.mutation<Post, FormData>({
            queryFn: async (req) => {
                try {
                    const res = await feedRepo.updatePost(req)
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
            async onQueryStarted(req, { dispatch, queryFulfilled, getState }) {
                try {
                    const postId = req.get('id') as string;

                    const { data: updatedPost } = await queryFulfilled;

                    // Обновляем все кэши
                    PostCacheManager.updatePostInAllCaches(
                        postId,
                        () => updatedPost,
                        dispatch,
                        getState
                    );
                } catch {
                    // Ошибка уже обработана в queryFn
                }
            }
        }),
        deletePost: build.mutation<string, string>({
            queryFn: async (id) => {
                try {
                    const res = await feedRepo.deletePost(id)
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
            async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
                try {
                    await queryFulfilled;

                    PostCacheManager.updatePostInAllCaches(
                        id,
                        () => undefined, // Удаляем пост
                        dispatch,
                        getState
                    );
                } catch {
                    // Ошибка уже обработана в queryFn
                }
            }
        }),
        getPostById: build.query<Post, string>({
            queryFn: async (id) => {
                try {
                    const res = await feedRepo.getPostById(id)
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
    useCreatePostMutation,
    useDeletePostMutation,
    useUpdatePostMutation,
    useGetPostByIdQuery,
    useGetPostsByUserInfiniteQuery,
    useGetPostsInfiniteQuery
} = feedApi