import { useForm } from '@inertiajs/react';
import { ChangeEvent, ClipboardEvent, FormEvent, useEffect, useRef, useState } from 'react';
import Button from '@/components/button';

interface PostComposerProps {
    action: string;
    placeholder?: string;
    onOptimisticSubmit?: (body: string, imageUrl: string | null) => void;
}

export default function PostComposer({ action, placeholder = "What's happening?", onOptimisticSubmit }: PostComposerProps) {
    const form = useForm<{ body: string; image: File | null }>({ body: '', image: null });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
        };
    }, [imagePreview]);

    function setImage(file: File | null) {
        setImagePreview((previous) => {
            if (previous) URL.revokeObjectURL(previous);
            return file ? URL.createObjectURL(file) : null;
        });
        form.setData('image', file);
    }

    function onFileChange(e: ChangeEvent<HTMLInputElement>) {
        setImage(e.target.files?.[0] ?? null);
        e.target.value = '';
    }

    function onPaste(e: ClipboardEvent<HTMLTextAreaElement>) {
        const item = Array.from(e.clipboardData.items).find((entry) => entry.type.startsWith('image/'));
        if (!item) return;

        const file = item.getAsFile();
        if (!file) return;

        e.preventDefault();
        setImage(file);
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        const body = form.data.body;

        onOptimisticSubmit?.(body, imagePreview);

        form.post(action, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset('body');
                setImage(null);
            },
        });
    }

    const remaining = 280 - form.data.body.length;

    return (
        <form onSubmit={submit} className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
            <textarea
                value={form.data.body}
                onChange={(e) => form.setData('body', e.target.value)}
                onPaste={onPaste}
                placeholder={placeholder}
                rows={3}
                maxLength={280}
                className="w-full resize-none border-none text-sm text-gray-900 focus:outline-none"
            />
            {form.errors.body && <p className="mt-1 text-sm text-red-600">{form.errors.body}</p>}

            {imagePreview && (
                <div className="relative mt-2 inline-block">
                    <img src={imagePreview} alt="" className="max-h-60 rounded-lg border border-gray-200" />
                    <button
                        type="button"
                        onClick={() => setImage(null)}
                        className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs text-white hover:bg-gray-700"
                        aria-label="Remove image"
                    >
                        ×
                    </button>
                </div>
            )}
            {form.errors.image && <p className="mt-1 text-sm text-red-600">{form.errors.image}</p>}

            <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-gray-400 hover:text-sky-500"
                        aria-label="Attach image"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5"
                        >
                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                        </svg>
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={onFileChange}
                        className="hidden"
                    />
                    <span className={`text-xs ${remaining < 20 ? 'text-red-500' : 'text-gray-400'}`}>{remaining}</span>
                </div>
                <Button type="submit" disabled={form.data.body.trim().length === 0 || form.processing}>
                    Post
                </Button>
            </div>
        </form>
    );
}
