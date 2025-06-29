import {User} from "../../../users/types/models/User.ts";

export interface AuthUser extends User {
    accessToken: string
    refreshToken: string
}
