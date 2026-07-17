import { NotificationItem } from '@/types';

export function notificationMessage(notification: NotificationItem): string {
    const name = notification.actor?.display_name ?? 'Someone';

    switch (notification.type) {
        case 'like':
            return `${name} liked your post`;
        case 'reply':
            return `${name} replied to your post`;
        case 'repost':
            return notification.is_quote ? `${name} quoted your post` : `${name} reposted your post`;
        case 'follow':
            return `${name} started following you`;
        case 'mention':
            return `${name} mentioned you`;
        case 'verified':
            return `${name} verified your account`;
        case 'admin':
            return `${name} made you an admin`;
        case 'post_removed':
            return `${name} removed one of your posts`;
        case 'typing_race':
            return `${name} challenged you to a typing race`;
    }
}

const LINKS_TO_ACTOR: NotificationItem['type'][] = ['follow', 'verified', 'admin'];

export function notificationHref(notification: NotificationItem): string | null {
    if (notification.type === 'typing_race') {
        return notification.race_id ? `/games/typing-race/${notification.race_id}` : null;
    }

    if (LINKS_TO_ACTOR.includes(notification.type)) {
        return notification.actor ? `/u/${notification.actor.username}` : null;
    }

    return notification.post_id ? `/posts/${notification.post_id}` : null;
}
