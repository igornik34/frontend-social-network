import { useEffect, useRef } from "react";

type UseInfiniteScrollOptions = {
    loaderRef: React.RefObject<HTMLElement>;
    onLoadMore: () => void;
    disabled?: boolean;
    delay?: number;
};

export const useInfiniteScroll = ({
                                      loaderRef,
                                      onLoadMore,
                                      disabled = false,
                                      delay = 10000, // Задержка по умолчанию 500мс
                                  }: UseInfiniteScrollOptions) => {
    const timeoutRef = useRef(null);
    const mountedRef = useRef(false);

    console.log(onLoadMore, disabled)

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (disabled || !loaderRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (!entries[0].isIntersecting || !mountedRef.current) return;

                // Очищаем предыдущий таймаут
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }

                // Устанавливаем новый таймаут
                timeoutRef.current = setTimeout(() => {
                    if (mountedRef.current) {
                        onLoadMore();
                    }
                }, delay);
            },
            { threshold: 0.9 }
        );

        observer.observe(loaderRef.current);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current);
            }
        };
    }, [loaderRef, onLoadMore, disabled, delay]);
};