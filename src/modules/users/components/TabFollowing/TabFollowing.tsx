import {Tabs} from "@mantine/core";
import {useParams} from "react-router-dom";
import {FollowingsList} from "../../../followers/components/FollowingsList/FollowingsList.tsx";

export function TabFollowing() {
    const {id} = useParams()
    return (
        <Tabs.Panel value="following">
            <FollowingsList userId={id || ''} />
        </Tabs.Panel>
    )
}