import {AuthUser} from "./AuthUser.ts";

export type Author = Pick<AuthUser, 'id' | 'firstName' | 'lastName' | 'avatar' | 'online' | 'lastseen'>