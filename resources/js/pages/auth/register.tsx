import { Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import Button from '@/components/button';
import Seo from '@/components/seo';
import TextField from '@/components/text-field';
import Turnstile from '@/components/turnstile';
import GuestLayout from '@/layouts/guest-layout';

interface RegisterProps {
    turnstileSiteKey: string;
}

export default function Register({ turnstileSiteKey }: RegisterProps) {
    const form = useForm({
        username: '',
        display_name: '',
        password: '',
        password_confirmation: '',
        'cf-turnstile-response': '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post('/register', {
            onFinish: () => form.reset('password', 'password_confirmation'),
        });
    }

    return (
        <GuestLayout>
            <Seo title="Sign up" />

            <form onSubmit={submit}>
                <TextField
                    label="Username"
                    value={form.data.username}
                    onChange={(e) => form.setData('username', e.target.value)}
                    error={form.errors.username}
                    autoFocus
                />
                <TextField
                    label="Display name"
                    value={form.data.display_name}
                    onChange={(e) => form.setData('display_name', e.target.value)}
                    error={form.errors.display_name}
                />
                <TextField
                    label="Password"
                    type="password"
                    value={form.data.password}
                    onChange={(e) => form.setData('password', e.target.value)}
                    error={form.errors.password}
                />
                <TextField
                    label="Confirm password"
                    type="password"
                    value={form.data.password_confirmation}
                    onChange={(e) => form.setData('password_confirmation', e.target.value)}
                />
                <Turnstile
                    siteKey={turnstileSiteKey}
                    onVerify={(token) => form.setData('cf-turnstile-response', token)}
                    error={form.errors['cf-turnstile-response']}
                />
                <Button type="submit" disabled={form.processing} className="w-full">
                    Register
                </Button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-sky-600 hover:underline">
                    Log in
                </Link>
            </p>
        </GuestLayout>
    );
}
