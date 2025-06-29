import {Author} from "../../../auth/types/models/Author.ts";
import {Message} from "../../../messages/types/models/Message.ts";

export interface Chat {
    id: string
    createdAt: string
    updatedAt: string
    participants: Author[]
    lastMessage: Message
    unreadCount: number
}