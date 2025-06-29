import { Modal, Stack, Text, Button, Group, Avatar } from '@mantine/core';
import { FaUser, FaPhone, FaPhoneSlash } from 'react-icons/fa';
import {useCallContext} from "../../context/call.context.tsx";
import {API_URL} from "../../../../constants.ts";

export const IncomingCallNotification = () => {
    const { callState, answerCall, endCall, setRecipient } = useCallContext();

    const callerName = callState.incomingCall?.callerName || 'Unknown';
    const callerAvatar = callState.incomingCall?.callerAvatar;
    const callType = callState.incomingCall?.callType;

    const handleAccept = async () => {
        await answerCall();
        setRecipient({
            id: callState.incomingCall?.userId,
            avatar: callerAvatar,
            name: callerName
        })
    };

    const handleReject = () => {
        endCall();
    };

    return (
        <Modal
            opened
            onClose={handleReject}
            withCloseButton={false}
            centered
            padding="lg"
            size="xs"
            styles={{
                content: {
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                },
            }}
        >
            <Stack align="center" gap="xl">
                <Avatar
                    size={80}
                    radius="xl"
                    src={`${API_URL}${callerAvatar}`}
                    alt={callerName}
                />
                <Text ta={'center'} size="lg" fw={500}>
                    Входящий {callType === 'audio' ? 'аудиовызов' : 'видеовызов'} от {callerName}
                </Text>

                <Group gap="xl">
                    <Button color="green" onClick={handleAccept} leftSection={<FaPhone size={14} />} variant="filled">
                        Принять
                    </Button>
                    <Button color="red" onClick={handleReject} leftSection={<FaPhoneSlash size={14} />} variant="filled">
                        Отклонить
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
};