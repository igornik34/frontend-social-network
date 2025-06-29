import {IFeedRepo} from "./IFeedRepo.ts";
import {httpClient} from "../../../../shared/utils/httpClient.ts";
import {API_URL} from "../../../../constants.ts";
import {PaginationParams} from "../../../../shared/types/PaginationParams.ts";
import {Post} from "../../types/models/Post.ts";
import {CommentUser} from "../../../comments/types/models/CommentUser.ts";
import {BaseResponse} from "../../../../shared/types/BaseResponse.ts";
import {GetPostsByUserRequest} from "../../types/requests/GetPostsByUserRequest.ts";

export class FeedRepo implements IFeedRepo {
    async getPosts(params: PaginationParams): Promise<BaseResponse<Post>> {
        return await httpClient.get(`${API_URL}/posts/feed?limit=${params.limit}&offset=${params.offset}`)
    }
    async getPostsByUserId(req: GetPostsByUserRequest): Promise<BaseResponse<Post>> {
        return await httpClient.get(`${API_URL}/posts/by-user/${req.userId}?limit=${req.limit}&offset=${req.offset}`)
    }
    async createPost(req: FormData): Promise<Post> {
        return await httpClient.post(`${API_URL}/posts`, req)
    }
    async updatePost(req: FormData): Promise<Post> {
        return await httpClient.put(`${API_URL}/posts/${req.get('id')}`, req)
    }
    async deletePost(id: string): Promise<string> {
        return await httpClient.delete(`${API_URL}/posts/${id}`)
    }
    async getMyPosts(params: PaginationParams): Promise<Post[]> {
        return await httpClient.get(`${API_URL}/posts/my/all?limit=${params.limit}&offset=${params.offset}`)
    }
    async getPostById(id: string): Promise<Post> {
        return await httpClient.get(`${API_URL}/posts/${id}`)
    }
    async getLikesByPostId(req: PaginationParams & {id: string}): Promise<Post> {
        return await httpClient.get(`${API_URL}/posts/${req.id}/likes?limit=${req.limit}&offset=${req.offset}`)
    }
}