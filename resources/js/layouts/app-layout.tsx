import { Link, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { MotionConfig } from 'motion/react';
import { PropsWithChildren } from 'react';
import Avatar from '@/components/avatar';
import { Shared } from '@/types';

export default function AppLayout({ children }: PropsWithChildren) {
    const { auth, unreadNotificationsCount } = usePage<Shared>().props;

    return (
        <MotionConfig reducedMotion="user">
            <div className="min-h-screen bg-gray-50">
                <header className="border-b border-gray-200 bg-white">
                    <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
                        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-gray-900">
                            <img src="/favicon.png" alt="" className="h-10 w-10 rounded-sm" />
                            Larpwitter
                        </Link>
                        <nav className="flex items-center gap-4 text-sm">
                            {auth.user && (
                                <>
                                    <Link href="/notifications" className="relative text-gray-500 hover:text-gray-900" aria-label="Notifications">
                                        <Bell className="h-5 w-5" />
                                        {unreadNotificationsCount > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                                                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                                            </span>
                                        )}
                                    </Link>
                                    <Link href={`/u/${auth.user.username}`} className="flex items-center gap-2 text-gray-700 hover:underline">
                                        <Avatar
                                            username={auth.user.username}
                                            displayName={auth.user.display_name}
                                            avatarUrl={auth.user.avatar_url}
                                            size="sm"
                                        />
                                        @{auth.user.username}
                                    </Link>
                                </>
                            )}
                            <Link href="/logout" method="post" as="button" className="text-gray-500 hover:text-gray-900">
                                Log out
                            </Link>
                        </nav>
                    </div>
                </header>
                <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
            </div>
        </MotionConfig>
    );
}
