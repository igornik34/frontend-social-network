import { Group, ActionIcon, Tooltip, Box, Avatar, Text, Card, Stack, rem } from "@mantine/core";
import {
    FaMicrophone,
    FaMicrophoneSlash,
    FaVideo,
    FaShareSquare,
    FaPhoneSlash,
    FaExpand,
    FaCompress,
    FaExchangeAlt
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useCallContext } from "../../context/call.context";
import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import {API_URL} from "../../../../constants.ts";

export function CallControl() {
    const { endCall, toggleMute, toggleVideo, toggleScreenShare, callState, recipient } = useCallContext();
    const isMobile = useMediaQuery('(max-width: 768px)');

    const handleEndCall = async () => {
        endCall();
    };

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (localVideoRef.current && callState.localStream) {
            localVideoRef.current.srcObject = callState.localStream;
        }
        if (remoteVideoRef.current && callState.remoteStream) {
            remoteVideoRef.current.srcObject = callState.remoteStream;
        }
    }, [callState.localStream, callState.remoteStream]);

    const toggleVideoSize = () => {
        setIsExpanded(!isExpanded);
    };

    // Размеры видео в разных состояниях
    const getVideoDimensions = () => {
        if (isMobile) {
            return isExpanded
                ? { width: '95vw', height: '70vh' }
                : { width: '95vw', height: '40vh' };
        } else {
            return isExpanded
                ? { width: '800px', height: '600px' }
                : { width: '500px', height: '350px' };
        }
    };

    const renderAvatarPlaceholder = (isMain: boolean) => {
        const dimensions = getVideoDimensions();

        return (
            <Box
                style={{
                    position: isMain ? 'relative' : 'absolute',
                    width: dimensions.width,
                    height: dimensions.height,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--mantine-color-dark-7)',
                    borderRadius: 'var(--mantine-radius-md)',
                    transition: 'all 0.3s ease',
                }}
            >
                <Avatar
                    radius="xl"
                    src={`${API_URL}${recipient!.avatar}`}
                    size={isMain ? rem(100) : rem(50)}
                />
                <Text ta="center" mt="md" c="dimmed">
                    {!callState.remoteStatus.isActive && "Ожидание подключения"}
                </Text>
                <Text ta="center" mt="md">
                    {recipient!.name}
                </Text>
            </Box>
        );
    };

    console.log(callState)

    return (
        <Box style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: isMobile ? '10px' : '20px'
        }}>
            <Card
                withBorder
                shadow="md"
                style={{
                    width: 'fit-content',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                }}
            >
                <Stack gap="sm">
                    {/* Main video area */}
                    <Box style={{position: 'relative'}}>
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            style={{
                                width: getVideoDimensions().width,
                                height: getVideoDimensions().height,
                                objectFit: 'contain',
                                display: callState.remoteStatus.isVideoOn ? 'block' : 'none',
                                borderRadius: 'var(--mantine-radius-md)',
                                backgroundColor: 'var(--mantine-color-dark-7)',
                                transition: 'all 0.3s ease'
                            }}
                        />
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{
                                position: 'absolute',
                                bottom: isMobile ? 20 : 40,
                                right: 10,
                                width: isMobile ? '25%' : '20%',
                                maxWidth: 150,
                                borderRadius: 8,
                                border: '2px solid white',
                                boxShadow: '0 0 10px rgba(0,0,0,0.2)',
                                display: callState.localStatus.isVideoOn ? 'block' : 'none',
                                transition: 'all 0.3s ease'
                            }}
                        />

                        {/* Placeholder for main video */}
                        {!callState.remoteStatus.isVideoOn && renderAvatarPlaceholder(true)}
                    </Box>

                    {/* Controls */}
                    <Group gap="sm" justify="center" wrap="nowrap">
                        <Tooltip label={callState.localStatus.isMuted ? "Unmute" : "Mute"}>
                            <ActionIcon
                                color={callState.localStatus.isMuted ? "red" : "blue"}
                                variant="filled"
                                onClick={toggleMute}
                                size={isMobile ? "md" : "lg"}
                            >
                                {callState.localStatus.isMuted ? (
                                    <FaMicrophoneSlash size={isMobile ? 16 : 20}/>
                                ) : (
                                    <FaMicrophone size={isMobile ? 16 : 20} />
                                )}
                            </ActionIcon>
                        </Tooltip>

                        {
                            (callState.localStatus.callType === 'video' && callState.remoteStatus.callType === 'video') && (
                                <>
                                    <Tooltip label={callState.localStatus.isVideoOn ? "Turn off video" : "Turn on video"}>
                                        <ActionIcon
                                            color={callState.localStatus.isVideoOn ? "blue" : "red"}
                                            variant="filled"
                                            onClick={toggleVideo}
                                            size={isMobile ? "md" : "lg"}
                                        >
                                            <FaVideo size={isMobile ? 16 : 20} />
                                        </ActionIcon>
                                    </Tooltip>
                                    <Tooltip label={callState.localStatus.isScreenSharing ? "Stop screen sharing" : "Share screen"}>
                                        <ActionIcon
                                            color={callState.localStatus.isScreenSharing ? "orange" : "gray"}
                                            variant="filled"
                                            onClick={toggleScreenShare}
                                            size={isMobile ? "md" : "lg"}
                                        >
                                            <FaShareSquare size={isMobile ? 16 : 20} />
                                        </ActionIcon>
                                    </Tooltip>
                                </>
                            )
                        }

                        {
                            (callState.localStatus.callType === 'video' && callState.remoteStatus.callType === 'video') && (
                                <Tooltip label={isExpanded ? "Minimize" : "Expand"}>
                                    <ActionIcon
                                        color="gray"
                                        variant="filled"
                                        onClick={toggleVideoSize}
                                        size={isMobile ? "md" : "lg"}
                                    >
                                        {isExpanded ? (
                                            <FaCompress size={isMobile ? 16 : 20} />
                                        ) : (
                                            <FaExpand size={isMobile ? 16 : 20} />
                                        )}
                                    </ActionIcon>
                                </Tooltip>
                            )
                        }

                        <Tooltip label="End call">
                            <ActionIcon
                                color="red"
                                variant="filled"
                                onClick={handleEndCall}
                                size={isMobile ? "md" : "lg"}
                            >
                                <FaPhoneSlash size={isMobile ? 16 : 20} />
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                </Stack>
            </Card>
        </Box>
    );
}