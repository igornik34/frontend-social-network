import {AuthUser} from "../../../auth/types/models/AuthUser.ts";

export interface FollowBase extends Pick<AuthUser, 'id' | 'firstName' | 'lastName' | 'avatar' | 'email' | 'lastseen' | 'online'> {}