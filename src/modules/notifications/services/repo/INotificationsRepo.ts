import {PaginationParams} from "../../../../shared/types/PaginationParams.ts";
import {BaseResponse} from "../../../../shared/types/BaseResponse.ts";
import {UserNotification} from "../../types/models/UserNotification.ts";

export interface INotificationsRepo {
    getNotifications(params: PaginationParams): Promise<BaseResponse<UserNotification>>
}