import {SendMessageRequest} from "../../types/requests/SendMessageRequest.ts";
import {SendMessageResponse} from "../../types/responses/SendMessageResponse.ts";

export interface IMessagesRepo {
    sendMessage(req: FormData): Promise<SendMessageResponse>
}