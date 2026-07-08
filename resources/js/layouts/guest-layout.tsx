import { PropsWithChildren } from 'react';
import Footer from '@/components/footer';
import ThemeToggle from '@/components/theme-toggle';

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col bg-gray-50 px-4 dark:bg-gray-950">
            <div className="flex justify-end pt-4">
                <ThemeToggle />
            </div>
            <div className="flex flex-1 items-center justify-center">
                <div className="w-full max-w-sm">
                    <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">Larpwitter</h1>
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        {children}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
