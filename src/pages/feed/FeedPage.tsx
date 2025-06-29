import { Divider, Stack } from "@mantine/core";
import {PostList} from "../../modules/feed/components/PostList/PostList.tsx";
import {AddPost} from "../../modules/feed/components/AddPost/AddPost.tsx";

export function FeedPage() {
    return (
        <Stack>
            <AddPost />
            <Divider />
            <PostList />
        </Stack>
    );
}