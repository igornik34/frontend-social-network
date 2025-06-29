import {ICommentsRepo} from "./ICommentsRepo.ts";
import {CreateCommentRequest} from "../../types/requests/CreateCommentRequest.ts";
import {EditCommentRequest} from "../../types/requests/EditCommentRequest.ts";
import {ReplyCommentRequest} from "../../types/requests/ReplyCommentRequest.ts";
import {httpClient} from "../../../../shared/utils/httpClient.ts";
import {API_URL} from "../../../../constants.ts";
import {DeleteCommentRequest} from "../../types/requests/DeleteCommentRequest.ts";
import {CommentUser} from "../../types/models/CommentUser.ts";
import {PaginationParams} from "../../../../shared/types/PaginationParams.ts";
import {BaseResponse} from "../../../../shared/types/BaseResponse.ts";

export class CommentsRepo implements ICommentsRepo {
    async createComment(req: CreateCommentRequest): Promise<CommentUser> {
        return await httpClient.post(`${API_URL}/comments`, req)
    }
    async editComment(req: EditCommentRequest): Promise<CommentUser> {
        return await httpClient.put(`${API_URL}/comments/${req.id}`, req)
    }
    async deleteComment(req: DeleteCommentRequest): Promise<string> {
        return await httpClient.delete(`${API_URL}/comments/${req.commentId}`)
    }
    async getCommentsByPostId(req: PaginationParams & {id: string, parentId: string | null}): Promise<BaseResponse<CommentUser>> {
        if(req.parentId) {
            return await httpClient.get(`${API_URL}/comments/${req.id}/${req.parentId}?limit=${req.limit}&offset=${req.offset}`)
        } else {
            return await httpClient.get(`${API_URL}/comments/${req.id}?limit=${req.limit}&offset=${req.offset}`)
        }
    }
}