import {ActionIcon, Flex, Textarea} from "@mantine/core";
import {FiSend} from "react-icons/fi";
import {isNotEmpty, useField} from "@mantine/form";
import {useCreateCommentMutation} from "../../services/api.ts";

interface Props {
    parentId: string | null
    postId: string
}

export function WriteComment({postId, parentId}: Props) {
    const content = useField<string>({
        initialValue: '',
        validate: isNotEmpty('Поле обязательно')
    });
    console.log("PARENT", parentId)
    const [create, {isLoading}] = useCreateCommentMutation()
    const handleAddComment = () => {
        create({
            parentId,
            postId,
            content: content.getValue().trim()
        })
    }

    return (
        <Flex gap="sm" mt="sm" align="flex-end">
            <Textarea
                placeholder="Написать комментарий..."
                style={{ flex: 1 }}
                autosize
                minRows={1}
                maxRows={4}
                {...content.getInputProps()}
            />
            <ActionIcon
                variant="subtle"
                color="blue"
                size="lg"
                onClick={handleAddComment}
                disabled={isLoading}
            >
                <FiSend size={20} />
            </ActionIcon>
        </Flex>
    )
}