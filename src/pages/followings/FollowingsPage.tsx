import {FollowingsList} from "../../modules/followers/components/FollowingsList/FollowingsList.tsx";
import {useAuth} from "../../modules/auth/context/AuthContext.tsx";
import {useEffect, useState} from "react";
import {useDebouncedValue} from "@mantine/hooks";
import {Stack, TextInput} from "@mantine/core";

export function FollowingsPage() {
    const {authData} = useAuth()
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
            <FollowingsList query={debouncedQuery} userId={authData?.id || ''} />
        </Stack>
    )
}