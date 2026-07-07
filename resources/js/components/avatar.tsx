const COLORS = ['bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-sky-500', 'bg-violet-500', 'bg-pink-500'];

function colorFor(username: string): string {
    const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    return COLORS[hash % COLORS.length];
}

interface AvatarProps {
    username: string;
    displayName: string;
    avatarUrl: string | null;
    size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
};

export default function Avatar({ username, displayName, avatarUrl, size = 'md' }: AvatarProps) {
    if (avatarUrl) {
        return <img src={avatarUrl} alt={displayName} className={`${SIZES[size]} shrink-0 rounded-sm object-cover`} />;
    }

    return (
        <span className={`flex ${SIZES[size]} shrink-0 items-center justify-center rounded-sm ${colorFor(username)}`}>
            <svg viewBox="0 0 100 100" className="h-3/5 w-3/5" aria-hidden="true">
                <path
                    fill="white"
                    d="M50 8 C 24 8, 10 46, 10 68 C 10 90, 28 96, 50 96 C 72 96, 90 90, 90 68 C 90 46, 76 8, 50 8 Z"
                />
            </svg>
        </span>
    );
}
