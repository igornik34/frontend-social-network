import {PaginationParams} from "../../../../shared/types/PaginationParams.ts";

export interface GetFollowersRequest extends PaginationParams {
    userId: string
    query?: string
}