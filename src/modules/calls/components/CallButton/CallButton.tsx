import { Button, Tooltip, LoadingOverlay, Modal, Group, Avatar, Text, Stack, ActionIcon } from "@mantine/core";
import { FaPhone, FaPhoneSlash, FaVideo, FaMicrophone, FaMicrophoneSlash, FaRegTimesCircle, FaShareSquare, FaUser } from "react-icons/fa";
import { useCall } from "../../hooks/useCall.ts";
import { CallControl } from "../CallControl/CallControl.tsx";
import {memo, ReactNode, useState} from "react";
import { useAuth } from "../../../auth/context/AuthContext.tsx";
import {useCallContext, useCurrentCall,} from "../../context/call.context.tsx";

interface CallButtonProps {
    callType: 'audio' | 'video'
    recipientId: string;
    recipientName: string;
    isOnline: boolean;
    avatar: string;
    icon: ReactNode
}

export const CallButton = memo(function CallButton({ recipientId, avatar, recipientName, isOnline, callType, icon }: CallButtonProps) {
    const {
        startCall,
        endCall,
        callState
    } = useCurrentCall({
        id: recipientId,
        name: recipientName,
        avatar: avatar
    });

    const [loading, setLoading] = useState(false);

    const handleStartCall = async () => {
        if (!isOnline) return;

        setLoading(true);
        try {
            await startCall(callType);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <LoadingOverlay visible={loading} />

            {/* Кнопка для начала звонка */}
            {!callState.localStatus?.isActive && (
                <Tooltip label={isOnline ? `Позвонить ${recipientName}` : "Пользователь не в сети"}>
                    <ActionIcon
                        variant="transparent"
                        color="#fff"
                        size="lg"
                        onClick={handleStartCall}
                        disabled={!isOnline || loading}
                    >
                        {icon}
                    </ActionIcon>
                </Tooltip>
            )}
        </>
    );
})