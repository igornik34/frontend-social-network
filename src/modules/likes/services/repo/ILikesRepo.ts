export interface ILikesRepo {
    like(id: string): Promise<string>
    unlike(id: string): Promise<string>
}