import {FollowersList} from "../../../followers/components/FollowersList/FollowersList.tsx";
import {Tabs} from "@mantine/core";
import {useParams} from "react-router-dom";

export function TabFollowers() {
    const {id} = useParams()
    return (
        <Tabs.Panel value="followers">
            <FollowersList userId={id || ''} />
        </Tabs.Panel>
    )
}