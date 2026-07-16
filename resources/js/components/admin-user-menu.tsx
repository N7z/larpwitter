import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronRight, KeyRound, MoreHorizontal, ShieldCheck, ShieldOff, Trash2, BadgeCheck } from 'lucide-react';
import { useState } from 'react';
import ConfirmDialog from '@/components/confirm-dialog';
import { VerificationType } from '@/types';

const VERIFICATION_OPTIONS: { value: VerificationType; label: string }[] = [
    { value: 0, label: 'Not verified' },
    { value: 1, label: 'Verified' },
    { value: 2, label: 'Company' },
];

interface AdminUserMenuProps {
    isAdmin: boolean;
    verification: VerificationType;
    onToggleAdmin: () => void;
    onUpdateVerification: (type: VerificationType) => void;
    onResetPassword: () => void;
    onDelete: () => void;
    deleteTitle: string;
    deleteDescription: string;
}

export default function AdminUserMenu({
    isAdmin,
    verification,
    onToggleAdmin,
    onUpdateVerification,
    onResetPassword,
    onDelete,
    deleteTitle,
    deleteDescription,
}: AdminUserMenuProps) {
    const [open, setOpen] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    return (
        <>
            <DropdownMenu.Root open={open} onOpenChange={setOpen}>
                <DropdownMenu.Trigger asChild>
                    <button
                        type="button"
                        aria-label="User actions"
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </button>
                </DropdownMenu.Trigger>
                <AnimatePresence>
                    {open && (
                        <DropdownMenu.Portal forceMount>
                            <DropdownMenu.Content asChild align="end" sideOffset={4} forceMount>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                    transition={{ duration: 0.12 }}
                                    className="z-50 min-w-[10rem] rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-800 dark:bg-gray-900"
                                >
                                    <DropdownMenu.Item
                                        onSelect={() => onToggleAdmin()}
                                        className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 outline-none hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                    >
                                        {isAdmin ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                                        {isAdmin ? 'Revoke admin' : 'Make admin'}
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Sub>
                                        <DropdownMenu.SubTrigger className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 outline-none hover:bg-gray-100 data-[state=open]:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 dark:data-[state=open]:bg-gray-800">
                                            <BadgeCheck className="h-4 w-4" />
                                            <span className="flex-1">Verification</span>
                                            <ChevronRight className="h-4 w-4" />
                                        </DropdownMenu.SubTrigger>
                                        <DropdownMenu.Portal>
                                            <DropdownMenu.SubContent
                                                sideOffset={4}
                                                alignOffset={-4}
                                                className="z-50 min-w-[10rem] rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-800 dark:bg-gray-900"
                                            >
                                                {VERIFICATION_OPTIONS.map((option) => (
                                                    <DropdownMenu.Item
                                                        key={option.value}
                                                        onSelect={() => onUpdateVerification(option.value)}
                                                        className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 outline-none hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                                    >
                                                        <Check className={`h-4 w-4 ${verification === option.value ? 'opacity-100' : 'opacity-0'}`} />
                                                        {option.label}
                                                    </DropdownMenu.Item>
                                                ))}
                                            </DropdownMenu.SubContent>
                                        </DropdownMenu.Portal>
                                    </DropdownMenu.Sub>
                                    <DropdownMenu.Item
                                        onSelect={() => onResetPassword()}
                                        className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 outline-none hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                    >
                                        <KeyRound className="h-4 w-4" />
                                        Reset password
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Separator className="my-1 h-px bg-gray-200 dark:bg-gray-800" />
                                    <DropdownMenu.Item
                                        onSelect={(event) => {
                                            event.preventDefault();
                                            setConfirmingDelete(true);
                                        }}
                                        className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 outline-none hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                    </DropdownMenu.Item>
                                </motion.div>
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    )}
                </AnimatePresence>
            </DropdownMenu.Root>

            <ConfirmDialog
                title={deleteTitle}
                description={deleteDescription}
                confirmLabel="Delete"
                onConfirm={onDelete}
                open={confirmingDelete}
                onOpenChange={setConfirmingDelete}
            />
        </>
    );
}
