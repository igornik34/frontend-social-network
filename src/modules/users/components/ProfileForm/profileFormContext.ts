import { createFormContext } from '@mantine/form'
import {UpdateProfileRequest} from "../../types/requests/UpdateProfileRequest.ts";

export const [ProfileFormProvider, useProfileFormContext, useProfileForm] =
    createFormContext<UpdateProfileRequest>()