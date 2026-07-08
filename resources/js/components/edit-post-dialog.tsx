import { router } from '@inertiajs/react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { FormEvent, ReactNode, useState } from 'react';

interface EditPostDialogProps {
    postId: number;
    body: string;
    trigger: ReactNode;
}

export default function EditPostDialog({ postId, body, trigger }: EditPostDialogProps) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(body);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const remaining = 280 - value.length;

    function close() {
        setOpen(false);
        setValue(body);
        setError(null);
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        setProcessing(true);
        setError(null);

        router.patch(
            `/posts/${postId}`,
            { body: value },
            {
                preserveScroll: true,
                onSuccess: () => setOpen(false),
                onError: (errors) => setError(errors.body ?? 'Something went wrong.'),
                onFinish: () => setProcessing(false),
            },
        );
    }

    return (
        <Dialog.Root open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
            <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
            <AnimatePresence>
                {open && (
                    <Dialog.Portal forceMount>
                        <Dialog.Overlay asChild forceMount>
                            <motion.div
                                key="overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="fixed inset-0 z-50 bg-black/40"
                            />
                        </Dialog.Overlay>
                        <Dialog.Content asChild forceMount>
                            <motion.div
                                key="content"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-5 shadow-lg"
                            >
                                <div className="flex items-center justify-between">
                                    <Dialog.Title className="text-base font-semibold text-gray-900">Edit post</Dialog.Title>
                                    <Dialog.Close asChild>
                                        <button type="button" aria-label="Close" className="text-gray-400 hover:text-gray-600">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </Dialog.Close>
                                </div>
                                <Dialog.Description className="sr-only">Edit the text of this post.</Dialog.Description>

                                <form onSubmit={submit}>
                                    <textarea
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                        rows={4}
                                        maxLength={280}
                                        autoFocus
                                        className="mt-3 w-full resize-none rounded-lg border border-gray-200 p-2 text-sm text-gray-900 focus:border-sky-400 focus:outline-none"
                                    />
                                    <div className={`text-right text-xs ${remaining < 20 ? 'text-red-500' : 'text-gray-400'}`}>{remaining}</div>

                                    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

                                    <div className="mt-4 flex justify-end gap-2">
                                        <Dialog.Close asChild>
                                            <button
                                                type="button"
                                                className="rounded-full px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                                            >
                                                Cancel
                                            </button>
                                        </Dialog.Close>
                                        <button
                                            type="submit"
                                            disabled={processing || value.trim().length === 0}
                                            className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </Dialog.Content>
                    </Dialog.Portal>
                )}
            </AnimatePresence>
        </Dialog.Root>
    );
}
