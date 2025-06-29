import {
    FaBell as SystemIcon,
    FaComment as CommentIcon, FaEnvelope as MessageIcon,
    FaHeart as LikeIcon,
    FaReply as ReplyIcon,
    FaUserPlus as FollowerIcon, FaUsers as ChatInviteIcon
} from "react-icons/fa";
import {NotificationType} from "../types/models/UserNotification.ts";

export const NotificationIcon = ({ type }: { type: NotificationType }) => {
    const iconSize = 16;

    switch (type) {
        case 'POST_LIKE':
        case 'COMMENT_LIKE':
            return <LikeIcon size={iconSize} color="#ff6b6b" />;
        case 'NEW_FOLLOWER':
            return <FollowerIcon size={iconSize} color="#4dabf7" />;
        case 'NEW_COMMENT':
            return <CommentIcon size={iconSize} color="#15aabf" />;
        case 'COMMENT_REPLY':
            return <ReplyIcon size={iconSize} color="#5c7cfa" />;
        case 'NEW_MESSAGE':
            return <MessageIcon size={iconSize} color="#9775fa" />;
        case 'CHAT_INVITE':
            return <ChatInviteIcon size={iconSize} color="#20c997" />;
        case 'SYSTEM':
            return <SystemIcon size={iconSize} color="#ffd43b" />;
        default:
            return <SystemIcon size={iconSize} />;
    }
};