import { useCallContext } from "../../context/call.context.tsx";
import { motion } from "framer-motion"
import { CallControl } from "../CallControl/CallControl.tsx";
import { useRef } from "react";

export const GlobalCallUI = () => {
    const { callState } = useCallContext();
    const constraintsRef = useRef(null);

    if (!callState.localStatus.isActive) return null;

    return (
        <motion.div
            ref={constraintsRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none', // Это позволяет кликам проходить сквозь этот элемент
                zIndex: 1000 // Достаточно высокий, но не чрезмерный
            }}
        >
            <motion.div
                drag
                dragMomentum={false}
                dragConstraints={constraintsRef}
                style={{
                    position: 'absolute',
                    cursor: 'grab',
                    pointerEvents: 'auto', // Включаем обработку событий для этого элемента
                    zIndex: 1001 // Чуть выше, чем у constraints
                }}
                whileDrag={{ cursor: 'grabbing' }}
            >
                <CallControl />
            </motion.div>
        </motion.div>
    )
};