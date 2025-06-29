import {Author} from "../../../auth/types/models/Author.ts";
import {CommentUser} from "../../../comments/types/models/CommentUser.ts";

export interface Post {
    id: string;
    content: string;
    images: string[];
    authorId: string;
    createdAt: string;
    updatedAt: string;
    author: Author
    comments: CommentUser[]
    likesCount: number
    commentsCount: number
    likedByUser: boolean
}