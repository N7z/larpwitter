import { useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import Button from '@/components/button';

interface DisplayNameEditorProps {
    displayName: string;
    onSaved?: (displayName: string) => void;
}

export default function DisplayNameEditor({ displayName, onSaved }: DisplayNameEditorProps) {
    const [editing, setEditing] = useState(false);
    const form = useForm({ display_name: displayName });

    function submit(e: FormEvent) {
        e.preventDefault();

        form.post('/profile/display-name', {
            preserveScroll: true,
            onSuccess: () => {
                setEditing(false);
                onSaved?.(form.data.display_name);
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
            <button type="button" onClick={() => setEditing(true)} className="text-sm font-medium text-sky-600 hover:underline dark:text-sky-400">
                Edit name
            </button>
        );
    }

    return (
        <form onSubmit={submit}>
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={form.data.display_name}
                    onChange={(e) => form.setData('display_name', e.target.value)}
                    maxLength={50}
                    autoFocus
                    className="rounded-lg border border-gray-200 px-2 py-1 text-sm text-gray-900 focus:border-sky-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />
                <Button type="submit" disabled={form.processing} className="px-3 py-1.5">
                    Save
                </Button>
                <button
                    type="button"
                    onClick={cancel}
                    className="rounded-full px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                    Cancel
                </button>
            </div>
            {form.errors.display_name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{form.errors.display_name}</p>}
        </form>
    );
}
