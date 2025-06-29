import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from "../../auth/context/AuthContext.tsx";
import { MediaConnection } from "peerjs";
import {CallEvent, callWebSocketService} from "../services/calls.websoket.ts";

// Пути к звуковым файлам
const incomingCallSound = '/incoming-call.mp3';
const waitingSound = '/waiting.mp3';

/**
 * Интерфейс состояния звонка
 */
export interface CallStatus {
    isActive: boolean;       // Активен ли звонок
    isMuted: boolean;       // Микрофон отключен
    isVideoOn: boolean;     // Видео включено
    isScreenSharing: boolean; // Демонстрация экрана
    callType: 'audio' | 'video'; // Тип звонка
}

export interface CallState {
    callDuration: number;     // Длительность звонка в секундах
    callStartTime: Date | null; // Время начала звонка
    currentCallId: string | null; // ID текущего звонка
    incomingCall: CallEvent | null; // Данные входящего звонка
    localStream: MediaStream | null; // Локальный медиапоток
    remoteStream: MediaStream | null; // Удаленный медиапоток
    localStatus: CallStatus;  // Статус локального пользователя
    remoteStatus: CallStatus; // Статус удаленного пользователя
}

export interface RecipientCall {
    id: string
    avatar: string
    name: string
}

/**
 * Хук для управления звонками через WebRTC
 * @param initialRecipientId ID получателя звонка по умолчанию
 */
