export interface CreateCommentRequest {
    parentId: string | null
    postId: string
    content: string
}