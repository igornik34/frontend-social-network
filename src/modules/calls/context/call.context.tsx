import React, { createContext, useContext, useEffect, useState } from 'react';
import {RecipientCall, useCall} from '../hooks/useCall';
import {IncomingCallNotification} from "../components/IncomingCallNotification/IncomingCallNotification.tsx";
import {GlobalCallUI} from "../components/GlobalCallUI/GlobalCallUI.tsx";

type CallContextType = ReturnType<typeof useCall>;

const CallContext = createContext<CallContextType | null>(null);

interface CallProviderProps {
    children: React.ReactNode;
    initialRecipientId?: string;
}

export const CallProvider = ({ children, initialRecipientId = '' }: CallProviderProps) => {
    const call = useCall(initialRecipientId);
    const [showIncomingCall, setShowIncomingCall] = useState(false);

    // Отслеживаем входящий вызов
    useEffect(() => {
        if (call.callState.incomingCall) {
            setShowIncomingCall(true);
        } else {
            setShowIncomingCall(false);
        }
    }, [call.callState.incomingCall]);

    return (
        <CallContext.Provider value={call}>
            {children}
            {showIncomingCall && <IncomingCallNotification />}
            <GlobalCallUI />
        </CallContext.Provider>
    );
};

export const useCallContext = () => {
    const context = useContext(CallContext);
    if (!context) {
        throw new Error('useCallContext must be used within a CallProvider');
    }
    return context;
};

export const useCurrentCall = (recipient: RecipientCall) => {
    const call = useCallContext();

    useEffect(() => {
        call.setRecipient(recipient);
    }, []);

    return call;
};