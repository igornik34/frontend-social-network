import {ActionIcon, Group} from "@mantine/core";
import {MdDelete} from "react-icons/md";
import {BiEdit} from "react-icons/bi";
import {useDeletePostMutation} from "../../services/api.ts";
import {EditPostFormModal} from "../EditPostFormModal/EditPostFormModal.tsx";
import {useDisclosure} from "@mantine/hooks";

interface Props {
    postId: string
}

export function ToolsPost({postId}: Props) {
    const [deletePost, {isLoading: isLoadingDelete}] = useDeletePostMutation()
    const [opened, {toggle}] = useDisclosure(false)
    return (
        <Group>
            <ActionIcon
                variant="subtle"
                color="red"
                size="lg"
                onClick={() => deletePost(postId)}
                disabled={isLoadingDelete}
            >
                <MdDelete />
            </ActionIcon>
            <ActionIcon
                variant="subtle"
                color="blue"
                size="lg"
                onClick={toggle}
            >
                <BiEdit />
            </ActionIcon>
            <EditPostFormModal id={postId} opened={opened} onClose={toggle} />
        </Group>
    )
}