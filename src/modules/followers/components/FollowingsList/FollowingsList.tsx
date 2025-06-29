import { Center, Loader, Text } from "@mantine/core";
import {useMemo, useRef, useState} from "react";
import { useInfiniteScroll } from "../../../../shared/hooks/useInfiniteScroll/useInfiniteScroll.ts";
import {useGetFollowersInfiniteQuery, useGetFollowingsInfiniteQuery} from "../../services/api.ts";
import { Virtuoso } from "react-virtuoso";
import {FollowerCard} from "../FollowerCard/FollowerCard.tsx";
import {ArrowUp} from "../../../../shared/ui/ArrowUp/ArrowUp.tsx";

interface Props {
    userId: string
    query: string
}


export function FollowingsList({userId, query}: Props) {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetching,
    } = useGetFollowingsInfiniteQuery({userId, query});

    const loaderRef = useRef(null);
    const virtuosoRef = useRef(null);
    const [visibleRange, setVisibleRange] = useState({
        startIndex: 0,
        endIndex: 0,
    })

    useInfiniteScroll({
        loaderRef,
        onLoadMore: fetchNextPage,
        disabled: isFetching || !hasNextPage,
    });

    const posts = useMemo(() => {
        return data?.pages.flatMap(page => page.data) ?? [];
    }, [data]);

    const loadMore = () => {
        if (!isFetching && hasNextPage) {
            fetchNextPage();
        }
    };

    const scrollToTop = () => {
        virtuosoRef.current?.scrollToIndex({
            index: 0,
            behavior: "smooth",
        });
    };

    if (!isFetching && posts.length === 0) {
        return (
            <Center>
                <Text>У Вас нет подписок</Text>
            </Center>
        );
    }

    return (
        <>
            <Virtuoso
                ref={virtuosoRef}
                useWindowScroll
                data={posts}
                itemContent={(index, following) => (
                    <div style={{ padding: "8px 0" }}>
                        <FollowerCard key={following.id} cardFor={'following'} isFollowing={true} followsYou={following.followsYou} follower={following} />
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
                rangeChanged={setVisibleRange}
            />
            <ArrowUp visibleFrom={visibleRange.startIndex > 0} onScroll={scrollToTop}/>
        </>
    );
}