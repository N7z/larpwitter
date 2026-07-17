import { router } from '@inertiajs/react';
import { Keyboard } from 'lucide-react';
import { useState } from 'react';
import Button from '@/components/button';

interface ChallengeButtonProps {
    username: string;
    className?: string;
}

export default function ChallengeButton({ username, className = '' }: ChallengeButtonProps) {
    const [sending, setSending] = useState(false);

    function challenge() {
        setSending(true);
        router.post(
            '/games/typing-race',
            { opponent: username },
            { onFinish: () => setSending(false) },
        );
    }

    return (
        <Button
            type="button"
            onClick={challenge}
            disabled={sending}
            className={`!bg-white !text-gray-900 border border-gray-300 hover:!bg-gray-100 dark:!bg-gray-900 dark:!text-gray-100 dark:border-gray-700 dark:hover:!bg-gray-800 ${className}`}
        >
            <span className="flex items-center gap-1.5">
                <Keyboard className="h-4 w-4" />
                {sending ? 'Challenging…' : 'Challenge'}
            </span>
        </Button>
    );
}
