import {memo} from 'react';
import {
    Card,
    Text,
    Group,
    Avatar, Indicator, ActionIcon, rem, Stack,
} from '@mantine/core';
import {Link, useNavigate} from "react-router-dom";
import {API_URL} from "../../../../constants.ts";
import {User} from "../../types/models/User.ts";
import {BiMessageRounded} from "react-icons/bi";
import {IoPersonRemove} from "react-icons/io5";
import {useFollowMutation, useUnfollowMutation} from "../../../followers/services/api.ts";
import {ModalNewMessage} from "../../../messages/components/ModalNewMessage/ModalNewMesssage.tsx";
import {useAuth} from "../../../auth/context/AuthContext.tsx";
import {useDisclosure} from "@mantine/hooks";

interface Props {
    user: User
}

export const UserCard = memo(function UserCard({ user }: Props) {
    const navigate = useNavigate()
    const {authData} = useAuth()
    const [openedModalNewMessage, {toggle: toggleModalNewMessage}] = useDisclosure(false)

    const handleSendMessage = () => {
        if(user.chatId) {
            navigate(`/messenger/${user.chatId}`)
        } else {
            toggleModalNewMessage()
        }
    }
    return (

            <Card withBorder shadow={'xl'} radius="md" p="md" mb="md">
                <Card.Section withBorder p="sm">
                    <Group justify={'space-between'} align={'flex-start'}>
                            <Group>
                                <Link to={`/users/${user.id}`}>
                                    <Indicator zIndex={100} offset={5} position="bottom-end" disabled={!user.online} size={15} withBorder>
                                        <Avatar
                                            src={`${API_URL}${user.avatar}`}
                                            radius="xl"
                                        />
                                    </Indicator>
                                </Link>
                                <Stack gap={0}>
                                    <Text fw={500}>{user.firstName} {user.lastName}</Text>
                                    <Text size={'xs'} c={'dimmed'}>{user.id === authData?.id && 'Ого! Это Вы'}</Text>
                                </Stack>
                            </Group>

                        <Group>
                            <ActionIcon
                                variant="light"
                                color="green"
                                radius="xl"
                                size="lg"
                                aria-label="Написать сообщение"
                                onClick={handleSendMessage}
                            >
                                <BiMessageRounded />
                            </ActionIcon>
                        </Group>
                    </Group>
                </Card.Section>
                {
                    authData?.id !== user.id && (
                        <ModalNewMessage opened={openedModalNewMessage} onClose={toggleModalNewMessage} recipientId={user.id} />
                    )
                }
            </Card>

    );
})