import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import PostCard from '@/components/post-card';
import PostComposer from '@/components/post-composer';
import AppLayout from '@/layouts/app-layout';
import { PostItem, Shared } from '@/types';

interface PostShowProps {
    post: PostItem;
    replies: PostItem[];
}

export default function PostShow({ post, replies }: PostShowProps) {
    const { auth } = usePage<Shared>().props;
    const [items, setItems] = useState(replies);

    useEffect(() => {
        setItems(replies);
    }, [replies]);

    function handleOptimisticSubmit(body: string, imageUrl: string | null) {
        if (!auth.user) {
            return;
        }

        const id = -Date.now();

        setItems((current) => [
            {
                id,
                body,
                image_url: imageUrl,
                created_at: new Date().toISOString(),
                user: auth.user!,
                likes_count: 0,
                replies_count: 0,
                liked: false,
                parent_id: post.id,
            },
            ...current,
        ]);

        return () => setItems((current) => current.filter((item) => item.id !== id));
    }

    return (
        <AppLayout>
            <div className="overflow-hidden rounded-lg border border-gray-200">
                <PostCard post={post} linkToShow={false} />
            </div>

            <div className="mt-4">
                <PostComposer action={`/posts/${post.id}/replies`} placeholder="Post your reply" onOptimisticSubmit={handleOptimisticSubmit} />
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200">
                {items.length === 0 ? (
                    <p className="p-6 text-center text-sm text-gray-500">No replies yet.</p>
                ) : (
                    items.map((reply) => <PostCard key={reply.id} post={reply} linkToShow={false} />)
                )}
            </div>
        </AppLayout>
    );
}
