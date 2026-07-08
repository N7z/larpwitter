import { Head } from '@inertiajs/react';

interface SeoProps {
    title?: string;
}

export default function Seo({ title }: SeoProps) {
    return <Head title={title} />;
}
