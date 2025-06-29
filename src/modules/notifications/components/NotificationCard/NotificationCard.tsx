import { memo } from 'react';
import {
    Card,
    Text,
    Group,
    Avatar,
    Indicator,
    Stack,
    Box,
    Badge
} from '@mantine/core';
import {
    FaHeart as LikeIcon,
    FaUserPlus as FollowerIcon,
    FaComment as CommentIcon,
    FaReply as ReplyIcon,
    FaEnvelope as MessageIcon,
    FaUsers as ChatInviteIcon,
    FaBell as SystemIcon,
    FaRegCheckCircle as ReadIcon
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import {UserNotification} from "../../types/models/UserNotification.ts";
import {API_URL} from "../../../../constants.ts";
import {Link} from "react-router-dom";
import {NotificationIcon} from "../NotificationIcon.tsx";
import {getNotificationText} from "../../utils/getNotificationText.ts";

interface NotificationProps {
    notification: UserNotification
}

export const NotificationCard = memo(function NotificationCard({ notification }: NotificationProps) {
    const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
        addSuffix: true,
        locale: ru
    });

    return (
        <Card
            withBorder
            radius="md"
            p="sm"
            mb="xs"
        >
            <Group align="flex-start" gap="sm" wrap="nowrap">
                <Link to={`/users/${notification.user.id}`}>
                    <Avatar
                        src={`${API_URL}${notification.user.avatar}`}
                        alt={notification.user.firstName}
                        radius="xl"
                        size="md"
                    />
                </Link>

                <Stack gap={2} style={{ flex: 1 }}>
                    <Group gap="xs" align="center">
                        <NotificationIcon type={notification.type} />
                        <Text size="sm" fw={500}>
                            {getNotificationText(notification)}
                        </Text>
                    </Group>

                    <Group gap="xs" justify="space-between">
                        <Text size="xs" c="dimmed">
                            {timeAgo}
                        </Text>
                    </Group>
                </Stack>
            </Group>
        </Card>
    );
});