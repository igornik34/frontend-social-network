import { Divider, Stack, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import {UsersList} from "../../modules/users/components/UsersList/UsersList.tsx";

export function UsersPage() {
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
            <UsersList query={debouncedQuery} />
        </Stack>
    );
}