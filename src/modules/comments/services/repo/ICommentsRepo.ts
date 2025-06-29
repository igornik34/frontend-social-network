import {CreateCommentRequest} from "../../types/requests/CreateCommentRequest.ts";
import {EditCommentRequest} from "../../types/requests/EditCommentRequest.ts";
import {ReplyCommentRequest} from "../../types/requests/ReplyCommentRequest.ts";
import {DeleteCommentRequest} from "../../types/requests/DeleteCommentRequest.ts";
import {CommentUser} from "../../types/models/CommentUser.ts";
import {PaginationParams} from "../../../../shared/types/PaginationParams.ts";
import {BaseResponse} from "../../../../shared/types/BaseResponse.ts";

export interface ICommentsRepo {
    createComment(req: CreateCommentRequest): Promise<CommentUser>
    editComment(req: EditCommentRequest): Promise<CommentUser>
    deleteComment(req: DeleteCommentRequest): Promise<string>
    getCommentsByPostId(req: PaginationParams & {id: string, parentId: string | null}): Promise<BaseResponse<CommentUser>>
}