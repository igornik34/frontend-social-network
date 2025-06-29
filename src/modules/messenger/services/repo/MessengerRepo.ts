import {IMessengerRepo} from "./IMessengerRepo.ts";
import {PaginationParams} from "../../../../shared/types/PaginationParams.ts";
import {BaseResponse} from "../../../../shared/types/BaseResponse.ts";
import {Chat} from "../../types/models/Chat.ts";
import {httpClient} from "../../../../shared/utils/httpClient.ts";
import {API_URL} from "../../../../constants.ts";

export class MessengerRepo implements IMessengerRepo {
    async getChats({limit, offset, query}: PaginationParams & {query: string}): Promise<BaseResponse<Chat>> {
        return await httpClient.get(`${API_URL}/chat`, {
            params: {
                limit,
                offset,
                query
            }
        })
    }
    async getChatById(id: string): Promise<Omit<Chat, 'lastMessage'>> {
        return await httpClient.get(`${API_URL}/chat/${id}`)
    }
    async getUnreadCountMessage(): Promise<string[]> {
        return await httpClient.get(`${API_URL}/chat/count/unread`)
    }
}