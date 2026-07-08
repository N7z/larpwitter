interface VerifiedBadgeProps {
    className?: string;
    variant?: 'verified' | 'company';
}

const VARIANT_COLORS = {
    verified: 'text-sky-500',
    company: 'text-yellow-500',
};

const VARIANT_LABELS = {
    verified: 'Verified',
    company: 'Verified company',
};

export default function VerifiedBadge({ className = 'h-4 w-4', variant = 'verified' }: VerifiedBadgeProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            role="img"
            aria-label={VARIANT_LABELS[variant]}
            className={`inline shrink-0 ${VARIANT_COLORS[variant]} ${className}`}
        >
            <path
                fill="currentColor"
                d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
            />
            <path
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m9 12 2 2 4-4"
            />
        </svg>
    );
}
