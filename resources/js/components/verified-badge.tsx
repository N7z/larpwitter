export default function VerifiedBadge({ className = 'h-4 w-4' }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            role="img"
            aria-label="Verified"
            className={`inline shrink-0 text-sky-500 ${className}`}
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
