import { router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { notificationHref, notificationMessage } from '@/lib/notifications';
import { NotificationItem } from '@/types';

const POLL_INTERVAL = 20_000;
const SEEN_CAP = 50;

function storageKey(userId: number): string {
    return `larpwitter:seen-notifications:${userId}`;
}

function loadSeen(userId: number): string[] | null {
    try {
        const raw = localStorage.getItem(storageKey(userId));
        return raw === null ? null : (JSON.parse(raw) as string[]);
    } catch {
        return null;
    }
}

function saveSeen(userId: number, ids: string[]): void {
    try {
        localStorage.setItem(storageKey(userId), JSON.stringify(ids.slice(0, SEEN_CAP)));
    } catch {
        // storage may be unavailable (private mode, quota); notifications just won't dedupe across reloads
    }
}

function show(notification: NotificationItem): void {
    const href = notificationHref(notification);
    const browserNotification = new Notification(notificationMessage(notification), {
        body: notification.excerpt ? `"${notification.excerpt}"` : undefined,
        icon: notification.actor?.avatar_url ?? '/favicon.png',
        tag: notification.id,
    });

    browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
        if (href) {
            router.visit(href);
        }
    };
}

export function useBrowserNotifications(userId: number | null): void {
    const seenRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (userId === null || typeof window === 'undefined' || !('Notification' in window)) {
            return;
        }

        const stored = loadSeen(userId);
        seenRef.current = new Set(stored ?? []);
        let seeding = stored === null;
        let cancelled = false;

        const poll = async () => {
            if (document.visibilityState !== 'visible') {
                return;
            }

            try {
                const response = await fetch('/notifications/latest', {
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                });
                if (!response.ok || cancelled) {
                    return;
                }

                const { notifications } = (await response.json()) as { notifications: NotificationItem[] };
                const canNotify = Notification.permission === 'granted';

                notifications
                    .filter((notification) => !seenRef.current.has(notification.id))
                    .reverse()
                    .forEach((notification) => {
                        if (!seeding && canNotify) {
                            show(notification);
                        }
                        seenRef.current.add(notification.id);
                    });

                seeding = false;
                saveSeen(userId, notifications.map((notification) => notification.id));
            } catch {
                // network hiccup; try again on the next tick
            }
        };

        poll();
        const interval = window.setInterval(poll, POLL_INTERVAL);
        document.addEventListener('visibilitychange', poll);

        return () => {
            cancelled = true;
            window.clearInterval(interval);
            document.removeEventListener('visibilitychange', poll);
        };
    }, [userId]);
}
