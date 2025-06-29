import {PaginationParams} from "../../../../shared/types/PaginationParams.ts";
import {Post} from "../../types/models/Post.ts";
import {BaseResponse} from "../../../../shared/types/BaseResponse.ts";
import {GetPostsByUserRequest} from "../../types/requests/GetPostsByUserRequest.ts";

export interface IFeedRepo {
    createPost(req: FormData): Promise<Post>
    updatePost(req: FormData): Promise<Post>
    deletePost(id: string): Promise<string>

    getPosts(params: PaginationParams): Promise<BaseResponse<Post>>
    getPostsByUserId(req: GetPostsByUserRequest): Promise<BaseResponse<Post>>
    getPostById(id: string): Promise<Post>
    getLikesByPostId(req: PaginationParams & {id: string}): Promise<Post>
}