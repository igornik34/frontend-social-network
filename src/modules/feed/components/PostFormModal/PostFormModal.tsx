import {PostFormProvider, usePostForm} from "../PostForm/postFormContext.ts";
import {Button, Group, Modal} from "@mantine/core";
import {PostForm} from "../PostForm/PostForm.tsx";
import {useCreatePostMutation} from "../../services/api.ts";
import {CreatePostRequest} from "../../types/requests/CreatePostRequest.ts";

interface Props {
    opened: boolean
    onClose: () => void
}

export function PostFormModal({opened, onClose}: Props) {
    const form = usePostForm({
        initialValues: {
            content: "",
            images: []
        },
    })

    const [create, {isLoading}] = useCreatePostMutation()
    const handleSubmit = (values: CreatePostRequest) => {
        const formData = new FormData()
        formData.append('content', values.content)
        values.images.forEach((file) => {
            formData.append('images', file);
        });
        create(formData);
    };


    return (
        <Modal opened={opened} onClose={onClose} title={'Новый пост'}>
            <PostFormProvider form={form}>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <PostForm />
                    <Group justify={'end'} mt="md">
                        <Button
                            type="submit"
                            loading={isLoading}
                            disabled={!form.isValid() || isLoading}
                        >
                            Добавить пост
                        </Button>
                    </Group>
                </form>
            </PostFormProvider>
        </Modal>
    )
}