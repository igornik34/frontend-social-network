import { Center, Loader, Text } from "@mantine/core";
import { useMemo, useRef } from "react";
import { useInfiniteScroll } from "../../../../shared/hooks/useInfiniteScroll/useInfiniteScroll.ts";
import { Virtuoso } from "react-virtuoso";
import {useGetChatsInfiniteQuery} from "../../services/api.ts";
import {ChatCard} from "../ChatCard/ChatCard.tsx";

interface Props {
    query: string
}

export function ChatList({query}: Props) {
    const {
        data: allChatsData,
        fetchNextPage: fetchAllNextPage,
        hasNextPage: hasAllNextPage,
        isFetching: isAllFetching,
    } = useGetChatsInfiniteQuery({query});

    const loaderRef = useRef(null);

    useInfiniteScroll({
        loaderRef,
        onLoadMore: fetchAllNextPage,
        disabled: isAllFetching || !hasAllNextPage,
    });

    const chats = useMemo(() => {
        return allChatsData?.pages.flatMap(page => page.data) ?? [];
    }, [allChatsData]);

    const loadMore = () => {
        if (!isAllFetching && hasAllNextPage) {
            fetchAllNextPage();
        }
    };

    if (!isAllFetching && chats.length === 0) {
        return (
            <Center>
                <Text>Чаты не найдены</Text>
            </Center>
        );
    }

    return (
        <Virtuoso
            useWindowScroll
            data={chats}
            itemContent={(_, chat) => (
                <div style={{ padding: "8px 0" }}>
                    <ChatCard key={chat.id} chat={chat} />
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
        />
    );
}