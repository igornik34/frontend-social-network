import {
    TextInput,
    Textarea,
    Box,
    Group,
    Avatar,
    ActionIcon,
    Center,
    useMantineTheme
} from "@mantine/core";
import { useProfileFormContext } from "./profileFormContext.ts";
import { useRef, useState } from "react";
import {BiEdit} from "react-icons/bi";
import {MdDelete} from "react-icons/md";

export function ProfileForm() {
    const form = useProfileFormContext();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const theme = useMantineTheme();
    const [preview, setPreview] = useState<string | null>();

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setPreview(reader.result as string);
                form.setFieldValue('avatar', file)
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveAvatar = () => {
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        form.setFieldValue('avatar', null)
    };

    return (
        <Box>
            <Center mb="xl">
                <Box style={{ position: 'relative' }}>
                    <Avatar
                        src={preview}
                        size={120}
                        radius="50%"
                        color={theme.primaryColor}
                    />
                    <ActionIcon
                        size="lg"
                        radius="xl"
                        variant="filled"
                        color={theme.primaryColor}
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            boxShadow: theme.shadows.sm,
                        }}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <BiEdit />
                    </ActionIcon>
                    {preview && (
                        <ActionIcon
                            size="lg"
                            radius="xl"
                            variant="filled"
                            color="red"
                            style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                boxShadow: theme.shadows.sm,
                            }}
                            onClick={handleRemoveAvatar}
                        >
                            <MdDelete />
                        </ActionIcon>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />
                </Box>
            </Center>

            <TextInput
                label="Имя"
                placeholder="Введите ваше имя"
                {...form.getInputProps('firstName')}
                required
            />

            <TextInput
                label="Фамилия"
                placeholder="Введите вашу фамилию"
                {...form.getInputProps('lastName')}
                mt="md"
                required
            />

            <Textarea
                label="О себе"
                placeholder="Расскажите о себе"
                {...form.getInputProps('bio')}
                mt="md"
                autosize
                minRows={3}
            />
        </Box>
    );
}