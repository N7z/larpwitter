import { Bell, BellOff, BellRing } from 'lucide-react';
import { useEffect, useState } from 'react';

type Permission = NotificationPermission | 'unsupported';

function currentPermission(): Permission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        return 'unsupported';
    }
    return Notification.permission;
}

export default function NotificationPermissionButton() {
    const [permission, setPermission] = useState<Permission>('unsupported');

    useEffect(() => {
        setPermission(currentPermission());
    }, []);

    if (permission === 'unsupported') {
        return null;
    }

    if (permission === 'granted') {
        return (
            <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <BellRing className="h-4 w-4" />
                Browser notifications on
            </span>
        );
    }

    if (permission === 'denied') {
        return (
            <span className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                <BellOff className="h-4 w-4" />
                Notifications blocked in browser settings
            </span>
        );
    }

    const request = async () => {
        const result = await Notification.requestPermission();
        setPermission(result);
    };

    return (
        <button
            type="button"
            onClick={request}
            className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
        >
            <Bell className="h-4 w-4" />
            Enable browser notifications
        </button>
    );
}
