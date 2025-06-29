import { AppShell, NavLink, ScrollArea, Stack, Avatar, Divider, Box, Text, Group, Badge } from '@mantine/core';
import { FaHome, FaUserFriends, FaBell, FaEnvelope, FaSignOutAlt } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from "../../../auth/context/AuthContext.tsx";
import {API_URL} from "../../../../constants.ts";
import {useGetUnreadCountNotificationsQuery} from "../../../notifications/services/api.ts";
import {useGetUnreadCountMessagesQuery} from "../../../messenger/services/api.ts";

const navData = [
    { label: 'Лента', icon: <FaHome size={16} />, link: '/feed' },
    { label: 'Пользователи', icon: <FaUserFriends size={16} />, link: '/users' },
    { label: 'Подписки', icon: <FaUserFriends size={16} />, link: '/followings' },
    { label: 'Подписчики', icon: <FaUserFriends size={16} />, link: '/followers' },
    { label: 'Мессенджер', icon: <FaEnvelope size={16} />, link: '/messenger' },
    { label: 'Уведомления', icon: <FaBell size={16} />, link: '/notifications' },
];

interface Props {
    mobileOpened: boolean
    onCloseMobile: () => void
}

export function Navbar({mobileOpened, onCloseMobile}: Props) {
    const location = useLocation();
    const { authData, handleLogout } = useAuth();

    // Запросы для получения количества непрочитанных сообщений и уведомлений
    const {data: unreadMessagesCount} = useGetUnreadCountMessagesQuery()
    const {data: unreadNotificationsCount} = useGetUnreadCountNotificationsQuery()

    // Добавляем бейджи к соответствующим пунктам меню
    const enhancedNavData = navData.map(item => {
        if (item.link === '/messenger' && (unreadMessagesCount?.count.length || 0) > 0) {
            return {
                ...item,
                rightSection: (
                    <Badge
                        circle
                        size="xs"
                        variant="filled"
                        color="red"
                        w={18}
                        h={18}
                        p={0}
                    >
                        {(unreadMessagesCount?.count.length || 0) > 9 ? '9+' : (unreadMessagesCount?.count.length || 0)}
                    </Badge>
                )
            };
        }

        if (item.link === '/notifications' && (unreadNotificationsCount?.count || 0) > 0) {
            return {
                ...item,
                rightSection: (
                    <Badge
                        circle
                        size="xs"
                        variant="filled"
                        color="red"
                        w={18}
                        h={18}
                        p={0}
                    >
                        {(unreadNotificationsCount?.count || 0) > 9 ? '9+' : (unreadNotificationsCount?.count || 0)}
                    </Badge>
                )
            };
        }

        return item;
    });

    return (
        <>
            <AppShell.Section grow component={ScrollArea} p={'md'}>
                <Stack gap={4} mt="md">
                    {enhancedNavData.map((item) => (
                        <NavLink
                            key={item.label}
                            component={Link}
                            to={item.link}
                            label={item.label}
                            leftSection={item.icon}
                            rightSection={item.rightSection}
                            active={location.pathname.startsWith(item.link)}
                            variant="filled"
                            styles={{
                                root: {
                                    borderRadius: 'var(--mantine-radius-md)',
                                },
                                label: {
                                    flexGrow: 1,
                                },
                                rightSection: {
                                    marginLeft: 'auto',
                                }
                            }}
                            onClick={() => mobileOpened && onCloseMobile()}
                        />
                    ))}
                </Stack>
            </AppShell.Section>

            <AppShell.Section p="md">
                <Divider mb="md" />
                <Stack>
                    <Group>
                        <Avatar
                            src={`${API_URL}${authData?.avatar}`}
                            radius="xl"
                            size="md"
                            component={Link}
                            to={`/users/${authData?.id}`}
                        />
                        <Text fw={500} truncate>{authData?.firstName} {authData?.lastName}</Text>
                    </Group>
                    <NavLink
                        component="button"
                        onClick={handleLogout}
                        label="Выйти"
                        leftSection={<FaSignOutAlt size={16} />}
                        variant="filled"
                        c="red"
                    />
                </Stack>
            </AppShell.Section>
        </>
    );
}