export function useCall(initialRecipientId: RecipientCall | null = null) {
    // Получаем данные аутентификации
    const { authData } = useAuth();
    const [recipient, setRecipient] = useState(initialRecipientId);

    // Состояние звонка
    const [state, setState] = useState<CallState>({
        callDuration: 0,
        callStartTime: null,
        currentCallId: null,
        incomingCall: null,
        localStream: null,
        remoteStream: null,
        localStatus: {
            isActive: false,
            isMuted: false,
            isVideoOn: false,
            isScreenSharing: false,
            callType: 'audio'
        },
        remoteStatus: {
            isActive: false,
            isMuted: false,
            isVideoOn: false,
            isScreenSharing: false,
            callType: 'audio'
        }
    });

    // Рефы для хранения соединений и данных
    const mediaConnectionRef = useRef<MediaConnection | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const previousStreamRef = useRef<MediaStream | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Инициализация аудио элемента для звуков звонка
    useEffect(() => {
        const audioElement = new Audio();
        audioElement.loop = true;
        audioRef.current = audioElement;

        // Handle potential errors
        const handleError = () => {
            console.error("Audio playback failed:", audioElement.error);
        };

        audioElement.addEventListener('error', handleError);

        return () => {
            audioElement.removeEventListener('error', handleError);
            audioElement.pause();
            audioRef.current = null;
        };
    }, []);

    const playAudio = useCallback((src: string) => {
        if (!audioRef.current) return;

        try {
            // Only change source if it's different
            if (audioRef.current.src !== src) {
                audioRef.current.src = src;
            }

            // Reset position and play
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => {
                console.error("Audio play failed:", e);
                // Fallback: try again with different format if available
            });
        } catch (e) {
            console.error("Audio setup failed:", e);
        }
    }, []);

    const playIncomingCallSound = useCallback(() => {
        playAudio(incomingCallSound);
    }, [playAudio]);

    const playWaitingSound = useCallback(() => {
        playAudio(waitingSound);
    }, [playAudio]);

    const stopAllSounds = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, []);

    /**
     * Очистка ресурсов звонка
     */
    const cleanup = useCallback(() => {
        // Останавливаем все медиапотоки
        state.localStream?.getTracks().forEach(track => track.stop());
        state.remoteStream?.getTracks().forEach(track => track.stop());

        // Закрываем соединение
        mediaConnectionRef.current?.close();
        mediaConnectionRef.current = null;
        previousStreamRef.current = null;

        // Останавливаем звуки
        stopAllSounds();

        // Очищаем таймер
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, [state.localStream, state.remoteStream, stopAllSounds]);

    /**
     * Замена медиатрака в соединении
     * @param kind Тип трека ('audio' или 'video')
     * @param newTrack Новый медиатрэк
     */
    const replaceTrack = async (kind: 'audio' | 'video', newTrack: MediaStreamTrack | null) => {
        if (!mediaConnectionRef.current) return;

        const senders = mediaConnectionRef.current.peerConnection.getSenders();
        const sender = senders.find(s => s.track?.kind === kind);

        if (sender && newTrack) {
            await sender.replaceTrack(newTrack);
        }
    };

    /**
     * Создание нового медиапотока
     * @param constraints Ограничения для медиапотока
     */
    const createMediaStream = async (constraints: MediaStreamConstraints) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);

            // Очищаем предыдущий поток
            if (state.localStream) {
                previousStreamRef.current = state.localStream;
                setTimeout(() => {
                    previousStreamRef.current?.getTracks().forEach(track => track.stop());
                    previousStreamRef.current = null;
                }, 1000);
            }

            // Обновляем соединение PeerConnection
            if (mediaConnectionRef.current) {
                const senders = mediaConnectionRef.current.peerConnection.getSenders();

                // Обновляем аудио
                const audioTrack = stream.getAudioTracks()[0];
                if (audioTrack) {
                    const audioSender = senders.find(s => s.track?.kind === 'audio');
                    if (audioSender) {
                        await audioSender.replaceTrack(audioTrack);
                    } else {
                        mediaConnectionRef.current.peerConnection.addTrack(audioTrack, stream);
                    }
                }

                // Обновляем видео (если нужно)
                if (constraints.video) {
                    const videoTrack = stream.getVideoTracks()[0];
                    if (videoTrack) {
                        const videoSender = senders.find(s => s.track?.kind === 'video');
                        if (videoSender) {
                            await videoSender.replaceTrack(videoTrack);
                        } else {
                            mediaConnectionRef.current.peerConnection.addTrack(videoTrack, stream);
                        }
                    }
                }
            }

            return stream;
        } catch (error) {
            console.error('Error creating media stream:', error);
            throw error;
        }
    };

    /**
     * Завершение звонка
     */
    const endCall = useCallback(() => {
        if (state.currentCallId) {
            callWebSocketService.endCall(state.currentCallId);
        }

        cleanup();

        // Сбрасываем состояние
        setState(prev => ({
            ...prev,
            callDuration: 0,
            callStartTime: null,
            currentCallId: null,
            incomingCall: null,
            localStream: null,
            remoteStream: null,
            localStatus: {
                ...prev.localStatus,
                isActive: false,
                isScreenSharing: false,
                isVideoOn: false,
                callType: 'audio'
            },
            remoteStatus: {
                ...prev.remoteStatus,
                isActive: false,
                isVideoOn: false,
                callType: 'audio'
            }
        }));
    }, [cleanup, state.currentCallId]);

    // Инициализация Peer соединения при монтировании
    useEffect(() => {
        if (!authData || state.currentCallId) return;

        if(!callWebSocketService.getSocket()) {
            callWebSocketService.connect(authData.accessToken, authData.id);
        }
        const peer = callWebSocketService.getPeer();

        if (!peer) return;

        // Обработчик входящего звонка
        const handleIncomingCall = (mediaConnection: MediaConnection) => {
            mediaConnectionRef.current = mediaConnection;

            // Получаем удаленный поток
                mediaConnection.on('stream', (remoteStream) => {
                    setState(prev => ({
                        ...prev,
                        remoteStream,
                    }));
                });

            mediaConnection.on('close', endCall);
        };

        peer.on('call', handleIncomingCall);

    }, [authData, state.currentCallId]);

    // Подписка на события звонка
    useEffect(() => {
        const handlers = {
            incomingCall: (data: CallEvent) => {
                playIncomingCallSound();
                setState(prev => ({
                    ...prev,
                    currentCallId: data.callId,
                    incomingCall: data,
                    localStatus: {
                        ...prev.localStatus,
                        callType: data.callType || 'audio'
                    }
                }));
            },
            callAnswered: (data: CallEvent) => {
                if (data.callId === state.currentCallId) {
                    stopAllSounds();
                    setState(prev => ({
                        ...prev,
                        localStatus: { ...prev.localStatus, isActive: true },
                        remoteStatus: { ...prev.remoteStatus, isActive: true },
                        callStartTime: new Date()
                    }));
                }
            },
            callEnded: (data: { callId: string }) => {
                endCall();
                console.log('call ended')
            },
            statusUpdate: (data: { callId: string; userId: string } & Partial<CallStatus>) => {
                if (data.callId === state.currentCallId) {
                    setState(prev => ({
                        ...prev,
                        remoteStatus: { ...prev.remoteStatus, ...data }
                    }));
                }
            }
        };

        // Подписываемся на события
        callWebSocketService.onIncomingCall(handlers.incomingCall);
        callWebSocketService.onCallAnswered(handlers.callAnswered);
        callWebSocketService.onCallEnded(handlers.callEnded);
        callWebSocketService.onCallStatusUpdate(handlers.statusUpdate);

        // return () => {
        //     // Отписываемся от событий
        //     callWebSocketService.offIncomingCall(handlers.incomingCall);
        //     callWebSocketService.offCallAnswered(handlers.callAnswered);
        //     callWebSocketService.offCallEnded(handlers.callEnded);
        //     callWebSocketService.offCallStatusUpdate(handlers.statusUpdate);
        // };
    }, [state.currentCallId, endCall, playIncomingCallSound, stopAllSounds]);

    /**
     * Начало звонка
     * @param callType Тип звонка ('audio' или 'video')
     */
    const startCall = async (callType: 'audio' | 'video' = 'audio') => {
        try {
            // Получаем медиапоток
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: callType === 'video'
            });

            // Инициируем звонок через WebSocket
            const call = await callWebSocketService.initiateCall(
                recipient!.id,
                `${authData?.firstName} ${authData?.lastName}`,
                authData!.avatar!,
                callType
            );

            const peer = callWebSocketService.getPeer();

            if (peer) {
                playWaitingSound();

                // Устанавливаем соединение Peer-to-Peer
                const mediaConnection = peer.call(recipient!.id, stream);
                mediaConnectionRef.current = mediaConnection;

                // Получаем удаленный поток
                mediaConnection.on('stream', (stream) => {
                    stopAllSounds();
                    setState(prev => ({ ...prev, remoteStream: stream }));
                });

                mediaConnection.on('close', endCall);

                // Обновляем состояние
                setState(prev => ({
                    ...prev,
                    localStream: stream,
                    currentCallId: call.callId,
                    localStatus: {
                        ...prev.localStatus,
                        isActive: true,
                        isVideoOn: callType === 'video',
                        callType
                    },
                    remoteStatus: {
                        ...prev.remoteStatus,
                        isActive: true,
                        isVideoOn: callType === 'video',
                        callType
                    }
                }));
            }
        } catch (error) {
            console.error('Failed to start call:', error);
            endCall();
        }
    };

    /**
     * Ответ на входящий звонок
     */
    const answerCall = async () => {
        if (!state.incomingCall) return;

        try {
            stopAllSounds();

            const callType = state.incomingCall.callType || 'audio';

            // Получаем медиапоток
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: !state.localStatus.isMuted,
                video: callType === 'video'
            });

            // Отправляем ответ через WebSocket
            callWebSocketService.answerCall(state.incomingCall.callId);

            // Отвечаем на звонок
            if (mediaConnectionRef.current) {
                mediaConnectionRef.current.answer(stream);
            }

            // Обновляем состояние
            setState(prev => ({
                ...prev,
                localStream: stream,
                currentCallId: state.incomingCall?.callId || null,
                incomingCall: null,
                localStatus: {
                    ...prev.localStatus,
                    isActive: true,
                    isVideoOn: callType === 'video',
                    callType
                },
                remoteStatus: {
                    ...prev.remoteStatus,
                    isActive: true,
                    isVideoOn: callType === 'video',
                    callType
                },
                callStartTime: new Date()
            }));
        } catch (error) {
            console.error('Failed to answer call:', error);
            endCall();
        }
    };

    /**
     * Обновление статуса звонка
     * @param updates Изменения статуса
     */
    const updateCallStatus = (updates: Partial<CallStatus>) => {
        setState(prev => ({
            ...prev,
            localStatus: { ...prev.localStatus, ...updates }
        }));

        if (state.currentCallId) {
            callWebSocketService.updateCallStatus(state.currentCallId, updates);
        }
    };

    /**
     * Переключение микрофона
     */
    const toggleMute = async () => {
        const newMutedState = !state.localStatus.isMuted;

        if (state.localStream) {
            state.localStream.getAudioTracks().forEach(track => {
                track.enabled = !newMutedState;
            });

            const audioTrack = state.localStream.getAudioTracks()[0];
            if (audioTrack) {
                await replaceTrack('audio', audioTrack);
            }
        }

        updateCallStatus({ isMuted: newMutedState });
    };

    /**
     * Переключение видео
     */
    const toggleVideo = async () => {
        const newVideoState = !state.localStatus.isVideoOn;

        try {
            // Выключение видео
            if (!newVideoState) {
                state.localStream?.getVideoTracks().forEach(track => {
                    track.stop(); // Останавливаем треки
                });

                updateCallStatus({
                    isVideoOn: false,
                    // Не меняем callType, чтобы звонок оставался видеозвонком
                });
                return;
            }

            // Включение видео
            const constraints = {
                audio: !state.localStatus.isMuted,
                video: true
            };

            // Получаем новый поток с видео
            const newStream = await navigator.mediaDevices.getUserMedia(constraints);

            // Сохраняем аудио из предыдущего потока, если есть
            if (state.localStream) {
                const audioTracks = state.localStream.getAudioTracks();
                audioTracks.forEach(track => {
                    newStream.addTrack(track); // Добавляем аудио в новый поток
                });

                // Останавливаем старый поток (кроме аудио, которое мы перенесли)
                state.localStream.getTracks().forEach(track => {
                    if (track.kind !== 'audio') track.stop();
                });
            }

            // Обновляем соединение PeerConnection
            if (mediaConnectionRef.current) {
                const videoTrack = newStream.getVideoTracks()[0];
                if (videoTrack) {
                    await replaceTrack('video', videoTrack);
                }
            }

            // Обновляем состояние
            setState(prev => ({
                ...prev,
                localStream: newStream,
                localStatus: {
                    ...prev.localStatus,
                    isVideoOn: true,
                    isScreenSharing: false,
                }
            }));

            updateCallStatus({
                isVideoOn: true,
                isScreenSharing: false,
            });

        } catch (error) {
            console.error('Error toggling video:', error);
            // Восстанавливаем предыдущее состояние при ошибке
            updateCallStatus({
                isVideoOn: state.localStatus.isVideoOn,
                callType: state.localStatus.callType
            });
        }
    };

    /**
     * Переключение демонстрации экрана
     */
    const toggleScreenShare = async () => {
        const newScreenShareState = !state.localStatus.isScreenSharing;

        try {
            // Выключение демонстрации экрана
            if (!newScreenShareState) {
                if (state.localStatus.isVideoOn) {
                    const stream = await createMediaStream({
                        audio: !state.localStatus.isMuted,
                        video: true
                    });

                    const videoTrack = stream.getVideoTracks()[0];
                    if (videoTrack) {
                        await replaceTrack('video', videoTrack);
                    }

                    setState(prev => ({
                        ...prev,
                        localStream: stream,
                        localStatus: {
                            ...prev.localStatus,
                            isScreenSharing: false
                        }
                    }));
                } else {
                    state.localStream?.getVideoTracks().forEach(track => track.stop());
                    updateCallStatus({
                        isScreenSharing: false,
                        callType: 'audio'
                    });
                }
                return;
            }

            // Включение демонстрации экрана
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: !state.localStatus.isMuted
            });

            screenStream.getVideoTracks()[0].onended = () => {
                if (state.localStatus.isScreenSharing) {
                    toggleScreenShare();
                }
            };

            const videoTrack = screenStream.getVideoTracks()[0];
            if (videoTrack) {
                await replaceTrack('video', videoTrack);
            }

            if (state.localStream) {
                state.localStream.getAudioTracks().forEach(track => {
                    screenStream.addTrack(track);
                });
            }

            updateCallStatus({
                isScreenSharing: true,
                callType: 'video'
            });

            setState(prev => ({
                ...prev,
                localStream: screenStream,
                localStatus: {
                    ...prev.localStatus,
                    isScreenSharing: true,
                    isVideoOn: true,
                    callType: 'video'
                }
            }));

        } catch (error) {
            console.error('Error toggling screen share:', error);
            updateCallStatus({
                isScreenSharing: state.localStatus.isScreenSharing,
                callType: state.localStatus.callType
            });
        }
    };

    return {
        callState: state,
        startCall,
        answerCall,
        endCall,
        toggleMute,
        toggleVideo,
        toggleScreenShare,
        setRecipient,
        recipient
    };
}