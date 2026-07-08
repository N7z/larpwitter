import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, MessageSquare, Users } from 'lucide-react';
import { MotionConfig } from 'motion/react';
import { PropsWithChildren } from 'react';
import ThemeToggle from '@/components/theme-toggle';
import { Shared } from '@/types';

const NAV_ITEMS = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/posts', label: 'Posts', icon: MessageSquare },
];

export default function AdminLayout({ children }: PropsWithChildren) {
    const { url } = usePage<Shared>();

    return (
        <MotionConfig reducedMotion="user">
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
                <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                    <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
                        <Link href="/admin" className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                            <img src="/favicon.png" alt="" className="h-10 w-10 rounded-sm" />
                            Larpwitter Admin
                        </Link>
                        <div className="flex items-center gap-4">
                            <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                                Back to app
                            </Link>
                            <ThemeToggle />
                        </div>
                    </div>
                </header>

                <div className="mx-auto flex max-w-5xl gap-6 px-4 py-6">
                    <nav className="w-44 shrink-0 space-y-1 text-sm">
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const active = item.href === '/admin' ? url === '/admin' : url.startsWith(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-2 rounded-lg px-3 py-2 font-medium transition ${
                                        active
                                            ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400'
                                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <main className="min-w-0 flex-1">{children}</main>
                </div>
            </div>
        </MotionConfig>
    );
}
