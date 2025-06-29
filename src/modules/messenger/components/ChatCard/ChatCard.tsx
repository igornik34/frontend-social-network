import {
    Avatar,
    Group,
    Text,
    Badge,
    Stack, Indicator, Card,
} from '@mantine/core';
import {Chat} from "../../types/models/Chat.ts";
import {useAuth} from "../../../auth/context/AuthContext.tsx";
import {Link} from "react-router-dom";
import {API_URL} from "../../../../constants.ts";
import {formatDistanceToNow} from "date-fns";
import {ru} from "date-fns/locale";

interface Props {
    chat: Chat
}

export function ChatCard({ chat }: Props) {
    const {authData} = useAuth()

    // Получаем собеседника
    const otherParticipant = chat.participants.find(p => p.id !== authData?.id) || chat.participants[0];

    // Формируем имя
    const fullName = `${otherParticipant.firstName} ${otherParticipant.lastName}`;

    const lastMessage = chat.lastMessage;

    return (
        <Link to={`/messenger/${chat.id}`} style={{textDecoration: 'none'}}>
            <Card
                shadow="sm"
                p="md"
                radius="md"
                withBorder
            >
                <Group>
                    {/* Аватар */}
                    <Link to={`/users/${otherParticipant.id}`}>
                        <Indicator zIndex={100} offset={5} position="bottom-end" disabled={!otherParticipant.online} size={15} withBorder>
                            <Avatar
                                src={`${API_URL}${otherParticipant.avatar}`}
                                alt={fullName}
                                radius="xl"
                                size="lg"
                            />
                        </Indicator>
                    </Link>

                    <Stack gap={2} flex={1}>
                        {/* Имя собеседника */}
                        <Text fw={500}>{fullName}</Text>

                        {/* Последнее сообщение */}
                        <Group justify={'space-between'}>
                            <Group gap={'xs'}>
                                <Text c="dimmed" size="sm" truncate>
                                    {authData?.id === lastMessage.senderId && 'Вы:'} {lastMessage?.content ? lastMessage.content.startsWith('CALL') ? `${lastMessage.content.split(' ')[3] === 'audio' ? 'Аудиозвонок' : 'Видеозвонок'}` : lastMessage.content : `${lastMessage.attachments.length} вложений`}
                                </Text>

                                <Text fw={500}>-</Text>
                                {/* Время и статус прочтения */}
                                <Group gap="xs">
                                    <Text size="xs" c="dimmed">
                                        {formatDistanceToNow(new Date(lastMessage.createdAt), {
                                            addSuffix: true,
                                            locale: ru
                                        })}
                                    </Text>
                                </Group>
                            </Group>
                            {(!lastMessage.read && authData?.id !== lastMessage.senderId) && (
                                <Badge circle c={'black'} color={'white'} title="Не прочитано">{chat.unreadCount}</Badge>
                            )}
                        </Group>
                    </Stack>
                </Group>
            </Card>
        </Link>
    );
};