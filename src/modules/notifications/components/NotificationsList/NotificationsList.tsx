import { Center, Loader, Text } from "@mantine/core";
import { useMemo, useRef, useState, useEffect } from "react";
import { useInfiniteScroll } from "../../../../shared/hooks/useInfiniteScroll/useInfiniteScroll.ts";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { useGetNotificationsInfiniteQuery, useMarkNotificationsMutation } from "../../services/api.ts";
import { NotificationCard } from "../NotificationCard/NotificationCard.tsx";
import { ArrowUp } from "../../../../shared/ui/ArrowUp/ArrowUp.tsx";

export function NotificationsList() {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetching,
    } = useGetNotificationsInfiniteQuery();

    const [markAsRead] = useMarkNotificationsMutation();
    const unreadNotificationsRef = useRef<Set<string>>(new Set());
    const loaderRef = useRef(null);
    const virtuosoRef = useRef<VirtuosoHandle | null>(null);
    const [visibleRange, setVisibleRange] = useState({
        startIndex: 0,
        endIndex: 0,
    });

    // Инициализация непрочитанных уведомлений
    const posts = useMemo(() => {
        const notifications = data?.pages.flatMap(page => page.data) ?? [];

        // Обновляем список непрочитанных уведомлений
        notifications.forEach(notification => {
            if (!notification.read) {
                unreadNotificationsRef.current.add(notification.id);
            }
        });

        return notifications;
    }, [data]);

    useInfiniteScroll({
        loaderRef,
        onLoadMore: fetchNextPage,
        disabled: isFetching || !hasNextPage,
    });

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

    // Обработка изменения видимой области
    const handleRangeChange = (range: { startIndex: number; endIndex: number }) => {
        setVisibleRange(range);

        const visibleNotifications = posts.slice(range.startIndex, range.endIndex + 1);
        const notificationsToMark: string[] = [];

        visibleNotifications.forEach(notification => {
            if (unreadNotificationsRef.current.has(notification.id)) {
                notificationsToMark.push(notification.id);
                unreadNotificationsRef.current.delete(notification.id);
            }
        });

        // Отмечаем уведомления как прочитанные
        if (notificationsToMark.length > 0) {
            markAsRead(notificationsToMark)
                .unwrap()
                .catch((error) => {
                    console.error("Failed to mark notifications as read:", error);
                    // Возвращаем ID обратно в Set при ошибке
                    notificationsToMark.forEach(id => unreadNotificationsRef.current.add(id));
                });
        }
    };

    // Автоматическая пометка как прочитанные при монтировании
    useEffect(() => {
        return () => {
            // При размонтировании компонента отмечаем все просмотренные уведомления как прочитанные
            const notificationsToMark = Array.from(unreadNotificationsRef.current);
            if (notificationsToMark.length > 0) {
                markAsRead(notificationsToMark).catch(console.error);
            }
        };
    }, [markAsRead]);

    if (!isFetching && posts.length === 0) {
        return (
            <Center>
                <Text>У Вас нет уведомлений</Text>
            </Center>
        );
    }

    return (
        <>
            <Virtuoso
                ref={virtuosoRef}
                useWindowScroll
                data={posts}
                itemContent={(index, notification) => (
                    <div style={{ padding: "8px 0" }}>
                        <NotificationCard
                            key={notification.id}
                            notification={notification}
                        />
                    </div>
                )}
                endReached={loadMore}
                rangeChanged={handleRangeChange}
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
            <ArrowUp visibleFrom={visibleRange.startIndex > 0} onScroll={scrollToTop}/>
        </>
    );
}