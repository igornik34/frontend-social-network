export interface EditCommentRequest {
    id: string
    postId: string
    parentId: string | null
    content: string
}