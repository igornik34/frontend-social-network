import {api} from "../../../shared/api/api.ts";
import {FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {LikesRepo} from "./repo/LikesRepo.ts";
import {feedApi} from "../../feed/services/api.ts";
import {PostCacheManager} from "../../feed/services/postCacheManager.ts";

const likesRepo = new LikesRepo()

export const likesApi = api.injectEndpoints({
    endpoints: build => ({
        like: build.mutation<string, string>({
            queryFn: async (id) => {
                try {
                    const res = await likesRepo.like(id)
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
            async onQueryStarted(postId, { dispatch, queryFulfilled, getState }) {
                const updateFn = (post: any) => ({
                    ...post,
                    likesCount: post.likesCount + 1,
                    likedByUser: true
                });

                // Обновляем все кэши
                PostCacheManager.updatePostInAllCaches(
                    postId,
                    updateFn,
                    dispatch,
                    getState
                );

                try {
                    await queryFulfilled;
                } catch {
                    // RTK Query автоматически откатит изменения при ошибке
                }
            }
        }),
        unlike: build.mutation<string, string>({
            queryFn: async (id) => {
                try {
                    const res = await likesRepo.unlike(id)
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
            async onQueryStarted(postId, { dispatch, queryFulfilled, getState }) {
                const updateFn = (post: any) => ({
                    ...post,
                    likesCount: post.likesCount - 1,
                    likedByUser: false
                });

                // Обновляем все кэши
                PostCacheManager.updatePostInAllCaches(
                    postId,
                    updateFn,
                    dispatch,
                    getState
                );

                try {
                    await queryFulfilled;
                } catch {
                    // RTK Query автоматически откатит изменения при ошибке
                }
            }
        }),
    })
})

export const {
    useLikeMutation,
    useUnlikeMutation
} = likesApi