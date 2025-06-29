export interface DeleteCommentRequest {
    commentId: string
    parentId: string | null
    postId: string
}