import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { Shared } from '@/types';

export default function AppLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<Shared>().props;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
                    <Link href="/" className="text-lg font-bold text-gray-900">
                        Larpwitter
                    </Link>
                    <nav className="flex items-center gap-4 text-sm">
                        {auth.user && (
                            <Link href={`/u/${auth.user.username}`} className="text-gray-700 hover:underline">
                                @{auth.user.username}
                            </Link>
                        )}
                        <Link href="/logout" method="post" as="button" className="text-gray-500 hover:text-gray-900">
                            Log out
                        </Link>
                    </nav>
                </div>
            </header>
            <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
        </div>
    );
}
