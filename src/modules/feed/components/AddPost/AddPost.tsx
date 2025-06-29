import {useDisclosure} from "@mantine/hooks";
import {PostFormModal} from "../PostFormModal/PostFormModal.tsx";
import {Button, Stack} from "@mantine/core";
import {FaPlus} from "react-icons/fa";

export function AddPost() {
    const [opened, {toggle}] = useDisclosure(false)
    return (
        <Stack>
            <Button bg={'linear-gradient(45deg, var(--mantine-color-cyan-5), var(--mantine-color-indigo-5))'} leftSection={<FaPlus />} onClick={toggle}>Добавить пост</Button>
            <PostFormModal opened={opened} onClose={toggle} />
        </Stack>
    )
}