import { Divider, Stack, TextInput } from "@mantine/core";
import { PostList } from "../../modules/feed/components/PostList/PostList.tsx";
import { ChatList } from "../../modules/messenger/components/ChatList/ChatList.tsx";
import { isNotEmpty, useField } from "@mantine/form";
import { useEffect, useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";

export function MessengerPage() {
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [query, setQuery] = useState('');

    const [debouncedValue] = useDebouncedValue(query, 500); // 500ms задержка

    useEffect(() => {
        setDebouncedQuery(debouncedValue);
    }, [debouncedValue]);

    return (
        <Stack>
            <TextInput
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
                placeholder="Поиск..."
            />
            <ChatList query={debouncedQuery}/>
        </Stack>
    );
}