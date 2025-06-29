import { Card, Text, Group, Avatar, ActionIcon, Box, Popover, Tooltip, HoverCard, Stack } from '@mantine/core';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Message } from "../../types/models/Message.ts";
import { useAuth } from "../../../auth/context/AuthContext.tsx";
import { useState } from 'react';
import { useSendReactionMutation } from "../../services/api.ts";
import { IoCheckmarkDoneSharp, IoCheckmarkOutline } from "react-icons/io5";
import Masonry from 'react-masonry-css';
import {API_URL} from "../../../../constants.ts";
import { Image } from '@mantine/core';
import {breakpointCols} from "../../../../shared/utils/breakpointCols.ts";

interface Props {
    message: Message;
}

const quickReactions = ['👍', '👎', '❤️', '😂', '😮', '😢', '👏'];

export const CardMessage = ({ message }: Props) => {
    const { authData } = useAuth();
    const [addReaction] = useSendReactionMutation();
    const [openedImage, setOpenedImage] = useState<string | null>(null);

    const isCurrentUser = message.senderId === authData?.id;
    const createdAt = new Date(message.createdAt);

    // Подсчет количества каждой реакции
    const reactionCounts = message.reactions?.reduce((acc, emoji) => {
        acc[emoji] = (acc[emoji] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const handleReactionClick = async (emoji: string) => {
        try {
            await addReaction({
                messageId: message.id,
                reactions: [...message.reactions, emoji]
            }).unwrap();
        } catch (err) {
            console.error('Failed to update reaction:', err);
        }
    };

    const openImageModal = (imageUrl: string) => {
        setOpenedImage(imageUrl);
    };

    const closeImageModal = () => {
        setOpenedImage(null);
    };

    return (
        <HoverCard radius={'xl'} position={message.senderId === authData?.id ? 'left-end' : 'right-end'} positionDependencies={[message, authData]} openDelay={1000}>
            <HoverCard.Target>
                <Box
                    style={{
                        marginLeft: isCurrentUser ? 'auto' : 0,
                        marginRight: isCurrentUser ? 0 : 'auto',
                        minWidth: '15%',
                        maxWidth: '75%',
                        position: 'relative',
                        width: 'fit-content'
                    }}
                >
                    <Card
                        shadow="sm"
                        px="md"
                        py={'xs'}
                        radius="lg"
                        style={{
                            background: ''
                        }}
                    >
                        {message.attachments.length > 0 && (
                            <Card.Section>
                                <Masonry
                                    breakpointCols={breakpointCols(message.attachments.length)}
                                    className="my-masonry-grid"
                                    columnClassName="my-masonry-grid_column"
                                >
                                    {message.attachments.map((image, index) => (
                                        <Box
                                            key={index}
                                            style={{
                                                marginBottom: 8,
                                                cursor: 'pointer',
                                                maxWidth: '500px'
                                            }}
                                            mx={'auto'}
                                            onClick={() => openImageModal(`${API_URL}${image}`)}
                                        >
                                            <Image
                                                src={`${API_URL}${image}`}
                                                alt={`Message image ${index + 1}`}
                                                radius="sm"
                                                style={{
                                                    width: '100%',
                                                    height: 'auto',
                                                    display: 'block'
                                                }}
                                            />
                                        </Box>
                                    ))}
                                </Masonry>
                            </Card.Section>
                        )}

                        <Text size="md">
                            {message.content}
                        </Text>

                        <Card.Section p={'xs'}>
                            <Group align={'center'}>
                                {reactionCounts && Object.keys(reactionCounts).length > 0 && (
                                    <Group gap={4}>
                                        {Object.entries(reactionCounts).map(([emoji, count]) => (
                                            <Tooltip
                                                key={emoji}
                                                label={`${count} реакций`}
                                                withArrow
                                                position="top"
                                            >
                                                <Box
                                                    bg={'var(--mantine-color-gray-0)'}
                                                    px={6}
                                                    py={2}
                                                    style={{
                                                        borderRadius: 20,
                                                        border: '1px solid var(--mantine-color-gray-2)',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => handleReactionClick(emoji)}
                                                >
                                                    <Text size="xs">
                                                        {emoji} {count > 1 ? count : ''}
                                                    </Text>
                                                </Box>
                                            </Tooltip>
                                        ))}
                                    </Group>
                                )}
                                <Group ml={'auto'} gap={'xs'}>
                                    <Text size="md" c="dimmed">
                                        {format(createdAt, 'HH:mm', { locale: ru })}
                                    </Text>
                                    {
                                        isCurrentUser ? (
                                            message.read ? <IoCheckmarkDoneSharp size={20} /> : <IoCheckmarkOutline size={20}/>
                                        ) : null
                                    }
                                </Group>
                            </Group>
                        </Card.Section>
                    </Card>
                </Box>
            </HoverCard.Target>
            <HoverCard.Dropdown>
                <Stack gap={4}>
                    {quickReactions.map(emoji => (
                        <ActionIcon variant={'transparent'} key={emoji} onClick={() => handleReactionClick(emoji)}>
                            {emoji}
                        </ActionIcon>
                    ))}
                </Stack>
            </HoverCard.Dropdown>

            {/* Модальное окно для просмотра изображения */}
            {openedImage && (
                <Box
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onClick={closeImageModal}
                >
                    <Image
                        src={openedImage}
                        style={{
                            maxWidth: '90%',
                            maxHeight: '90%',
                            objectFit: 'contain'
                        }}
                    />
                </Box>
            )}
        </HoverCard>
    );
};