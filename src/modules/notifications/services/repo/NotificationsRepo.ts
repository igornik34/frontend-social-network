import {INotificationsRepo} from "./INotificationsRepo.ts";
import {PaginationParams} from "../../../../shared/types/PaginationParams.ts";
import {BaseResponse} from "../../../../shared/types/BaseResponse.ts";
import {httpClient} from "../../../../shared/utils/httpClient.ts";
import {API_URL} from "../../../../constants.ts";
import {UserNotification} from "../../types/models/UserNotification.ts";

export class NotificationsRepo implements INotificationsRepo {
    async getNotifications(params: PaginationParams): Promise<BaseResponse<UserNotification>> {
        return await httpClient.get(`${API_URL}/notifications?limit=${params.limit}&offset=${params.offset}`)
    }
    async markAsView(ids: string[]): Promise<string[]> {
        return await httpClient.post(`${API_URL}/notifications`, {
            ids
        })
    }
    async getCountUnreadNotifications(): Promise<number> {
        return await httpClient.get(`${API_URL}/notifications/count`)
    }
}