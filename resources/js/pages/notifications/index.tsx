import { Link } from '@inertiajs/react';
import { Heart, Repeat2, UserPlus } from 'lucide-react';
import Avatar from '@/components/avatar';
import AppLayout from '@/layouts/app-layout';
import { NotificationItem } from '@/types';

interface NotificationsIndexProps {
    notifications: NotificationItem[];
}

const ICONS = {
    like: Heart,
    reply: Heart,
    repost: Repeat2,
    follow: UserPlus,
};

function message(notification: NotificationItem): string {
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
    }
}

export default function NotificationsIndex({ notifications }: NotificationsIndexProps) {
    return (
        <AppLayout>
            <h1 className="mb-4 text-xl font-bold text-gray-900">Notifications</h1>

            <div className="overflow-hidden rounded-lg border border-gray-200">
                {notifications.length === 0 ? (
                    <p className="p-6 text-center text-sm text-gray-500">No notifications yet.</p>
                ) : (
                    notifications.map((notification) => {
                        const Icon = ICONS[notification.type];
                        const href =
                            notification.type === 'follow'
                                ? notification.actor
                                    ? `/u/${notification.actor.username}`
                                    : null
                                : notification.post_id
                                  ? `/posts/${notification.post_id}`
                                  : null;

                        const rowClassName = `flex items-center gap-3 border-b border-gray-200 p-4 ${
                            notification.is_new ? 'bg-sky-50' : 'bg-white'
                        } ${href ? 'hover:bg-gray-100' : ''}`;

                        const content = (
                            <>
                                <Icon className="h-5 w-5 shrink-0 text-gray-400" />
                                {notification.actor && (
                                    <Avatar
                                        username={notification.actor.username}
                                        displayName={notification.actor.display_name}
                                        avatarUrl={notification.actor.avatar_url}
                                        size="sm"
                                    />
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-gray-900">{message(notification)}</p>
                                    <span className="text-xs text-gray-400">{new Date(notification.created_at).toLocaleString()}</span>
                                </div>
                            </>
                        );

                        return href ? (
                            <Link key={notification.id} href={href} className={rowClassName}>
                                {content}
                            </Link>
                        ) : (
                            <div key={notification.id} className={rowClassName}>
                                {content}
                            </div>
                        );
                    })
                )}
            </div>
        </AppLayout>
    );
}
