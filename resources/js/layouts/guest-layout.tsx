import { PropsWithChildren } from 'react';

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-sm">
                <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">Larpwitter</h1>
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">{children}</div>
            </div>
        </div>
    );
}
