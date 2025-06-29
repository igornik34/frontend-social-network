import {
    Box,
    Divider,
    Paper,
    ScrollArea,
    Skeleton,
    Text,
    Avatar,
    Group,
    Stack,
    Indicator,
    BackgroundImage, Transition
} from "@mantine/core";
import {useGetChatByIdQuery} from "../../services/api.ts";
import {MessagesList} from "../../../messages/components/MessageList/MessageList.tsx";
import {MessageInput} from "../../../messages/components/MessageInput/MessageInput.tsx";
import {useAuth} from "../../../auth/context/AuthContext.tsx";
import {Link} from "react-router-dom";
import {API_URL} from "../../../../constants.ts";
import {formatDistanceToNow} from "date-fns";
import {ru} from "date-fns/locale";
import {CallButton} from "../../../calls/components/CallButton/CallButton.tsx";
import {FaPhone, FaVideo} from "react-icons/fa6";
import {useGetIsTypingQuery, useSendTypingMutation} from "../../../messages/services/api.ts";
import {useDebouncedCallback} from "@mantine/hooks";

interface Props {
    chatId: string
}

export function ChatContainer({chatId}: Props) {
    const {authData} = useAuth()
    const { data: chatData, isLoading: isChatLoading } = useGetChatByIdQuery(chatId!);
    const [triggerTyping] = useSendTypingMutation();
    const {data: typingData} = useGetIsTypingQuery()

    const debouncedTrigger = useDebouncedCallback(() => {
        triggerTyping(chatData!.id)
    }, 300)

    // Находим участника чата (исключая текущего пользователя)
    const participant = chatData?.participants.find(user => user.id !== authData?.id);

    if (isChatLoading) {
        return (
            <Paper withBorder radius="md" p="md" style={{ height: "100%" }}>
                <Skeleton height="80%" mb="md" />
                <Skeleton height={100} />
            </Paper>
        );
    }

    if (!chatData || !participant) {
        return (
            <Paper withBorder radius="md" p="md" style={{ height: "100%" }}>
                <Text c="dimmed" ta="center" py="xl">
                    Чат не найден
                </Text>
            </Paper>
        );
    }

    return (
        <Paper
            withBorder
            radius="md"
            p="md"
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
            <Stack>
                {/* Информация об участнике чата */}
                <Group justify={'space-between'}>
                    <Group gap="sm">
                        <Link to={`/users/${participant.id}`}>
                            <Indicator zIndex={100} offset={5} position="bottom-end" disabled={!participant.online} size={15} withBorder>
                                <Avatar
                                    src={`${API_URL}${participant.avatar}`}
                                    radius="xl"
                                    size="md"
                                />
                            </Indicator>
                        </Link>
                        <Group>
                            <Text size="md" fw={500}>
                                {participant.firstName} {participant.lastName}
                            </Text>
                            {
                                !participant.online && (
                                    <Text size="xs" c="dimmed">
                                        {formatDistanceToNow(new Date(participant.lastseen), {
                                            addSuffix: true,
                                            locale: ru
                                        })}
                                    </Text>
                                )
                            }
                        </Group>
                    </Group>

                    <Transition
                        mounted={typingData?.isTyping && typingData.userId !== authData?.id}
                        transition="scale"
                        duration={200}
                        timingFunction="ease"
                    >
                        {(transitionStyle) => (
                            <Text size="md" fw={500} c={'indigo'} style={transitionStyle}>
                                печатает...
                            </Text>
                        )}
                    </Transition>

                    <Group gap={'xl'}>
                        <CallButton
                            avatar={participant.avatar}
                            icon={<FaPhone size={18} />}
                            callType={'audio'}
                            recipientId={participant.id}
                            recipientName={`${participant.firstName} ${participant.lastName}`}
                            isOnline={participant.online}
                        />
                        <CallButton
                            avatar={participant.avatar}
                            icon={ <FaVideo size={18} />}
                            callType={'video'}
                            recipientId={participant.id}
                            recipientName={`${participant.firstName} ${participant.lastName}`}
                            isOnline={participant.online}
                        />
                    </Group>
                </Group>

                <Divider />

                <Box style={{ flex: 1, overflow: "hidden", position: 'relative' }}>
                    <MessagesList chatId={chatId} />
                </Box>

                <MessageInput
                    onTyping={debouncedTrigger}
                    parentId={null}
                    chatId={chatId}
                    recipientId={participant.id}
                />
            </Stack>
        </Paper>
    );
}