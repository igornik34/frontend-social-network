import {IUsersRepo} from "./IUsersRepo.ts";
import {SearchUsersRequest} from "../../types/requests/SearchUsersRequest.ts";
import {BaseResponse} from "../../../../shared/types/BaseResponse.ts";
import {User} from "../../types/models/User.ts";
import {httpClient} from "../../../../shared/utils/httpClient.ts";
import {API_URL} from "../../../../constants.ts";

export class UsersRepo implements IUsersRepo {
    async search({limit, offset, query}: SearchUsersRequest): Promise<BaseResponse<User>> {
        return await httpClient.get(`${API_URL}/users`, {
            params: {
                limit,
                query,
                offset
            }
        })
    }
    async getById(id: string): Promise<User> {
        return await httpClient.get(`${API_URL}/users/${id}`)
    }
    async update(req: FormData): Promise<User> {
        return await httpClient.put(`${API_URL}/users`, req)
    }
}