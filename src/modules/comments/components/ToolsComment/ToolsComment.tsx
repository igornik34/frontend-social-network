import { ActionIcon, Group, Stack } from "@mantine/core";
import { MdDelete, MdEdit, MdSave } from "react-icons/md";
import { useDeleteCommentMutation, useEditCommentMutation } from "../../services/api.ts";
import { useAuth } from "../../../auth/context/AuthContext.tsx";
import { RiShareForwardLine } from "react-icons/ri";
import { useDisclosure } from "@mantine/hooks";
import { WriteComment } from "../WriteComment/WriteComment.tsx";

interface Props {
    parentId: string | null;
    commentId: string;
    postId: string;
    authorId: string;
    isEditing?: boolean;
    onEditToggle?: () => void;
    editedContent?: string;
    onContentChange?: (content: string) => void;
}

export function ToolsComment({
                                 commentId,
                                 postId,
                                 parentId,
                                 authorId,
                                 isEditing = false,
                                 onEditToggle,
                                 editedContent = '',
                                 onContentChange
                             }: Props) {
    const [deleteComment, { isLoading: isLoadingDelete }] = useDeleteCommentMutation();
    const [updateComment, { isLoading: isLoadingUpdate }] = useEditCommentMutation();
    const [opened, { toggle }] = useDisclosure(false);
    const { authData } = useAuth();

    const handleSave = async () => {
        if (!editedContent.trim()) return;

        try {
            await updateComment({
                id: commentId,
                parentId: parentId,
                postId: postId,
                content: editedContent
            }).unwrap();
            onEditToggle?.();
        } catch (error) {
            console.error('Failed to update comment:', error);
        }
    };

    return (
        <Group>
            {authorId === authData?.id && (
                <>
                    <ActionIcon
                        variant="subtle"
                        color={isEditing ? "green" : "blue"}
                        size="lg"
                        onClick={isEditing ? handleSave : onEditToggle}
                        disabled={isLoadingUpdate}
                        loading={isLoadingUpdate}
                    >
                        {isEditing ? <MdSave /> : <MdEdit />}
                    </ActionIcon>

                    <ActionIcon
                        variant="subtle"
                        color="red"
                        size="lg"
                        onClick={() => deleteComment({ parentId, commentId, postId })}
                        disabled={isLoadingDelete || isLoadingUpdate}
                    >
                        <MdDelete />
                    </ActionIcon>
                </>
            )}

            {!parentId && (
                <Group>
                    <ActionIcon
                        variant="subtle"
                        color="grape"
                        size="lg"
                        onClick={toggle}
                        disabled={isEditing}
                    >
                        <RiShareForwardLine />
                    </ActionIcon>
                    {opened && <WriteComment parentId={commentId} postId={postId} />}
                </Group>
            )}
        </Group>
    );
}