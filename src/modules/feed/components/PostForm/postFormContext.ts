import { createFormContext } from '@mantine/form'
import {CreatePostRequest} from "../../types/requests/CreatePostRequest.ts";
import {UpdatePostRequest} from "../../types/requests/UpdatePostRequest.ts";

export const [PostFormProvider, usePostFormContext, usePostForm] =
    createFormContext<CreatePostRequest | UpdatePostRequest>()