import { router } from '@inertiajs/react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ReactNode, useState } from 'react';
import PostEmbed from '@/components/post-embed';
import { PostItem } from '@/types';

interface RepostDialogProps {
    post: PostItem;
    trigger: ReactNode;
}

export default function RepostDialog({ post, trigger }: RepostDialogProps) {
    const [open, setOpen] = useState(false);
    const [comment, setComment] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const embed = post.repost_of ?? post;
    const remaining = 280 - comment.length;

    function close() {
        setOpen(false);
        setComment('');
        setError(null);
    }

    function submit(body: string) {
        setProcessing(true);
        setError(null);

        router.post(
            `/posts/${post.id}/reposts`,
            { body },
            {
                preserveScroll: true,
                onSuccess: close,
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
                                className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-5 shadow-lg dark:bg-gray-900"
                            >
                                <div className="flex items-center justify-between">
                                    <Dialog.Title className="text-base font-semibold text-gray-900 dark:text-gray-100">Repost</Dialog.Title>
                                    <Dialog.Close asChild>
                                        <button
                                            type="button"
                                            aria-label="Close"
                                            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </Dialog.Close>
                                </div>
                                <Dialog.Description className="sr-only">Repost this post, optionally with a comment.</Dialog.Description>

                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Add a comment (optional)"
                                    rows={2}
                                    maxLength={280}
                                    className="mt-3 w-full resize-none rounded-lg border border-gray-200 p-2 text-sm text-gray-900 focus:border-sky-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                />
                                <div
                                    className={`text-right text-xs ${remaining < 20 ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`}
                                >
                                    {remaining}
                                </div>

                                <PostEmbed post={embed} />

                                {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}

                                <div className="mt-4 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        disabled={processing}
                                        onClick={() => submit('')}
                                        className="rounded-full px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-800"
                                    >
                                        Repost
                                    </button>
                                    <button
                                        type="button"
                                        disabled={processing || comment.trim().length === 0}
                                        onClick={() => submit(comment)}
                                        className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50"
                                    >
                                        Quote
                                    </button>
                                </div>
                            </motion.div>
                        </Dialog.Content>
                    </Dialog.Portal>
                )}
            </AnimatePresence>
        </Dialog.Root>
    );
}
