import {memo} from 'react';
import {
    Card,
    Text,
    Group,
    Button,
    Avatar, Indicator,
} from '@mantine/core';
import {FollowBase} from "../../types/models/FollowBase.ts";
import {useFollowMutation, useUnfollowMutation} from "../../services/api.ts";
import {Link} from "react-router-dom";
import {API_URL} from "../../../../constants.ts";

interface Props {
    cardFor: 'follower' | 'following'
    followsYou?: boolean
    isFollowing?: boolean
    follower: FollowBase
}

export const FollowerCard = memo(function FollowerCard({ follower, cardFor, followsYou, isFollowing }: Props) {

    return (
        <Card withBorder shadow={'xl'} radius="md" p="md" mb="md">
            <Card.Section withBorder p="sm">
                <Group justify={'space-between'} align={'flex-start'}>
                    <Group>
                        <Link to={`/users/${follower.id}`}>
                            <Indicator zIndex={100} offset={5} position="bottom-end" disabled={!follower.online} size={15} withBorder>
                                <Avatar
                                    src={`${API_URL}${follower.avatar}`}
                                    radius="xl"
                                />
                            </Indicator>
                        </Link>
                        <div>
                            <Text fw={500}>{follower.firstName} {follower.lastName}</Text>
                            {(cardFor === 'following' && followsYou) && (
                                <Text size="xs" c="dimmed">Подписан(а) на вас</Text>
                            )}
                        </div>
                    </Group>
                </Group>
            </Card.Section>
        </Card>
    );
})