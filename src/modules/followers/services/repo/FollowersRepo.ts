import {IFollowersRepo} from "./IFollowersRepo.ts";
import {GetFollowersRequest} from "../../types/requests/GetFollowersRequest.ts";
import {BaseResponse} from "../../../../shared/types/BaseResponse.ts";
import {Follower} from "../../types/models/Follower.ts";
import {GetFollowingRequest} from "../../types/requests/GetFollowingRequest.ts";
import {Following} from "../../types/models/Following.ts";
import {httpClient} from "../../../../shared/utils/httpClient.ts";
import {API_URL} from "../../../../constants.ts";
import {PaginationParams} from "../../../../shared/types/PaginationParams.ts";

export class FollowersRepo implements IFollowersRepo{
    async getFollowers({limit, offset, query, userId}: GetFollowersRequest): Promise<BaseResponse<Follower>> {
        return await httpClient.get(`${API_URL}/followers/followers/${userId}`, {
            params: {
                limit,
                offset,
                query
            }
        })
    }
    async getFollowing({limit, offset, userId, query}: GetFollowingRequest): Promise<BaseResponse<Following>> {
        return await httpClient.get(`${API_URL}/followers/following/${userId}`, {
            params: {
                limit,
                offset,
                query
            }
        })
    }
    async follow(id: string): Promise<true> {
        return await httpClient.post(`${API_URL}/followers/${id}`)
    }
    async unfollow(id: string): Promise<true> {
        return await httpClient.delete(`${API_URL}/followers/${id}`)
    }
}