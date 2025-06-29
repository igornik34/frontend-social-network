import {FollowersList} from "../../modules/followers/components/FollowersList/FollowersList.tsx";
import {useAuth} from "../../modules/auth/context/AuthContext.tsx";
import {useEffect, useState} from "react";
import {useDebouncedValue} from "@mantine/hooks";
import {Stack, TextInput} from "@mantine/core";

export function FollowersPage() {
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
            <FollowersList query={debouncedQuery} userId={authData?.id || ''} />
        </Stack>
    )
}