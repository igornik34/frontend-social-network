import {Box, Center, Loader, Text} from "@mantine/core";
import {useMemo, useRef, useState} from "react";
import { useInfiniteScroll } from "../../../../shared/hooks/useInfiniteScroll/useInfiniteScroll.ts";
import { useGetPostsByUserInfiniteQuery, useGetPostsInfiniteQuery } from "../../services/api.ts";
import { PostCard } from "../PostCard/PostCard.tsx";
import {Virtuoso, VirtuosoHandle} from "react-virtuoso";
import {ArrowUp} from "../../../../shared/ui/ArrowUp/ArrowUp.tsx";

export function PostList() {
    // Запрос для общих постов
    const {
        data: allPostsData,
        fetchNextPage: fetchAllNextPage,
        hasNextPage: hasAllNextPage,
        isFetching: isAllFetching,
    } = useGetPostsInfiniteQuery();

    const loaderRef = useRef(null);
    const virtuosoRef = useRef<VirtuosoHandle | null>(null);
    const [visibleRange, setVisibleRange] = useState({
        startIndex: 0,
        endIndex: 0,
    })

    useInfiniteScroll({
        loaderRef,
        onLoadMore: fetchAllNextPage,
        disabled: isAllFetching || !hasAllNextPage,
    });

    const posts = useMemo(() => {
        return allPostsData?.pages.flatMap(page => page.data) ?? [];
    }, [allPostsData]);

    const loadMore = () => {
        if (!isAllFetching && hasAllNextPage) {
            fetchAllNextPage();
        }
    };

    if (!isAllFetching && posts.length === 0) {
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
        <Box pos={'relative'}>
            <Virtuoso
                ref={virtuosoRef}
                useWindowScroll
                data={posts}
                itemContent={(_, post) => (
                    <div style={{ padding: "1px 0" }}>
                        <PostCard key={post.id} post={post} />
                    </div>
                )}
                endReached={loadMore}
                components={{
                    Footer: () => (
                        <div ref={loaderRef}>
                            {isAllFetching && (
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
        </Box>
    );
}