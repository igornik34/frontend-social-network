import {AppDispatch, RootState} from "../../../app/store/store.ts";
import {feedApi} from "./api.ts";
import {api} from "../../../shared/api/api.ts";

type PostUpdateFn = (post: any) => any;

export class PostCacheManager {
    static updatePostInAllCaches(
        postId: string,
        updateFn: PostUpdateFn,
        dispatch: AppDispatch,
        getState: () => RootState
    ) {
        // 1. Обновляем основную ленту
        this.updatePostsCache('getPosts', undefined, postId, updateFn, dispatch);

        // 2. Обновляем кэш для постов пользователей
        this.updateUserPostsCaches(postId, updateFn, dispatch, getState);

        // 3. Обновляем кэш для страницы поста
        this.updateCache('getPostById', postId, postId, updateFn, dispatch);
    }

    private static updatePostsCache(
        endpointName: string,
        args: any,
        postId: string,
        updateFn: PostUpdateFn,
        dispatch: AppDispatch
    ) {
        try {
            dispatch(
                feedApi.util.updateQueryData(
                    endpointName,
                    args,
                    (draft) => this.updateDraft(draft, postId, updateFn)
                )
            );
        } catch (e) {
            console.warn(`Failed to update ${endpointName} cache`, e);
        }
    }

    private static updateUserPostsCaches(
        postId: string,
        updateFn: PostUpdateFn,
        dispatch: AppDispatch,
        getState: () => RootState
    ) {
        // Получаем состояние RTK Query из хранилища
        const state = getState();
        const queryState = state[api.reducerPath];

        if (!queryState || !queryState.queries) return;

        // Ищем все активные запросы getPostsByUser
        Object.entries(queryState.queries).forEach(([queryKey, queryInfo]) => {
            if (queryKey.startsWith('getPostsByUser(')) {
                try {
                    const argMatch = queryKey.match(/getPostsByUser\((.*)\)/);
                    if (argMatch) {
                        const args = JSON.parse(argMatch[1]);
                        this.updatePostsCache(
                            'getPostsByUser',
                            args,
                            postId,
                            updateFn,
                            dispatch
                        );
                    }
                } catch (e) {
                    console.warn('Failed to parse query key', queryKey, e);
                }
            }
        });
    }

    private static updateCache(
        endpointName: string,
        args: any,
        postId: string,
        updateFn: PostUpdateFn,
        dispatch: AppDispatch
    ) {
        try {
            dispatch(
                feedApi.util.updateQueryData(
                    endpointName,
                    args,
                    (draft) => this.updateDraft(draft, postId, updateFn)
                )
            );
        } catch (e) {
            console.warn(`Failed to update ${endpointName} cache`, e);
        }
    }

    private static updateDraft(draft: any, postId: string, updateFn: PostUpdateFn) {
        if (draft.pages) {
            // Для бесконечных списков
            for (const page of draft.pages) {
                const postIndex = page.data.findIndex((p: any) => p.id === postId);
                if (postIndex !== -1) {
                    if(updateFn(page.data[postIndex])) {
                        page.data[postIndex] = updateFn(page.data[postIndex]);
                        break;
                    } else {
                        page.data = page.data.filter(el => el.id !== postId)
                    }
                }
            }
        } else if (draft.id === postId) {
            // Для единичного поста
            return updateFn(draft);
        }
        return draft;
    }
}