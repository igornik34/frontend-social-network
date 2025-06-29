import {useAuth} from "../../modules/auth/context/AuthContext.tsx";
import {NotificationsList} from "../../modules/notifications/components/NotificationsList/NotificationsList.tsx";

export function NotificationsPage() {
    return (
        <>
            <NotificationsList />
        </>
    )
}