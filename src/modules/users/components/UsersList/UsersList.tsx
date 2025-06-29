import { Center, Loader, Text } from "@mantine/core";
import {useMemo, useRef, useState} from "react";
import { useInfiniteScroll } from "../../../../shared/hooks/useInfiniteScroll/useInfiniteScroll.ts";
import { Virtuoso } from "react-virtuoso";
import {ArrowUp} from "../../../../shared/ui/ArrowUp/ArrowUp.tsx";
import {useSearchUsersInfiniteQuery} from "../../services/api.ts";
import {UserCard} from "../UserCard/UserCard.tsx";

interface Props {
    query: string
}

export function UsersList({query}: Props) {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetching,
    } = useSearchUsersInfiniteQuery(query);

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
                <Text>Пользователи не найдены</Text>
            </Center>
        );
    }

    return (
        <>
            <Virtuoso
                ref={virtuosoRef}
                useWindowScroll
                data={posts}
                itemContent={(index, user) => (
                    <div style={{ padding: "8px 0" }}>
                        <UserCard key={user.id} user={user} />
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