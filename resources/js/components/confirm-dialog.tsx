import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { AnimatePresence, motion } from 'motion/react';
import { ReactNode, useState } from 'react';

interface ConfirmDialogProps {
    trigger: ReactNode;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
}

export default function ConfirmDialog({
    trigger,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
}: ConfirmDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <AlertDialog.Root open={open} onOpenChange={setOpen}>
            <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>
            <AnimatePresence>
                {open && (
                    <AlertDialog.Portal forceMount>
                        <AlertDialog.Overlay asChild forceMount>
                            <motion.div
                                key="overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="fixed inset-0 z-50 bg-black/40"
                            />
                        </AlertDialog.Overlay>
                        <AlertDialog.Content asChild forceMount>
                            <motion.div
                                key="content"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-5 shadow-lg"
                            >
                                <AlertDialog.Title className="text-base font-semibold text-gray-900">{title}</AlertDialog.Title>
                                {description && (
                                    <AlertDialog.Description className="mt-2 text-sm text-gray-500">{description}</AlertDialog.Description>
                                )}
                                <div className="mt-5 flex justify-end gap-2">
                                    <AlertDialog.Cancel asChild>
                                        <button
                                            type="button"
                                            className="rounded-full px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
                                        >
                                            {cancelLabel}
                                        </button>
                                    </AlertDialog.Cancel>
                                    <AlertDialog.Action asChild>
                                        <button
                                            type="button"
                                            onClick={onConfirm}
                                            className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                                        >
                                            {confirmLabel}
                                        </button>
                                    </AlertDialog.Action>
                                </div>
                            </motion.div>
                        </AlertDialog.Content>
                    </AlertDialog.Portal>
                )}
            </AnimatePresence>
        </AlertDialog.Root>
    );
}
