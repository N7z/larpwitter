import { Link, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { MotionConfig } from 'motion/react';
import { PropsWithChildren } from 'react';
import Avatar from '@/components/avatar';
import Footer from '@/components/footer';
import RightSidebar from '@/components/right-sidebar';
import ThemeToggle from '@/components/theme-toggle';
import { useBrowserNotifications } from '@/hooks/use-browser-notifications';
import { Shared } from '@/types';

export default function AppLayout({ children }: PropsWithChildren) {
    const { auth, unreadNotificationsCount } = usePage<Shared>().props;

    useBrowserNotifications(auth.user?.id ?? null);

    return (
        <MotionConfig reducedMotion="user">
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
                <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                    <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
                        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                            <img src="/favicon.png" alt="" className="h-10 w-10 rounded-sm" />
                            Larpwitter
                        </Link>
                        <nav className="flex items-center gap-4 text-sm">
                            {auth.user ? (
                                <>
                                    {auth.user.is_admin && (
                                        <Link href="/admin" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                                            Admin
                                        </Link>
                                    )}
                                    <Link
                                        href="/notifications"
                                        className="relative text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                                        aria-label="Notifications"
                                    >
                                        <Bell className="h-5 w-5" />
                                        {unreadNotificationsCount > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                                                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                                            </span>
                                        )}
                                    </Link>
                                    <Link
                                        href={`/u/${auth.user.username}`}
                                        className="flex items-center gap-2 text-gray-700 hover:underline dark:text-gray-300"
                                    >
                                        <Avatar
                                            username={auth.user.username}
                                            displayName={auth.user.display_name}
                                            avatarUrl={auth.user.avatar_url}
                                            size="sm"
                                        />
                                        @{auth.user.username}
                                    </Link>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                                    >
                                        Log out
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                                        Log in
                                    </Link>
                                    <Link href="/register" className="font-semibold text-sky-600 hover:underline dark:text-sky-400">
                                        Sign up
                                    </Link>
                                </>
                            )}
                            <ThemeToggle />
                        </nav>
                    </div>
                </header>
                <div className="mx-auto flex max-w-5xl gap-6 px-4 py-6">
                    <main className="min-w-0 flex-1">{children}</main>
                    <aside className="hidden w-72 shrink-0 lg:block">
                        <RightSidebar />
                    </aside>
                </div>
                <Footer />
            </div>
        </MotionConfig>
    );
}
