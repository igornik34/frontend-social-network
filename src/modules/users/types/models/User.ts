export interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    bio: string | null
    avatar: string | null
    createdAt: string
    updatedAt: string
    online: boolean
    lastseen: string
    isFollowing?: boolean;
    followsYou?: boolean;
    followersCount?: number
    followingCount?: number
    chatId: string | null
}
