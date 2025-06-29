import {PaginationParams} from "../../../../shared/types/PaginationParams.ts";

export interface GetFollowingRequest extends PaginationParams {
    userId: string
    query?: string
}