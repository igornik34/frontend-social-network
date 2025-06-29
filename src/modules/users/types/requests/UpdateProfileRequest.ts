export interface UpdateProfileRequest {
    firstName: string;
    lastName: string;
    bio: string | null;
    avatar: File | null
}