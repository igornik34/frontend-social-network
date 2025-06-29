import {Box, Center, Loader, ScrollArea, Stack, Text} from "@mantine/core";
import {useMemo, useRef} from "react";
import {useInfiniteScroll} from "../../../../shared/hooks/useInfiniteScroll/useInfiniteScroll.ts";
import {feedApi} from "../../../feed/services/api.ts";
import {CommentCard} from "../CommentCard/CommentCard.tsx";
import {useGetCommentsByPostIdInfiniteQuery} from "../../services/api.ts";
import {PostCard} from "../../../feed/components/PostCard/PostCard.tsx";
import {Virtuoso} from "react-virtuoso";

interface Props {
    postId: string
}

export function CommentsList({postId}: Props) {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetching,
    } = useGetCommentsByPostIdInfiniteQuery({
        id: postId,
        parentId: null
    })

    const loaderRef = useRef(null);

    useInfiniteScroll({
        loaderRef,
        onLoadMore: fetchNextPage,
        disabled: isFetching,
    });

    const comments = useMemo(() => {
        return data?.pages.flatMap(page => page.data) ?? []
    }, [data])

    const loadMore = () => {
        if (!isFetching && hasNextPage) {
            fetchNextPage();
        }
    };

    if (!isFetching && comments.length === 0) {
        return (
            <Center>
                <Text>No comments found</Text>
            </Center>
        );
    }

    return (
        <ScrollArea.Autosize mah={300}>
            <Virtuoso
                useWindowScroll
                data={comments}
                itemContent={(index, comment) => (
                    <div style={{ padding: "8px 0" }}>
                        <CommentCard key={comment.id} comment={comment} />
                    </div>
                )}
                endReached={loadMore}
                components={{
                    Footer: () => (
                        <div ref={loaderRef}>
                            {isFetching && (
                                <Center style={{ padding: "20px" }}>
                                    <Loader />
                                </Center>
                            )}
                        </div>
                    )
                }}
            />
        </ScrollArea.Autosize>
    )
}