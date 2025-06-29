import { ActionIcon, Flex, Textarea, Popover, Box, Text, Group, Tooltip, Loader, FileButton, Notification } from "@mantine/core";
import { FiMic, FiSend, FiSmile, FiStopCircle, FiPaperclip, FiX } from "react-icons/fi";
import { isNotEmpty, useField } from "@mantine/form";
import { useSendMessageMutation } from "../../services/api.ts";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { useEffect, useRef, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { showNotification } from "@mantine/notifications";

interface Props {
    parentId: string | null;
    chatId: string;
    recipientId: string;
    onTyping: () => void
}

interface Attachment {
    file: File;
    preview: string;
}

const MAX_ATTACHMENTS = 10;

export function MessageInput({ chatId, parentId, recipientId, onTyping }: Props) {
    const content = useField<string>({
        initialValue: '',
        validate: isNotEmpty('Message cannot be empty')
    });

    const [opened, setOpened] = useState(false);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [create, { isLoading }] = useSendMessageMutation();

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    useEffect(() => {
        if (transcript) {
            content.setValue(transcript);
        }
    }, [transcript]);

    const startRecording = () => {
        SpeechRecognition.startListening({ continuous: true, language: 'ru-RU' });
    };

    const stopRecording = () => {
        SpeechRecognition.stopListening();
    };

    const handleFileChange = (files: File[]) => {
        if (!files || files.length === 0) return;

        // Проверяем, не превысим ли мы лимит
        const remainingSlots = MAX_ATTACHMENTS - attachments.length;
        if (remainingSlots <= 0) {
            showNotification({
                title: 'Лимит вложений',
                message: `Максимальное количество вложений - ${MAX_ATTACHMENTS}`,
                color: 'red',
            });
            return;
        }

        // Берем только столько файлов, сколько осталось слотов
        const filesToAdd = files.slice(0, remainingSlots);

        const newAttachments = filesToAdd.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        setAttachments(prev => [...prev, ...newAttachments]);

        // Уведомление, если не все файлы были добавлены
        if (files.length > remainingSlots) {
            showNotification({
                title: 'Не все файлы добавлены',
                message: `Добавлено ${remainingSlots} из ${files.length} файлов. Максимум - ${MAX_ATTACHMENTS}`,
                color: 'yellow',
            });
        }
    };

    const removeAttachment = (index: number) => {
        const newAttachments = [...attachments];
        URL.revokeObjectURL(newAttachments[index].preview);
        newAttachments.splice(index, 1);
        setAttachments(newAttachments);
    };

    const handleSendMessage = async () => {
        const messageContent = content.getValue().trim();

        if (messageContent || attachments.length > 0) {
            try {
                const formData = new FormData();
                formData.append('chatId', chatId);
                formData.append('recipientId', recipientId);
                formData.append('content', messageContent);

                attachments.forEach((attachment) => {
                    formData.append(`attachments`, attachment.file);
                });

                await create(formData).unwrap();

                // Очистка после отправки
                content.reset();
                setAttachments([]);
                resetTranscript();
                stopRecording();
            } catch (error) {
                console.error('Failed to send message:', error);
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        const emoji = emojiData.emoji;
        const textarea = textareaRef.current;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const value = content.getValue();
            content.setValue(
                value.substring(0, start) + emoji + value.substring(end)
            );
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
                textarea.focus();
            }, 0);
        }
        setOpened(false);
    };

    useEffect(() => {
        return () => {
            // Очистка object URLs при размонтировании
            attachments.forEach(attachment => {
                URL.revokeObjectURL(attachment.preview);
            });
        };
    }, [attachments]);

    if (!browserSupportsSpeechRecognition) {
        return (
            <Box>
                <Text c="red" size="sm">
                    Ваш браузер не поддерживает распознавание речи
                </Text>
                <Textarea
                    placeholder="Напишите сообщение..."
                    {...content.getInputProps()}
                />
            </Box>
        );
    }

    return (
        <Box>
            {listening && (
                <Box mb="sm" p="xs" bg="gray.1" style={{ borderRadius: '8px' }}>
                    <Group position="apart">
                        <Group>
                            <Loader size="xs" />
                            <Text size="sm" c="dimmed">Идет запись...</Text>
                        </Group>
                        <Text size="sm">{transcript}</Text>
                    </Group>
                </Box>
            )}

            {attachments.length > 0 && (
                <Box mb="sm" p="xs" bg="gray.1" style={{ borderRadius: '8px' }}>
                    <Group spacing="xs">
                        {attachments.map((attachment, index) => (
                            <Box key={index} pos="relative" style={{ borderRadius: '4px', overflow: 'hidden' }}>
                                <img
                                    src={attachment.preview}
                                    alt={`Attachment ${index}`}
                                    style={{ width: 100, height: 100, objectFit: 'cover' }}
                                />
                                <ActionIcon
                                    size="xs"
                                    variant="filled"
                                    color="red"
                                    pos="absolute"
                                    top={4}
                                    right={4}
                                    onClick={() => removeAttachment(index)}
                                >
                                    <FiX size={12} />
                                </ActionIcon>
                            </Box>
                        ))}
                    </Group>
                    <Text size="xs" c="dimmed" mt={4}>
                        {attachments.length} из {MAX_ATTACHMENTS} файлов
                    </Text>
                </Box>
            )}

            <Flex gap="sm" mt="sm" align="flex-end">
                <Textarea
                    placeholder="Напишите сообщение..."
                    style={{ flex: 1 }}
                    autosize
                    minRows={1}
                    maxRows={4}
                    onKeyDown={handleKeyDown}
                    ref={textareaRef}
                    rightSection={
                        <Flex gap={4}>
                            <Popover
                                opened={opened}
                                onChange={setOpened}
                                position="top-end"
                                withArrow
                                shadow="md"
                            >
                                <Popover.Target>
                                    <ActionIcon
                                        variant="subtle"
                                        color="gray"
                                        onClick={() => setOpened(!opened)}
                                    >
                                        <FiSmile size={20} />
                                    </ActionIcon>
                                </Popover.Target>
                                <Popover.Dropdown p={0}>
                                    <EmojiPicker
                                        theme={'dark'}
                                        onEmojiClick={handleEmojiClick}
                                        width={300}
                                        height={350}
                                        previewConfig={{ showPreview: false }}
                                    />
                                </Popover.Dropdown>
                            </Popover>
                        </Flex>
                    }
                    rightSectionWidth={40}
                    {...content.getInputProps()}
                    onChange={(value) => {
                        content.getInputProps().onChange(value)
                        onTyping()
                    }}
                />
                <Group gap="xs" style={{ alignSelf: 'flex-end' }}>
                    <FileButton
                        onChange={handleFileChange}
                        accept="image/*"
                        multiple
                        disabled={attachments.length >= MAX_ATTACHMENTS}
                    >
                        {(props) => (
                            <Tooltip
                                label={
                                    attachments.length >= MAX_ATTACHMENTS
                                        ? `Максимум ${MAX_ATTACHMENTS} файлов`
                                        : "Прикрепить изображение"
                                }
                            >
                                <div>
                                    <ActionIcon
                                        {...props}
                                        variant="subtle"
                                        color="gray"
                                        size="lg"
                                        disabled={attachments.length >= MAX_ATTACHMENTS}
                                    >
                                        <FiPaperclip size={20} />
                                    </ActionIcon>
                                </div>
                            </Tooltip>
                        )}
                    </FileButton>

                    <Tooltip label={listening ? "Остановить запись" : "Голосовое сообщение"}>
                        <ActionIcon
                            variant={listening ? "filled" : "subtle"}
                            color={listening ? "red" : "gray"}
                            size="lg"
                            onClick={listening ? stopRecording : startRecording}
                        >
                            {listening ? <FiStopCircle size={20} /> : <FiMic size={20} />}
                        </ActionIcon>
                    </Tooltip>

                    <ActionIcon
                        variant="subtle"
                        color="blue"
                        size="lg"
                        onClick={handleSendMessage}
                        loading={isLoading}
                        disabled={!content.getValue().trim() && attachments.length === 0}
                    >
                        <FiSend size={20} />
                    </ActionIcon>
                </Group>
            </Flex>
        </Box>
    );
}