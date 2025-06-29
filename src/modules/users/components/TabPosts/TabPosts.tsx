import {Tabs} from "@mantine/core";
import {useParams} from "react-router-dom";
import {PostList} from "../../../feed/components/PostList/PostList.tsx";
import {UserPostList} from "../../../feed/components/UserPostList/UserPostList.tsx";

export function TabPosts() {
    const {id} = useParams()
    return (
        <Tabs.Panel value="posts">
            <UserPostList userId={id || ''} />
        </Tabs.Panel>
    )
}