import { useForm } from '@inertiajs/react';
import { ChangeEvent } from 'react';

interface AvatarUploadProps {
    onPreview?: (url: string) => void;
}

export default function AvatarUpload({ onPreview }: AvatarUploadProps) {
    const form = useForm<{ avatar: File | null }>({ avatar: null });

    function onFileChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        form.setData('avatar', file);

        if (file) {
            onPreview?.(URL.createObjectURL(file));

            form.post('/profile/avatar', {
                forceFormData: true,
                preserveScroll: true,
                onFinish: () => form.reset(),
            });
        }
    }

    return (
        <label className="cursor-pointer text-sm font-medium text-sky-600 hover:underline dark:text-sky-400">
            {form.processing ? 'Uploading...' : 'Change photo'}
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onFileChange} className="hidden" />
            {form.errors.avatar && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{form.errors.avatar}</p>}
        </label>
    );
}
