import { useForm } from '@inertiajs/react';
import { ChangeEvent } from 'react';

export default function AvatarUpload() {
    const form = useForm<{ avatar: File | null }>({ avatar: null });

    function onFileChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        form.setData('avatar', file);

        if (file) {
            form.post('/profile/avatar', {
                forceFormData: true,
                preserveScroll: true,
                onFinish: () => form.reset(),
            });
        }
    }

    return (
        <label className="cursor-pointer text-sm font-medium text-sky-600 hover:underline">
            {form.processing ? 'Uploading...' : 'Change photo'}
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onFileChange} className="hidden" />
            {form.errors.avatar && <p className="mt-1 text-sm text-red-600">{form.errors.avatar}</p>}
        </label>
    );
}
