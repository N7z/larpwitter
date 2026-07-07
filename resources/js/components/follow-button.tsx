import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Button from '@/components/button';

interface FollowButtonProps {
    username: string;
    isFollowing: boolean;
}

export default function FollowButton({ username, isFollowing }: FollowButtonProps) {
    const [following, setFollowing] = useState(isFollowing);

    useEffect(() => {
        setFollowing(isFollowing);
    }, [isFollowing]);

    function toggle() {
        const wasFollowing = following;
        setFollowing(!wasFollowing);

        const revert = () => setFollowing(wasFollowing);

        if (wasFollowing) {
            router.delete(`/users/${username}/follow`, { preserveScroll: true, preserveState: true, onError: revert });
        } else {
            router.post(`/users/${username}/follow`, {}, { preserveScroll: true, preserveState: true, onError: revert });
        }
    }

    return (
        <Button
            type="button"
            onClick={toggle}
            className={following ? '!bg-white !text-gray-900 border border-gray-300 hover:!bg-gray-100' : ''}
        >
            {following ? 'Following' : 'Follow'}
        </Button>
    );
}
