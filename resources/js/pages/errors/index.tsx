import { Link } from '@inertiajs/react';
import Seo from '@/components/seo';
import AppLayout from '@/layouts/app-layout';

interface ErrorPageProps {
    status: number;
}

const MESSAGES: Record<number, { title: string; description: string }> = {
    403: { title: 'Forbidden', description: "You don't have permission to view this page." },
    404: { title: 'Page not found', description: "This page doesn't exist or may have been removed." },
    419: { title: 'Page expired', description: 'Your session timed out. Please refresh and try again.' },
    429: { title: 'Too many requests', description: 'Slow down a moment and try again shortly.' },
    500: { title: 'Server error', description: 'Something went wrong on our end. Please try again later.' },
    503: { title: 'Service unavailable', description: "We're down for maintenance. Check back soon." },
};

export default function ErrorPage({ status }: ErrorPageProps) {
    const { title, description } = MESSAGES[status] ?? {
        title: 'Something went wrong',
        description: 'An unexpected error occurred.',
    };

    return (
        <AppLayout>
            <Seo title={title} />

            <div className="flex flex-col items-center rounded-lg border border-gray-200 bg-white px-6 py-16 text-center">
                <p className="text-6xl font-black text-sky-500">{status}</p>
                <h1 className="mt-4 text-xl font-bold text-gray-900">{title}</h1>
                <p className="mt-2 max-w-sm text-sm text-gray-500">{description}</p>
                <Link
                    href="/"
                    className="mt-6 rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-600"
                >
                    Back home
                </Link>
            </div>
        </AppLayout>
    );
}
