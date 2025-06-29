import { Center, Loader, Text } from "@mantine/core";
import {useMemo, useRef, useState} from "react";
import { useInfiniteScroll } from "../../../../shared/hooks/useInfiniteScroll/useInfiniteScroll.ts";
import { useGetPostsByUserInfiniteQuery, useGetPostsInfiniteQuery } from "../../services/api.ts";
import { PostCard } from "../PostCard/PostCard.tsx";
import {Virtuoso, VirtuosoHandle} from "react-virtuoso";
import {ArrowUp} from "../../../../shared/ui/ArrowUp/ArrowUp.tsx";

interface Props {
    userId: string;
}

export function UserPostList({ userId }: Props) {
    // Запрос для постов конкретного пользователя
    const {
        data: userPostsData,
        fetchNextPage: fetchUserNextPage,
        hasNextPage: hasUserNextPage,
        isFetching: isUserFetching,
    } = useGetPostsByUserInfiniteQuery({ userId: userId! }, {
        skip: !userId
    });

    const loaderRef = useRef(null);
    const virtuosoRef = useRef<VirtuosoHandle | null>(null);
    const [visibleRange, setVisibleRange] = useState({
        startIndex: 0,
        endIndex: 0,
    })

    useInfiniteScroll({
        loaderRef,
        onLoadMore: fetchUserNextPage,
        disabled: isUserFetching || !hasUserNextPage,
    });

    const posts = useMemo(() => {
        return userPostsData?.pages.flatMap(page => page.data) ?? [];
    }, [userPostsData]);

    const loadMore = () => {
        if (!isUserFetching && hasUserNextPage) {
            fetchUserNextPage();
        }
    };

    if (!isUserFetching && posts.length === 0) {
        return (
            <Center>
                <Text>Посты не найдены</Text>
            </Center>
        );
    }

    const scrollToTop = () => {
        virtuosoRef.current?.scrollToIndex({
            index: 0,
            behavior: "smooth",
        });
    };

    return (
        <>
            <Virtuoso
                ref={virtuosoRef}
                useWindowScroll
                data={posts}
                itemContent={(_, post) => (
                    <div style={{ padding: "8px 0" }}>
                        <PostCard key={post.id} post={post} />
                    </div>
                )}
                endReached={loadMore}
                components={{
                    Footer: () => (
                        <div ref={loaderRef}>
                            {isUserFetching && (
                                <Center style={{ padding: "20px" }}>
                                    <Loader />
                                </Center>
                            )}
                        </div>
                    )
                }}
                rangeChanged={setVisibleRange}
            />
            <ArrowUp visibleFrom={visibleRange.startIndex > 0} onScroll={scrollToTop}/>
        </>
    );
}