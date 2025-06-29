import {Author} from "../../../auth/types/models/Author.ts";
import {Chat} from "../../../messenger/types/models/Chat.ts";

export interface SendMessageResponse {
    id: string
    content: string
    senderId: string
    recipientId: string
    createdAt: string
    read: boolean
    chatId: string
    sender: Author
    chat: Chat
}