import {PaginationParams} from "../../../../shared/types/PaginationParams.ts";

export interface SearchUsersRequest extends PaginationParams {
    query?: string
}