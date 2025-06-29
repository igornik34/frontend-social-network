import {
    Textarea,
    FileInput,
    Box,
    Image,
    SimpleGrid, Text, Stack, Group,
} from "@mantine/core";
import {usePostFormContext} from "./postFormContext.ts";
import {Dropzone, FileWithPath, IMAGE_MIME_TYPE} from "@mantine/dropzone";
import {FaPlus} from "react-icons/fa";

export function PostForm() {
    const form = usePostFormContext();

    const handleLoadImages = (images: File[]) => {
        form.setFieldValue('images', images)
    }

    const previews = form.getValues().images.map((file, index) => {
        const imageUrl = URL.createObjectURL(file);
        return <Image key={index} src={imageUrl} onLoad={() => URL.revokeObjectURL(imageUrl)} />;
    });

    return (
        <Stack>
            <Textarea
                placeholder="Напишите что-нибудь..."
                autosize
                minRows={4}
                maxRows={8}
                {...form.getInputProps("content")}
                required
            />

            <Dropzone accept={IMAGE_MIME_TYPE} onDrop={handleLoadImages}>
                <Group justify={'center'}>
                    <FaPlus />
                    <Text ta="center">Добавьте фото</Text>
                </Group>
            </Dropzone>

            <SimpleGrid cols={{ base: 1, sm: 4 }} mt={previews.length > 0 ? 'xl' : 0}>
                {previews}
            </SimpleGrid>
        </Stack>
    );
}