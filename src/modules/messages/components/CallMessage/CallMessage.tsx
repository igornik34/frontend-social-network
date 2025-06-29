import { Card, Text, Group, Box, Badge } from '@mantine/core';
import { format, formatDuration, intervalToDuration } from 'date-fns';
import { ru } from 'date-fns/locale';
import {Message} from "../../types/models/Message.ts";
import {useAuth} from "../../../auth/context/AuthContext.tsx";

interface CallData {
    startTime: string;
    endTime: string;
    type?: 'audio' | 'video';
}

interface Props {
    message: Message;
}

export const CallMessage = ({ message }: Props) => {
    const {authData} = useAuth()
    const content = message.content
    const isCurrentUser = message.senderId === authData?.id;

    // Парсим данные о звонке из content
    const parseCallData = (content: string): CallData | null => {
        const parts = content.split(' ');
        if (parts.length < 3 || parts[0] !== 'CALL') return null;

        return {
            startTime: parts[1],
            endTime: parts[2],
            type: parts[3] as 'audio' | 'video' || 'audio',
        };
    };

    const callData = parseCallData(content);

    if (!callData) {
        return <Text c="dimmed">Неизвестный формат звонка</Text>;
    }

    // Рассчитываем продолжительность звонка
    const duration = intervalToDuration({
        start: new Date(callData.startTime),
        end: new Date(callData.endTime)
    });

    const formattedDuration = formatDuration(duration, {
        format: ['hours', 'minutes', 'seconds'],
        locale: ru
    });

    const formattedTime = format(new Date(callData.startTime), 'HH:mm, d MMMM yyyy', { locale: ru });

    // Определяем иконку и цвет в зависимости от типа звонка
    const callTypeProps = {
        audio: { icon: '📞', color: 'blue' },
        video: { icon: '📹', color: 'green' }
    };

    return (
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
            >
                <Group position="apart" align="flex-start">
                    <Box>
                        <Text size="lg" fw={500}>
                            {callTypeProps['audio'].icon} {callData.type === 'audio' ? 'Аудиозвонок' : 'Видеозвонок'}
                        </Text>
                        <Text size="sm" c="dimmed">
                            {formattedTime}
                        </Text>
                    </Box>
                </Group>

                <Group mt="md" spacing="xs">
                    <Text size="sm">Длительность:</Text>
                    <Badge color={callTypeProps['audio'].color} variant="light">
                        {formattedDuration || 'Менее секунды'}
                    </Badge>
                </Group>

                {duration.hours === 0 && duration.minutes === 0 && duration.seconds && duration.seconds < 5 && (
                    <Text size="xs" c="red" mt="sm">
                        Короткий звонок
                    </Text>
                )}
            </Card>
        </Box>
    );
};