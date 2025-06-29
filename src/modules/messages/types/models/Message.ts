import {Author} from "../../../auth/types/models/Author.ts";

export interface Message {
    id: string
    content: string
    senderId: string
    recipientId: string
    createdAt: string
    read: boolean
    chatId: string
    sender: Author
    reactions: string[]
    attachments: string[]
}