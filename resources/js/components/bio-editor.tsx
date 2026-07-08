import { useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import Button from '@/components/button';

interface BioEditorProps {
    bio: string | null;
    onSaved?: (bio: string | null) => void;
}

export default function BioEditor({ bio, onSaved }: BioEditorProps) {
    const [editing, setEditing] = useState(false);
    const form = useForm({ bio: bio ?? '' });

    function submit(e: FormEvent) {
        e.preventDefault();

        form.post('/profile/bio', {
            preserveScroll: true,
            onSuccess: () => {
                setEditing(false);
                onSaved?.(form.data.bio || null);
            },
        });
    }

    function cancel() {
        setEditing(false);
        form.reset();
        form.clearErrors();
    }

    if (!editing) {
        return (
            <div className="mt-1">
                {bio && <p className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">{bio}</p>}
                <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="text-sm font-medium text-sky-600 hover:underline dark:text-sky-400"
                >
                    {bio ? 'Edit bio' : 'Add bio'}
                </button>
            </div>
        );
    }

    const remaining = 160 - form.data.bio.length;

    return (
        <form onSubmit={submit} className="mt-1">
            <textarea
                value={form.data.bio}
                onChange={(e) => form.setData('bio', e.target.value)}
                placeholder="Tell people about yourself"
                rows={2}
                maxLength={160}
                autoFocus
                className="w-full resize-none rounded-lg border border-gray-200 p-2 text-sm text-gray-900 focus:border-sky-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
            {form.errors.bio && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{form.errors.bio}</p>}
            <div className="mt-1 flex items-center justify-between">
                <span className={`text-xs ${remaining < 20 ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`}>
                    {remaining}
                </span>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={cancel}
                        className="rounded-full px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        Cancel
                    </button>
                    <Button type="submit" disabled={form.processing} className="px-3 py-1.5">
                        Save
                    </Button>
                </div>
            </div>
        </form>
    );
}
