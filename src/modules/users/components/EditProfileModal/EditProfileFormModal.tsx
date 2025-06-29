import { Button, Group, Modal } from "@mantine/core";
import { useUpdateProfileMutation} from "../../services/api.ts";
import { useEffect } from "react";
import {ProfileFormProvider, useProfileForm} from "../ProfileForm/profileFormContext.ts";
import {useAuth} from "../../../auth/context/AuthContext.tsx";
import {UpdateProfileRequest} from "../../types/requests/UpdateProfileRequest.ts";
import {ProfileForm} from "../ProfileForm/ProfileForm.tsx";
import {API_URL} from "../../../../constants.ts";

interface Props {
    opened: boolean
    onClose: () => void
}

// Функция для загрузки изображения по URL и преобразования в File
async function urlToFile(url: string, filename: string): Promise<File> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
}

export function EditProfileFormModal({ opened, onClose }: Props) {
    const {authData} = useAuth()
    const form = useProfileForm({
        initialValues: {
            firstName: '',
            lastName: '',
            bio: '',
            avatar: null
        },
    });

    useEffect(() => {
        if (!authData) return;

        const convertImage = async () => {
            if(!authData.avatar) return null
            try {
                return await urlToFile(`${API_URL}${authData.avatar}`, `image-${Date.now()}.${authData.avatar.split('.').pop()}`)
            } catch (error) {
                console.error("Error converting images:", error);
            }
        };

        (async () => {
            form.setValues({
                firstName: authData.firstName,
                lastName: authData.lastName,
                bio: authData.bio,
                avatar: await convertImage()
            });
        })()
    }, [authData]);

    const [edit, { isLoading }] = useUpdateProfileMutation();

    const handleSubmit = (values: UpdateProfileRequest) => {
        const formData = new FormData();
        formData.append('firstName', values.firstName);
        formData.append('lastName', values.lastName);
        formData.append('bio', values.bio || '');
        formData.append('avatar', values.avatar || '');

        edit(formData)
            .unwrap()
            .then(onClose)
    };

    return (
        <Modal title={'Редактирование профиля'} opened={opened} onClose={onClose}>
            <ProfileFormProvider form={form}>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <ProfileForm />
                    <Group justify={'end'} mt="md">
                        <Button
                            type="submit"
                            loading={isLoading}
                            disabled={!form.isValid() || isLoading}
                        >
                            Сохранить изменения
                        </Button>
                    </Group>
                </form>
            </ProfileFormProvider>
        </Modal>
    );
}