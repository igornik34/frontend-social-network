import {AuthUser} from "../../../auth/types/models/AuthUser.ts";
import {FollowBase} from "./FollowBase.ts";

export interface Following extends FollowBase {
    followsYou: boolean
}