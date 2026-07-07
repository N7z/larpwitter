import { router } from '@inertiajs/react';
import Button from '@/components/button';

interface FollowButtonProps {
    username: string;
    isFollowing: boolean;
}

export default function FollowButton({ username, isFollowing }: FollowButtonProps) {
    function toggle() {
        if (isFollowing) {
            router.delete(`/users/${username}/follow`, { preserveScroll: true });
        } else {
            router.post(`/users/${username}/follow`, {}, { preserveScroll: true });
        }
    }

    return (
        <Button
            type="button"
            onClick={toggle}
            className={isFollowing ? '!bg-white !text-gray-900 border border-gray-300 hover:!bg-gray-100' : ''}
        >
            {isFollowing ? 'Following' : 'Follow'}
        </Button>
    );
}
