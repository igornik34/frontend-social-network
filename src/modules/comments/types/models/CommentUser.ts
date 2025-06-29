import {Author} from "../../../auth/types/models/Author.ts";

export interface CommentUser {
    id: string
    content: string
    authorId: string
    postId: string
    createdAt: string
    updatedAt: string
    parentId: string | null
    author: Author
    repliesCount: number
    editable: boolean
}