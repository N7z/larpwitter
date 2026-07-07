import { AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import PostCard from '@/components/post-card';
import PostComposer from '@/components/post-composer';
import AppLayout from '@/layouts/app-layout';
import { PostItem } from '@/types';

interface PostShowProps {
    post: PostItem;
    replies: PostItem[];
}

export default function PostShow({ post, replies }: PostShowProps) {
    const [items, setItems] = useState(replies);

    useEffect(() => {
        setItems(replies);
    }, [replies]);

    return (
        <AppLayout>
            <div className="overflow-hidden rounded-lg border border-gray-200">
                <PostCard post={post} linkToShow={false} />
            </div>

            <div className="mt-4">
                <PostComposer action={`/posts/${post.id}/replies`} placeholder="Post your reply" />
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200">
                {items.length === 0 ? (
                    <p className="p-6 text-center text-sm text-gray-500">No replies yet.</p>
                ) : (
                    <AnimatePresence initial={false}>
                        {items.map((reply) => (
                            <PostCard key={reply.id} post={reply} linkToShow={false} />
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </AppLayout>
    );
}
