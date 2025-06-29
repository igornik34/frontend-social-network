import {Author} from "../../../auth/types/models/Author.ts";

export type NotificationType =
    'message'|
    'NEW_FOLLOWER' |
    'POST_LIKE' |
    'COMMENT_LIKE' |
    'NEW_COMMENT' |
    'COMMENT_REPLY' |
    'NEW_MESSAGE' |
    'CHAT_INVITE' |
    'SYSTEM'

export interface UserNotification {
    id: string
    userId: string
    recipientId: string
    type: NotificationType
    read: boolean
    createdAt: string
    user: Author
    metadata: string
}