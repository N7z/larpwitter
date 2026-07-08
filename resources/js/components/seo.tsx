import { Head, usePage } from '@inertiajs/react';

interface SeoProps {
    title?: string;
    description?: string;
    image?: string;
    noindex?: boolean;
}

export const DEFAULT_DESCRIPTION =
    'Larpwitter is a social feed for larpers to post and follow the rest of the community.';

export default function Seo({ title, description = DEFAULT_DESCRIPTION, image = '/favicon.png', noindex = false }: SeoProps) {
    const { url } = usePage();
    const canonical = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;

    return (
        <Head title={title}>
            <link head-key="canonical" rel="canonical" href={canonical} />
            <meta head-key="description" name="description" content={description} />
            <meta head-key="robots" name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
            <meta head-key="og:type" property="og:type" content="website" />
            <meta head-key="og:site_name" property="og:site_name" content="Larpwitter" />
            <meta head-key="og:title" property="og:title" content={title ?? 'Larpwitter'} />
            <meta head-key="og:description" property="og:description" content={description} />
            <meta head-key="og:image" property="og:image" content={image} />
            <meta head-key="twitter:card" name="twitter:card" content="summary" />
            <meta head-key="twitter:title" name="twitter:title" content={title ?? 'Larpwitter'} />
            <meta head-key="twitter:description" name="twitter:description" content={description} />
            <meta head-key="twitter:image" name="twitter:image" content={image} />
        </Head>
    );
}
