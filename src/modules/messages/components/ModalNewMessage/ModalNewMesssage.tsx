import {useSendNewMessageMutation} from "../../services/api.ts";
import {isNotEmpty, useField} from "@mantine/form";
import {ActionIcon, Flex, Modal, Textarea} from "@mantine/core";
import {FiSend} from "react-icons/fi";
import {useNavigate} from "react-router-dom";

interface Props {
    opened: boolean
    onClose: () => void
    recipientId: string
}

export function ModalNewMessage({opened, onClose, recipientId}: Props) {
    const navigate = useNavigate()
    const content = useField<string>({
        initialValue: '',
        validate: isNotEmpty('Name cannot be empty')
    });
    const [send, {isLoading}] = useSendNewMessageMutation()
    const handleSendMessage = () => {
        send({
            recipientId,
            content: content.getValue()
        })
            .unwrap()
            .then(data => {
                navigate(`/messenger/${data.chatId}`)
            })
    }

    return (
        <Modal opened={opened} onClose={onClose} title={'Новое сообщение'}>
            <Flex gap="sm" mt="sm" align="flex-end">
                <Textarea
                    placeholder="Напишите сообщение..."
                    style={{ flex: 1 }}
                    autosize
                    minRows={4}
                    maxRows={4}
                    {...content.getInputProps()}
                />
                <ActionIcon
                    variant="subtle"
                    color="blue"
                    size="lg"
                    loading={isLoading}
                    onClick={handleSendMessage}
                >
                    <FiSend size={20} />
                </ActionIcon>
            </Flex>
        </Modal>
    )
}