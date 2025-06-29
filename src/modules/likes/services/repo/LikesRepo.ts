import {ILikesRepo} from "./ILikesRepo.ts";
import {httpClient} from "../../../../shared/utils/httpClient.ts";
import {API_URL} from "../../../../constants.ts";

export class LikesRepo implements ILikesRepo {
    async like(id: string): Promise<string> {
        return await httpClient.post(`${API_URL}/likes/${id}`)
    }
    async unlike(id: string): Promise<string> {
        return await httpClient.delete(`${API_URL}/likes/${id}`)
    }
}