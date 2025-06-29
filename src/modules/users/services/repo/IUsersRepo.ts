import {SearchUsersRequest} from "../../types/requests/SearchUsersRequest.ts";
import {BaseResponse} from "../../../../shared/types/BaseResponse.ts";
import {User} from "../../types/models/User.ts";

export interface IUsersRepo {
    search(req: SearchUsersRequest): Promise<BaseResponse<User>>
    getById(id: string): Promise<User>
    update(req: FormData): Promise<User>
}