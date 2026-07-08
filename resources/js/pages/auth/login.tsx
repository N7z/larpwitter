import { Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import Button from '@/components/button';
import Seo from '@/components/seo';
import TextField from '@/components/text-field';
import Turnstile from '@/components/turnstile';
import GuestLayout from '@/layouts/guest-layout';

interface LoginProps {
    turnstileSiteKey: string;
}

export default function Login({ turnstileSiteKey }: LoginProps) {
    const form = useForm({
        username: '',
        password: '',
        'cf-turnstile-response': '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post('/login', {
            onFinish: () => form.reset('password'),
        });
    }

    return (
        <GuestLayout>
            <Seo title="Log in" />

            <form onSubmit={submit}>
                <TextField
                    label="Username"
                    value={form.data.username}
                    onChange={(e) => form.setData('username', e.target.value)}
                    error={form.errors.username}
                    autoFocus
                />
                <TextField
                    label="Password"
                    type="password"
                    value={form.data.password}
                    onChange={(e) => form.setData('password', e.target.value)}
                    error={form.errors.password}
                />
                <Turnstile
                    siteKey={turnstileSiteKey}
                    onVerify={(token) => form.setData('cf-turnstile-response', token)}
                    error={form.errors['cf-turnstile-response']}
                />
                <Button type="submit" disabled={form.processing} className="w-full">
                    Log in
                </Button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-600">
                No account?{' '}
                <Link href="/register" className="font-medium text-sky-600 hover:underline">
                    Register
                </Link>
            </p>
        </GuestLayout>
    );
}
