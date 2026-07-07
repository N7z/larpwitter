import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import Button from '@/components/button';

interface PostComposerProps {
    action: string;
    placeholder?: string;
    onOptimisticSubmit?: (body: string) => void;
}

export default function PostComposer({ action, placeholder = "What's happening?", onOptimisticSubmit }: PostComposerProps) {
    const form = useForm({ body: '' });

    function submit(e: FormEvent) {
        e.preventDefault();
        const body = form.data.body;

        onOptimisticSubmit?.(body);

        form.post(action, {
            preserveScroll: true,
            onSuccess: () => form.reset('body'),
        });
    }

    const remaining = 280 - form.data.body.length;

    return (
        <form onSubmit={submit} className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
            <textarea
                value={form.data.body}
                onChange={(e) => form.setData('body', e.target.value)}
                placeholder={placeholder}
                rows={3}
                maxLength={280}
                className="w-full resize-none border-none text-sm text-gray-900 focus:outline-none"
            />
            {form.errors.body && <p className="mt-1 text-sm text-red-600">{form.errors.body}</p>}
            <div className="mt-2 flex items-center justify-between">
                <span className={`text-xs ${remaining < 20 ? 'text-red-500' : 'text-gray-400'}`}>{remaining}</span>
                <Button type="submit" disabled={form.data.body.trim().length === 0}>
                    Post
                </Button>
            </div>
        </form>
    );
}
