import {Center, Loader, Text, Box, Divider, BackgroundImage} from "@mantine/core";
import {useMemo, useRef, useState} from "react";
import { useInfiniteScroll } from "../../../../shared/hooks/useInfiniteScroll/useInfiniteScroll.ts";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { useGetMessagesInfiniteQuery, useMarkMessagesMutation } from "../../services/api.ts";
import { CardMessage } from "../CardMessage/CardMessage.tsx";
import { useAuth } from "../../../auth/context/AuthContext.tsx";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {CallMessage} from "../CallMessage/CallMessage.tsx";
import {ArrowUp} from "../../../../shared/ui/ArrowUp/ArrowUp.tsx"; // или другой язык

interface Props {
    chatId: string;
}

interface GroupedMessages {
    date: string;
    messages: any[];
}

export function MessagesList({ chatId }: Props) {
    const { authData } = useAuth();
    const [read] = useMarkMessagesMutation();
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const unreadMessagesRef = useRef<Set<string>>(new Set());
    const messagesRef = useRef<any[]>([]);

    const [visibleRange, setVisibleRange] = useState({
        startIndex: 0,
        endIndex: 0,
    })

    const {
        data: allMessagesData,
        fetchNextPage: fetchAllNextPage,
        hasNextPage: hasAllNextPage,
        isFetching: isAllFetching,
        isFetchingNextPage,
    } = useGetMessagesInfiniteQuery({ chatId });

    const loaderRef = useRef(null);

    useInfiniteScroll({
        loaderRef,
        onLoadMore: fetchAllNextPage,
        disabled: isAllFetching || !hasAllNextPage,
    });

    // Группируем сообщения по дням
    const groupedMessages = useMemo(() => {
        const allMessages = allMessagesData?.pages.flatMap(page => page.data) ?? [];
        const sortedMessages = [...allMessages].sort((a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        messagesRef.current = sortedMessages;
        unreadMessagesRef.current = new Set(
            sortedMessages
                .filter(msg => !msg.read && msg.senderId !== authData?.id)
                .map(msg => msg.id)
        );

        // Группировка по дням
        const groups: GroupedMessages[] = [];
        let currentDate = "";
        let currentGroup: any[] = [];

        sortedMessages.forEach(message => {
            const messageDate = format(new Date(message.createdAt), "yyyy-MM-dd");

            if (messageDate !== currentDate) {
                if (currentGroup.length > 0) {
                    groups.push({
                        date: currentDate,
                        messages: [...currentGroup]
                    });
                }
                currentDate = messageDate;
                currentGroup = [message];
            } else {
                currentGroup.push(message);
            }
        });

        // Добавляем последнюю группу
        if (currentGroup.length > 0) {
            groups.push({
                date: currentDate,
                messages: [...currentGroup]
            });
        }

        return groups;
    }, [allMessagesData, authData]);

    const loadMore = () => {
        if (!isFetchingNextPage && hasAllNextPage) {
            fetchAllNextPage();
        }
    };

    const handleRangeChange = (range: { startIndex: number; endIndex: number }) => {
        // Необходимо адаптировать под новую структуру с группами
        const flatMessages = groupedMessages.flatMap(group => group.messages);
        const { startIndex, endIndex } = range;
        setVisibleRange(range)
        const visibleMessages = flatMessages.slice(startIndex, endIndex + 1);

        const messagesToMarkAsRead: string[] = [];
        visibleMessages.forEach(message => {
            if (unreadMessagesRef.current.has(message.id)) {
                messagesToMarkAsRead.push(message.id);
                unreadMessagesRef.current.delete(message.id);
            }
        });

        if (messagesToMarkAsRead.length > 0) {
            read({
                chatId,
                messageIds: messagesToMarkAsRead
            });
        }
    };

    if (!isAllFetching && groupedMessages.length === 0) {
        return (
            <Center h="100%">
                <Text>Нет сообщений</Text>
            </Center>
        );
    }

    // Преобразуем группы в плоский список для Virtuoso
    const flattenedData = groupedMessages.flatMap(group => [
        { type: "date", date: group.date },
        ...group.messages.map(message => ({ type: "message", message }))
    ]);

    const scrollToTop = () => {
        virtuosoRef.current?.scrollToIndex({
            index: flattenedData.length - 1,
            behavior: "smooth",
        });
    };

    return (
        <Box style={{
            height: '60vh',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
        }}>
            <Virtuoso
                ref={virtuosoRef}
                style={{ flex: 1 }}
                data={flattenedData}
                initialTopMostItemIndex={flattenedData.length - 1}
                alignToBottom
                followOutput="auto"
                itemContent={(index, item) => {
                    if (item.type === "date") {
                        return (
                            <Center my="sm" key={`date-${item.date}`}>
                                <Divider w="100%" label={<Text mx="md" color="dimmed" size="sm">{format(new Date(item.date), "d MMMM yyyy", { locale: ru })}</Text>} />
                            </Center>
                        );
                    }
                    if (item.message.content?.startsWith('CALL')) {
                        return (
                            <div style={{padding: "4px 16px"}}>
                                <CallMessage key={item.message.id} message={item.message}/>
                            </div>
                        )
                    }
                    return (
                        <div style={{padding: "4px 16px"}}>
                            <CardMessage key={item.message.id} message={item.message} />
                        </div>
                    );
                }}
                startReached={loadMore}
                rangeChanged={handleRangeChange}
                components={{
                    Header: () => (
                        <div ref={loaderRef}>
                            {isFetchingNextPage && (
                                <Center style={{ padding: "20px" }}>
                                    <Loader />
                                </Center>
                            )}
                        </div>
                    ),
                }}
            />
            <ArrowUp visibleFrom={visibleRange.endIndex < flattenedData.length - 1} onScroll={scrollToTop}/>
        </Box>
    );
}