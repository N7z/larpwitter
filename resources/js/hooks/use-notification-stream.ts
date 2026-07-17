import { useEffect } from 'react';
import { NOTIFICATION_EVENT } from '@/hooks/use-browser-notifications';
import { NotificationItem } from '@/types';

/**
 * Listens to the server-sent events stream and re-dispatches each new
 * notification as a window event for the toast stack (and anything else).
 *
 * The server closes each stream after ~50s to free the worker; EventSource
 * reconnects on its own. The stream is paused while the tab is hidden.
 */
export function useNotificationStream(userId: number | null): void {
    useEffect(() => {
        if (userId === null || typeof window === 'undefined' || !('EventSource' in window)) {
            return;
        }

        let source: EventSource | null = null;

        function onNotification(event: MessageEvent) {
            try {
                const item = JSON.parse(event.data) as NotificationItem;
                window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, { detail: item }));
            } catch {
                // malformed payload; skip
            }
        }

        function connect() {
            if (source) return;
            source = new EventSource('/notifications/stream');
            source.addEventListener('notification', onNotification);
        }

        function disconnect() {
            source?.close();
            source = null;
        }

        function onVisibilityChange() {
            if (document.visibilityState === 'visible') {
                connect();
            } else {
                disconnect();
            }
        }

        onVisibilityChange();
        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', onVisibilityChange);
            disconnect();
        };
    }, [userId]);
}
