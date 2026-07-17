import { router } from '@inertiajs/react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Avatar from '@/components/avatar';
import { NOTIFICATION_EVENT } from '@/hooks/use-browser-notifications';
import { notificationHref, notificationMessage } from '@/lib/notifications';
import { NotificationItem } from '@/types';

const TOAST_DURATION_MS = 6000;
const MAX_TOASTS = 4;

export default function NotificationToasts() {
    const [toasts, setToasts] = useState<NotificationItem[]>([]);
    // Both the SSE stream and the slower fetch poll dispatch NOTIFICATION_EVENT,
    // so the same notification can arrive twice.
    const seenRef = useRef<Set<string>>(new Set());

    const dismiss = useCallback((id: string) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    useEffect(() => {
        function onNotification(event: Event) {
            const notification = (event as CustomEvent<NotificationItem>).detail;
            if (seenRef.current.has(notification.id)) return;
            seenRef.current.add(notification.id);
            setToasts((current) => [...current.slice(-(MAX_TOASTS - 1)), notification]);
            setTimeout(() => dismiss(notification.id), TOAST_DURATION_MS);
        }

        window.addEventListener(NOTIFICATION_EVENT, onNotification);
        return () => window.removeEventListener(NOTIFICATION_EVENT, onNotification);
    }, [dismiss]);

    return (
        <div className="fixed right-4 bottom-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
            <AnimatePresence>
                {toasts.map((toast) => {
                    const href = notificationHref(toast);

                    return (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 16 }}
                            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-900"
                        >
                            {toast.actor && (
                                <Avatar
                                    username={toast.actor.username}
                                    displayName={toast.actor.display_name}
                                    avatarUrl={toast.actor.avatar_url}
                                    size="sm"
                                />
                            )}
                            <button
                                type="button"
                                className={`min-w-0 flex-1 text-left text-sm text-gray-900 dark:text-gray-100 ${href ? 'cursor-pointer' : 'cursor-default'}`}
                                onClick={() => {
                                    dismiss(toast.id);
                                    if (href) router.visit(href);
                                }}
                            >
                                {notificationMessage(toast)}
                                {toast.excerpt && (
                                    <span className="mt-0.5 block truncate text-xs text-gray-500 italic dark:text-gray-400">
                                        "{toast.excerpt}"
                                    </span>
                                )}
                            </button>
                            <button
                                type="button"
                                aria-label="Dismiss"
                                onClick={() => dismiss(toast.id)}
                                className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
