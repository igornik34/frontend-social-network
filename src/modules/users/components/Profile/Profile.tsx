import {
    Avatar,
    Text,
    Group,
    Card,
    Stack,
    Title,
    Divider,
    Badge,
    Skeleton, Center, ActionIcon, Button, Indicator,
} from '@mantine/core';
import {format, formatDistanceToNow} from 'date-fns';
import { ru } from 'date-fns/locale';
import {useGetUserByIdQuery} from "../../services/api.ts";
import {CiCalendar, CiUser} from "react-icons/ci";
import {MdAlternateEmail} from "react-icons/md";
import {EditProfileFormModal} from "../EditProfileModal/EditProfileFormModal.tsx";
import {useDisclosure} from "@mantine/hooks";
import {BiEdit, BiMessageRounded} from "react-icons/bi";
import {useAuth} from "../../../auth/context/AuthContext.tsx";
import {useFollowMutation, useUnfollowMutation} from "../../../followers/services/api.ts";
import {useNavigate} from "react-router-dom";
import {ModalNewMessage} from "../../../messages/components/ModalNewMessage/ModalNewMesssage.tsx";
import {API_URL} from "../../../../constants.ts";
import {IoPersonAdd, IoPersonRemove} from "react-icons/io5";

interface Props {
    id: string;
}

export function Profile({ id }: Props) {
    const navigate = useNavigate()
    const {authData} = useAuth()
    const [opened, {toggle}] = useDisclosure(false)
    const [openedModalNewMessage, {toggle: toggleModalNewMessage}] = useDisclosure(false)
    const { data: user, isLoading, isError } = useGetUserByIdQuery(id);
    const [follow, {isLoading: isLoadingFollow}] = useFollowMutation()
    const [unfollow, {isLoading: isLoadingUnfollow}] = useUnfollowMutation()

    if (isLoading) {
        return (
            <Card withBorder radius="md" p="xl" mx="auto">
                <Stack>
                    <Skeleton height={120} circle mb="xl" />
                    <Skeleton height={20} width="60%" />
                    <Skeleton height={16} width="80%" />
                    <Skeleton height={16} width="40%" mt="md" />
                    <Skeleton height={16} width="70%" />
                </Stack>
            </Card>
        );
    }

    if (isError || !user) {
        return (
            <Card withBorder radius="md" p="xl" maw={600} mx="auto">
                <Center>
                    <Text c="red">
                        Ошибка загрузки профиля
                    </Text>
                </Center>
            </Card>
        );
    }

    const fullName = `${user.firstName} ${user.lastName}`;
    const joinDate = format(new Date(user.createdAt), 'dd MMMM yyyy', { locale: ru });
    const updateDate = format(new Date(user.updatedAt), 'dd MMMM yyyy', { locale: ru });

    const handleFollow = () => {
        if(user.isFollowing) {
            unfollow(user.id)
        } else {
            follow(user.id)
        }
    };

    const handleSendMessage = () => {
        if(user.chatId) {
            navigate(`/messenger/${user.chatId}`)
        } else {
            toggleModalNewMessage()
        }
    }

    return (
        <Card withBorder radius="md" p="xl" mx="auto">
            <Stack>
                {
                    authData?.id === user.id && (
                        <ActionIcon
                            variant="subtle"
                            color="blue"
                            size="xl"
                            onClick={toggle}
                            ml={'auto'}
                        >
                            <BiEdit size={20}/>
                        </ActionIcon>
                    )
                }
                <Group justify={'center'}>
                    <Indicator zIndex={100} offset={5} position="bottom-end" disabled={!user.online} size={15} withBorder>
                        <Avatar
                            src={`${API_URL}${user.avatar}`}
                            radius="xl"
                            size="xl"
                        />
                    </Indicator>
                </Group>

                <Group justify={'center'}>
                    <Title order={2}>{fullName}</Title>
                    {
                        !user.online && (
                            <Badge
                                color={user.online ? 'teal' : 'gray'}
                                variant="light"
                                size="lg"
                            >
                                {formatDistanceToNow(new Date(user.lastseen), {
                                    addSuffix: true,
                                    locale: ru
                                })}
                            </Badge>
                        )
                    }
                </Group>

                {/* Action buttons */}
                {authData?.id !== user.id && (
                    <Group justify="center" gap="sm">
                        <Button
                            variant={user.isFollowing ? 'default' : 'filled'}
                            color={user.isFollowing ? 'gray' : 'indigo'}
                            leftSection={
                                user.isFollowing ? (
                                    <IoPersonRemove size={18} />
                                ) : (
                                    <IoPersonAdd size={18} />
                                )
                            }
                            onClick={handleFollow}
                            loading={isLoadingFollow || isLoadingUnfollow}
                            radius="xl"
                        >
                            { user.isFollowing ? 'Вы подписаны' : 'Подписаться'}
                        </Button>

                        <Button
                            variant="light"
                            color="green"
                            leftSection={<BiMessageRounded size={18} />}
                            onClick={handleSendMessage}
                            radius="xl"
                        >
                            Сообщение
                        </Button>
                    </Group>
                )}
            </Stack>

            <Divider my="md" />

            {
                authData?.id === user.id && (
                    <Group gap="xs" mb="xs">
                        <MdAlternateEmail  size={18} color="gray" />
                        <Text c="dimmed">{user.email}</Text>
                    </Group>
                )
            }

            <Group gap="xs" mb="xs">
                <CiUser  size={18} color="gray" />
                <Text c="dimmed">Подписчики: {user.followersCount}</Text>
            </Group>

            <Group gap="xs" mb="xs">
                <CiUser  size={18} color="gray" />
                <Text c="dimmed">Подписки: {user.followingCount}</Text>
            </Group>

            {
                authData?.id === user.id && (
                    <>
                        <Group gap="xs" mb="xs">
                            <CiCalendar  size={18} color="gray" />
                            <Text c="dimmed">Зарегистрирован: {joinDate}</Text>
                        </Group>

                        <Group gap="xs" mb="md">
                            <CiCalendar  size={18} color="gray" />
                            <Text c="dimmed">Обновлён: {updateDate}</Text>
                        </Group>
                    </>
                )
            }

            {user.bio && (
                <>
                    <Divider my="md" label="О себе" labelPosition="center" />
                    <Group gap="xs">
                        {/*<IconBio size={18} color="gray" />*/}
                        <Text>{user.bio}</Text>
                    </Group>
                </>
            )}
            <EditProfileFormModal opened={opened} onClose={toggle} />
            {
                authData?.id !== user.id && (
                    <ModalNewMessage opened={openedModalNewMessage} onClose={toggleModalNewMessage} recipientId={user.id} />
                )
            }
        </Card>
    );
}