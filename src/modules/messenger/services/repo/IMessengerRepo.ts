import {BaseResponse} from "../../../../shared/types/BaseResponse.ts";
import {Chat} from "../../types/models/Chat.ts";
import {PaginationParams} from "../../../../shared/types/PaginationParams.ts";

export interface IMessengerRepo {
    getChats(req: PaginationParams & {query: string}): Promise<BaseResponse<Chat>>
    getChatById(id: string): Promise<Omit<Chat, 'lastMessage'>>
}