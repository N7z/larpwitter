import { Link } from '@inertiajs/react';

interface RichTextProps {
    text: string;
    className?: string;
}

const ENTITY = /(@[a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*|#[a-zA-Z0-9_]+)/g;

export default function RichText({ text, className }: RichTextProps) {
    const parts = text.split(ENTITY);

    return (
        <p className={className}>
            {parts.map((part, index) => {
                const symbol = part[0];

                if ((symbol === '@' || symbol === '#') && part.length > 1) {
                    const href = symbol === '@' ? `/u/${part.slice(1).toLowerCase()}` : `/tag/${part.slice(1).toLowerCase()}`;

                    return (
                        <Link key={index} href={href} className="text-sky-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                            {part}
                        </Link>
                    );
                }

                return part;
            })}
        </p>
    );
}
