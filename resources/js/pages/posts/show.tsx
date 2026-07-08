import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import PostCard from '@/components/post-card';
import PostComposer from '@/components/post-composer';
import Seo from '@/components/seo';
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

    return (
        <AppLayout>
            <Seo title={`${post.user.display_name} (@${post.user.username})`} />

            <div className="overflow-hidden rounded-lg border border-gray-200">
                <PostCard post={post} linkToShow={false} />
            </div>

            <div className="mt-4">
                {auth.user ? (
                    <PostComposer action={`/posts/${post.id}/replies`} placeholder="Post your reply" />
                ) : (
                    <div className="rounded-lg border border-gray-200 bg-white p-4 text-center text-sm text-gray-600">
                        <Link href="/login" className="font-semibold text-sky-600 hover:underline">
                            Log in
                        </Link>{' '}
                        to reply.
                    </div>
                )}
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
