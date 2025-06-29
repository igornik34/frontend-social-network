import {UserNotification} from "../types/models/UserNotification.ts";

export const getNotificationText = (notification: UserNotification) => {
    const userName = notification.user?.firstName ? `${notification.user.firstName} ${notification.user.lastName}` : 'Пользователь'

    switch (notification.type) {
        case 'POST_LIKE':
            return `${userName} оценил(а) ваш пост ${notification.metadata}`;
        case 'COMMENT_LIKE':
            return `${userName} оценил(а) ваш комментарий ${notification.metadata}`;
        case 'NEW_FOLLOWER':
            return `${userName} подписался(ась) на вас ${notification.metadata}`;
        case 'NEW_COMMENT':
            return `${userName} прокомментировал(а) ваш пост ${notification.metadata}`;
        case 'COMMENT_REPLY':
            return `${userName} ответил(а) на ваш комментарий ${notification.metadata}`;
        case 'NEW_MESSAGE':
            return `Новое сообщение от ${userName} ${notification.metadata}`;
        case 'CHAT_INVITE':
            return `${userName} пригласил(а) вас в чат ${notification.metadata}`;
        case 'SYSTEM':
            return 'Системное уведомление';
        default:
            return 'Новое уведомление';
    }
};