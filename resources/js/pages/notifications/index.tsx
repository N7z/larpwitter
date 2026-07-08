import { Link } from '@inertiajs/react';
import { AtSign, BadgeCheck, Heart, MessageCircle, Repeat2, ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import Avatar from '@/components/avatar';
import NotificationPermissionButton from '@/components/notification-permission-button';
import Seo from '@/components/seo';
import AppLayout from '@/layouts/app-layout';
import { notificationHref, notificationMessage } from '@/lib/notifications';
import { NotificationItem } from '@/types';

interface NotificationsIndexProps {
    notifications: NotificationItem[];
}

const ICONS = {
    like: Heart,
    reply: MessageCircle,
    repost: Repeat2,
    follow: UserPlus,
    mention: AtSign,
    verified: BadgeCheck,
    admin: ShieldCheck,
    post_removed: Trash2,
};

export default function NotificationsIndex({ notifications }: NotificationsIndexProps) {
    return (
        <AppLayout>
            <Seo title="Notifications" />

            <div className="mb-4 flex items-center justify-between gap-3">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Notifications</h1>
                <NotificationPermissionButton />
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                {notifications.length === 0 ? (
                    <p className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">No notifications yet.</p>
                ) : (
                    notifications.map((notification) => {
                        const Icon = ICONS[notification.type];
                        const href = notificationHref(notification);

                        const rowClassName = `flex items-center gap-3 border-b border-gray-200 p-4 dark:border-gray-800 ${
                            notification.is_new ? 'bg-sky-50 dark:bg-sky-950/40' : 'bg-white dark:bg-gray-900'
                        } ${href ? 'hover:bg-gray-100 dark:hover:bg-gray-800' : ''}`;

                        const content = (
                            <>
                                <Icon className="h-5 w-5 shrink-0 text-gray-400 dark:text-gray-500" />
                                {notification.actor && (
                                    <Avatar
                                        username={notification.actor.username}
                                        displayName={notification.actor.display_name}
                                        avatarUrl={notification.actor.avatar_url}
                                        size="sm"
                                    />
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-gray-900 dark:text-gray-100">{notificationMessage(notification)}</p>
                                    {notification.type === 'post_removed' && notification.excerpt && (
                                        <p className="mt-0.5 truncate text-xs text-gray-500 italic dark:text-gray-400">
                                            "{notification.excerpt}"
                                        </p>
                                    )}
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                        {new Date(notification.created_at).toLocaleString()}
                                    </span>
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
