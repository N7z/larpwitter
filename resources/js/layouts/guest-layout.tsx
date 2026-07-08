import { PropsWithChildren } from 'react';
import Footer from '@/components/footer';

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col bg-gray-50 px-4">
            <div className="flex flex-1 items-center justify-center">
                <div className="w-full max-w-sm">
                    <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">Larpwitter</h1>
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">{children}</div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
