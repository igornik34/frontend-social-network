import {AuthUser} from "../../../auth/types/models/AuthUser.ts";
import {FollowBase} from "./FollowBase.ts";

export interface Follower extends FollowBase {
    isFollowing: boolean
}