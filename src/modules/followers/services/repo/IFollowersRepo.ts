import {BaseResponse} from "../../../../shared/types/BaseResponse.ts";
import {Follower} from "../../types/models/Follower.ts";
import {Following} from "../../types/models/Following.ts";
import {GetFollowersRequest} from "../../types/requests/GetFollowersRequest.ts";
import {GetFollowingRequest} from "../../types/requests/GetFollowingRequest.ts";

export interface IFollowersRepo {
    getFollowers(req: GetFollowersRequest): Promise<BaseResponse<Follower>>
    getFollowing(req: GetFollowingRequest): Promise<BaseResponse<Following>>
    follow(id: string): Promise<true>
    unfollow(id: string): Promise<true>
}