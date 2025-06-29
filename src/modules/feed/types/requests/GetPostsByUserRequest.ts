import {PaginationParams} from "../../../../shared/types/PaginationParams.ts";

export interface GetPostsByUserRequest extends PaginationParams {
    userId: string
}