import {memo, useState} from 'react';
import {ActionIcon, Avatar, Box, Button, Card, Divider, Group, Image, Indicator, Text,} from '@mantine/core';
import {Post} from "../../types/models/Post.ts";
import {Carousel} from "@mantine/carousel";
import {CiHeart} from "react-icons/ci";
import {FaRegMessage} from "react-icons/fa6";
import {FaHeart, FaRegHeart} from "react-icons/fa";
import {useDisclosure} from "@mantine/hooks";
import {WriteComment} from "../../../comments/components/WriteComment/WriteComment.tsx";
import {ToolsPost} from "../ToolsPost/ToolsPost.tsx";
import {useAuth} from "../../../auth/context/AuthContext.tsx";
import {useLikeMutation, useUnlikeMutation} from "../../../likes/services/api.ts";
import {CommentsList} from "../../../comments/components/CommentsList/CommentsList.tsx";
import {Link} from "react-router-dom";
import {API_URL} from "../../../../constants.ts";
import {formatDistanceToNow} from "date-fns";
import {ru} from "date-fns/locale";
import {breakpointCols} from "../../../../shared/utils/breakpointCols.ts";
import Masonry from "react-masonry-css";

export const PostCard = memo(function PostCard({ post }: { post: Post }) {
    const {authData} = useAuth()
    const [visibleComments, {toggle: toggleVisibleComments}] = useDisclosure(false);
    const [openedImage, setOpenedImage] = useState<string | null>(null);

    const [like] = useLikeMutation()
    const [unlike] = useUnlikeMutation()
    const handleLike = () => {
        if(post.likedByUser) {
            unlike(post.id)
        } else {
            like(post.id)
        }
    };

    const openImageModal = (imageUrl: string) => {
        setOpenedImage(imageUrl);
    };

    const closeImageModal = () => {
        setOpenedImage(null);
    };

    return (
        <Card withBorder shadow={'xl'} radius="md" p="md" mb="md">
            <Card.Section withBorder p="sm">
                <Group justify={'space-between'} align={'flex-start'}>
                    <Group>
                        <Link to={`/users/${post.author.id}`}>
                            <Indicator zIndex={100} offset={5} disabled={!post.author.online} position="bottom-end" size={15} withBorder>
                                <Avatar
                                    src={`${API_URL}${post.author.avatar}`}
                                    radius="xl"
                                />
                            </Indicator>
                        </Link>
                        <div>
                            <Text fw={500}>{post.author.firstName} {post.author.lastName}</Text>
                        </div>
                    </Group>
                    {authData?.id === post.authorId && <ToolsPost postId={post.id} />}
                </Group>
            </Card.Section>

            {post.content && (
                <Text mt="sm" size="sm">
                    {post.content}
                </Text>
            )}

            {post.images.length > 0 && (
                <Card.Section mt="sm">
                    <Masonry
                        breakpointCols={breakpointCols(post.images.length)}
                        className="my-masonry-grid"
                        columnClassName="my-masonry-grid_column"
                    >
                        {post.images.map((image, index) => (
                            <Box
                                key={index}
                                style={{
                                    marginBottom: 8,
                                    cursor: 'pointer',
                                    maxWidth: '500px'
                                }}
                                mx={'auto'}
                                onClick={() => openImageModal(`${API_URL}${image}`)}
                            >
                                <Image
                                    src={`${API_URL}${image}`}
                                    alt={`Message image ${index + 1}`}
                                    radius="sm"
                                    mx={'auto'}
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        display: 'block',
                                    }}
                                />
                            </Box>
                        ))}
                    </Masonry>
                </Card.Section>
            )}

            <Group align={'center'} justify={'space-between'}>
                <Group mt="sm">
                    <Group gap="xs">
                        <ActionIcon
                            variant="subtle"
                            color={post.likedByUser ? 'red' : 'gray'}
                            onClick={handleLike}
                        >
                            {post.likedByUser ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
                        </ActionIcon>
                        <Text size="sm" c="dimmed">
                            {post.likesCount}
                        </Text>
                    </Group>

                    <Button
                        variant="subtle"
                        color="gray"
                        leftSection={<FaRegMessage size={16} />}
                        onClick={toggleVisibleComments}
                    >
                        {post.commentsCount}
                    </Button>
                </Group>
                <Text size="xs" c="dimmed">
                    {formatDistanceToNow(new Date(post.createdAt), {
                        addSuffix: true,
                        locale: ru
                    })}
                </Text>
            </Group>

            {visibleComments && (
                <>
                    <Divider my="sm" />

                    <CommentsList postId={post.id} />

                    <WriteComment parentId={null} postId={post.id} />
                </>
            )}

            {/* Модальное окно для просмотра изображения */}
            {openedImage && (
                <Box
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onClick={closeImageModal}
                >
                    <Image
                        src={openedImage}
                        style={{
                            maxWidth: '90%',
                            maxHeight: '90%',
                            objectFit: 'contain'
                        }}
                    />
                </Box>
            )}
        </Card>
    );
})