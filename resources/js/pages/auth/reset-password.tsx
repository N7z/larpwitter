import { Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import Button from '@/components/button';
import Seo from '@/components/seo';
import TextField from '@/components/text-field';
import GuestLayout from '@/layouts/guest-layout';

interface ResetPasswordProps {
    token: string;
    valid: boolean;
}

export default function ResetPassword({ token, valid }: ResetPasswordProps) {
    const form = useForm({
        token,
        password: '',
        password_confirmation: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post('/reset-password', {
            onFinish: () => form.reset('password', 'password_confirmation'),
        });
    }

    if (!valid) {
        return (
            <GuestLayout>
                <Seo title="Reset password" />
                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    This password reset link is invalid or has expired. Ask an admin to generate a new one.
                </p>
                <Link href="/login" className="mt-4 block text-center text-sm font-medium text-sky-600 hover:underline dark:text-sky-400">
                    Back to log in
                </Link>
            </GuestLayout>
        );
    }

    return (
        <GuestLayout>
            <Seo title="Reset password" />

            <form onSubmit={submit}>
                <TextField
                    label="New password"
                    type="password"
                    value={form.data.password}
                    onChange={(e) => form.setData('password', e.target.value)}
                    error={form.errors.password}
                    autoFocus
                />
                <TextField
                    label="Confirm new password"
                    type="password"
                    value={form.data.password_confirmation}
                    onChange={(e) => form.setData('password_confirmation', e.target.value)}
                    error={form.errors.password_confirmation}
                />
                <Button type="submit" disabled={form.processing} className="w-full">
                    Reset password
                </Button>
            </form>
        </GuestLayout>
    );
}
