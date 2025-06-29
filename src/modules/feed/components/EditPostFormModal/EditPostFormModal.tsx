import { PostFormProvider, usePostForm } from "../PostForm/postFormContext.ts";
import { Button, Group, Modal } from "@mantine/core";
import { PostForm } from "../PostForm/PostForm.tsx";
import { useGetPostByIdQuery, useUpdatePostMutation } from "../../services/api.ts";
import { UpdatePostRequest } from "../../types/requests/UpdatePostRequest.ts";
import { useEffect } from "react";

interface Props {
    id: string
    opened: boolean
    onClose: () => void
}

// Функция для загрузки изображения по URL и преобразования в File
async function urlToFile(url: string, filename: string): Promise<File> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
}

export function EditPostFormModal({ id, opened, onClose }: Props) {
    const form = usePostForm({
        initialValues: {
            id: "",
            content: "",
            images: []
        }
    });

    const { data: post, isFetching } = useGetPostByIdQuery(id, {
        skip: !opened
    });

    useEffect(() => {
        if (!post) return;

        const convertImages = async () => {
            try {
                return await Promise.all(
                    post.images.map((url, index) =>
                        urlToFile(url, `image-${index}-${Date.now()}.${url.split('.').pop()}`)
                    )
                );
            } catch (error) {
                console.error("Error converting images:", error);
            }
        };

        (async () => {
            form.setValues({
                id: post.id,
                content: post.content,
                images: await convertImages()
            });
        })()
    }, [post]);

    const [edit, { isLoading }] = useUpdatePostMutation();

    const handleSubmit = (values: UpdatePostRequest) => {
        const formData = new FormData();
        formData.append('id', values.id);
        formData.append('content', values.content);

        // Фильтруем только File объекты (на случай, если конвертация не удалась)
        values.images.forEach((file) => {
            if (file instanceof File) {
                formData.append('images', file);
            }
        });

        edit(formData);
    };

    return (
        <Modal opened={opened} onClose={onClose}>
            <PostFormProvider form={form}>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <PostForm />
                    <Group justify={'end'} mt="md">
                        <Button
                            type="submit"
                            loading={isLoading}
                            disabled={!form.isValid() || isLoading}
                        >
                            Обновить пост
                        </Button>
                    </Group>
                </form>
            </PostFormProvider>
        </Modal>
    );
}