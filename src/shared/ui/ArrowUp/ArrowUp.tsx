import {ActionIcon, Affix, Button, Transition} from "@mantine/core";
import {FaChevronUp} from "react-icons/fa";

interface Props {
    visibleFrom: boolean
    onScroll: () => void
}

export function ArrowUp({visibleFrom, onScroll}: Props) {
    return (
        <Affix position={{ bottom: 20, right: 20 }}>
            <Transition transition="slide-up" mounted={visibleFrom}>
                {(transitionStyles) => (
                    <ActionIcon
                        size={'xl'}
                        variant={'default'}
                        radius={'xl'}
                        style={transitionStyles}
                        onClick={onScroll}
                    >
                        <FaChevronUp />
                    </ActionIcon>
                )}
            </Transition>
        </Affix>
    )
}