import { Divider, Stack } from "@mantine/core";
import {useParams} from "react-router-dom";
import {ChatContainer} from "../../modules/messenger/components/ChatContainer/ChatContainer.tsx";

export function ChatByIdPage() {
    const {id} = useParams()
    return (
        <Stack>
            <ChatContainer chatId={id || ''}/>
        </Stack>
    );
}