import {api} from "../../../shared/api/api.ts";
import {FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {PaginationParams} from "../../../shared/types/PaginationParams.ts";
import {CommentsRepo} from "./repo/CommentsRepo.ts";
import {CreateCommentRequest} from "../types/requests/CreateCommentRequest.ts";
import {EditCommentRequest} from "../types/requests/EditCommentRequest.ts";
import {feedApi} from "../../feed/services/api.ts";
import {DeleteCommentRequest} from "../types/requests/DeleteCommentRequest.ts";
import {CommentUser} from "../types/models/CommentUser.ts";
import {BaseResponse} from "../../../shared/types/BaseResponse.ts";

const commentsRepo = new CommentsRepo()

export const commentsApi = api.injectEndpoints({
    endpoints: build => ({
        getCommentsByPostId: build.infiniteQuery<BaseResponse<CommentUser>, { id: string, parentId: string | null }, PaginationParams>({
            infiniteQueryOptions: {
                initialPageParam: {
                    offset: 0,
                    limit: 5,
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
            queryFn: async (req) => {
                try {
                    const res = await commentsRepo.getCommentsByPostId({...req.queryArg, ...req.pageParam})
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
        createComment: build.mutation<CommentUser, CreateCommentRequest>({
            queryFn: async (req) => {
                try {
                    const res = await commentsRepo.createComment(req)
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
            async onQueryStarted(_, { dispatch, queryFulfilled, getState, getCacheEntry }) {
                console.log("START")
                try {
                    const { data: newComment } = await queryFulfilled;
                    console.log(getCacheEntry())

                    // Добавляем в первую страницу
                    dispatch(
                        commentsApi.util.updateQueryData(
                            'getCommentsByPostId',
                            {id: newComment.postId, parentId: newComment.parentId},
                            (draft) => {
                                if (draft.pages.length > 0) {
                                    // увеличиваем лимит страницы, чтобы влез пост
                                    draft.pageParams[0].limit += 1
                                    draft.pages[0].data.unshift(newComment);
                                } else {
                                    draft.pageParams = [{
                                        limit: 5,
                                        offset: 0
                                    }]
                                    draft.pages = [{
                                        data: [newComment],
                                        total: 1
                                    }]
                                }
                            }
                        )
                    );

                    dispatch(
                        commentsApi.util.updateQueryData(
                            'getCommentsByPostId',
                            {id: newComment.postId, parentId: null},
                            (draft) => {
                                for (const page of draft.pages) {
                                    const index = page.data.findIndex(p => p.id === newComment.parentId);
                                    if (index !== -1) {
                                        page.data[index].repliesCount += 1;
                                        break;
                                    }
                                }
                            }
                        )
                    );

                    dispatch(
                        feedApi.util.updateQueryData(
                            'getPosts',
                            undefined,
                            (draft) => {
                                for (const page of draft.pages) {
                                    const index = page.data.findIndex(p => p.id === newComment.postId);
                                    if (index !== -1) {
                                        page.data[index].commentsCount += 1
                                    }
                                }
                            }
                        )
                    );
                } catch(e) {
                    console.error(e)
                    // Ошибка уже обработана в queryFn
                }
            }
        }),
        editComment: build.mutation<CommentUser, EditCommentRequest>({
            queryFn: async (req) => {
                try {
                    const res = await commentsRepo.editComment(req)
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
                console.log("START")
                try {
                    const { data: newComment } = await queryFulfilled;

                    dispatch(
                        commentsApi.util.updateQueryData(
                            'getCommentsByPostId',
                            {id: newComment.postId, parentId: newComment.parentId},
                            (draft) => {
                                for (const page of draft.pages) {
                                    const index = page.data.findIndex(p => p.id === newComment.id);
                                    if (index !== -1) {
                                        page.data[index] = newComment
                                    }
                                }
                            }
                        )
                    );
                } catch(e) {
                    console.error(e)
                    // Ошибка уже обработана в queryFn
                }
            }
        }),
        deleteComment: build.mutation<string, DeleteCommentRequest>({
            queryFn: async (req) => {
                try {
                    const res = await commentsRepo.deleteComment(req)
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
            async onQueryStarted(req, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;

                    dispatch(
                        commentsApi.util.updateQueryData(
                            'getCommentsByPostId',
                            {id: req.postId, parentId: req.parentId},
                            (draft) => {
                                for (const page of draft.pages) {
                                    const index = page.data.findIndex(p => p.id === req.commentId);
                                    if (index !== -1) {
                                        page.data.splice(index, 1);
                                        break;
                                    }
                                }
                            }
                        )
                    );

                    dispatch(
                        feedApi.util.updateQueryData(
                            'getPosts',
                            undefined,
                            (draft) => {
                                for (const page of draft.pages) {
                                    const index = page.data.findIndex(p => p.id === req.postId);
                                    if (index !== -1) {
                                        page.data[index].commentsCount -= 1
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
    })
})

export const {
    useCreateCommentMutation,
    useDeleteCommentMutation,
    useEditCommentMutation,
    useGetCommentsByPostIdInfiniteQuery
} = commentsApi