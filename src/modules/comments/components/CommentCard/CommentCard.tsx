import {useState, useRef, memo, useMemo} from 'react';
import {Avatar, Group, Paper, Text, Button, Box, Stack, Loader, Center, TextInput, Indicator} from "@mantine/core";
import { ToolsComment } from "../ToolsComment/ToolsComment.tsx";
import { useAuth } from "../../../auth/context/AuthContext.tsx";
import { CommentUser } from "../../types/models/CommentUser.ts";
import { useInfiniteScroll } from "../../../../shared/hooks/useInfiniteScroll/useInfiniteScroll.ts";
import { useGetCommentsByPostIdInfiniteQuery } from "../../services/api.ts";
import {Link} from "react-router-dom";
import {API_URL} from "../../../../constants.ts";
import {formatDistanceToNow} from "date-fns";
import {ru} from "date-fns/locale";

interface Props {
    comment: CommentUser;
    variant?: 'default' | 'nested';
}

export const CommentCard = memo(function CommentCard({ comment, variant = 'default' }: Props) {
    const [showReplies, setShowReplies] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(comment.content);
    const loaderRef = useRef(null);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
    } = useGetCommentsByPostIdInfiniteQuery(
        {
            id: comment.postId,
            parentId: comment.id
        },
        {
            skip: !showReplies,
            initialPageParam: {
                limit: 50,
                offset: 0
            }
        }
    );

    useInfiniteScroll({
        loaderRef,
        onLoadMore: fetchNextPage,
        disabled: isFetchingNextPage || !hasNextPage || !showReplies,
    });

    const replies = useMemo(() => data?.pages.flatMap(page => page.data) ?? [], [data])

    const toggleReplies = () => {
        setShowReplies(!showReplies);
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        setEditedContent(comment.content);
    };

    console.log("RENDER")

    return (
        <Box pl={variant === 'nested' ? 'md' : 0}>
            <Paper p="sm" withBorder mb="sm">
                <Group justify="space-between" align="flex-start">
                    <Group>
                        <Link to={`/users/${comment.author.id}`}>
                            <Indicator zIndex={100} offset={5} position="bottom-end" disabled={!comment.author.online} size={15} withBorder>
                                <Avatar
                                    src={`${API_URL}${comment.author.avatar}`}
                                    radius="xl"
                                />
                            </Indicator>
                        </Link>
                        <div>
                            <Group gap={5}>
                                <Text size="sm" fw={500}>
                                    {comment.author.firstName} {comment.author.lastName}
                                </Text>
                                {comment.editable ? <Text size={'xs'} inline fs={'italic'} c={'gray'}>(ред.)</Text> : null}
                            </Group>

                            {isEditing ? (
                                <TextInput
                                    value={editedContent}
                                    onChange={(e) => setEditedContent(e.currentTarget.value)}
                                    autoFocus
                                />
                            ) : (
                                <Text size="sm">{comment.content}</Text>
                            )}

                            <Text size="xs" c="dimmed">
                                {formatDistanceToNow(new Date(comment.createdAt), {
                                    addSuffix: true,
                                    locale: ru
                                })}
                            </Text>
                            {comment.repliesCount > 0 && (
                                <Button
                                    variant="subtle"
                                    size="xs"
                                    onClick={toggleReplies}
                                    loading={isFetching && !isFetchingNextPage}
                                >
                                    {showReplies ? 'Скрыть' : `Показать (${comment.repliesCount})`}
                                </Button>
                            )}
                        </div>
                    </Group>

                    <ToolsComment
                        authorId={comment.authorId}
                        parentId={comment.parentId}
                        postId={comment.postId}
                        commentId={comment.id}
                        isEditing={isEditing}
                        onEditToggle={handleEditToggle}
                        editedContent={editedContent}
                        onContentChange={setEditedContent}
                    />
                </Group>
            </Paper>

            {showReplies && (
                <Box ml="lg">
                    <Stack gap="sm">
                        {replies.map((reply) => (
                            <CommentCard
                                key={reply.id}
                                comment={reply}
                                variant="nested"
                            />
                        ))}

                        {(isFetchingNextPage) && (
                            <Center>
                                <Loader size="sm" />
                            </Center>
                        )}

                        <div ref={loaderRef} style={{ height: "20px" }} />

                        {!isFetching && replies.length === 0 && (
                            <Text size="sm" c="dimmed">
                                No replies yet
                            </Text>
                        )}
                    </Stack>
                </Box>
            )}
        </Box>
    );
})