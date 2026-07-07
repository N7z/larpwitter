import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import PostCard from '@/components/post-card';
import PostComposer from '@/components/post-composer';
import AppLayout from '@/layouts/app-layout';
import { PostItem, Shared } from '@/types';

interface FeedIndexProps {
    posts: {
        data: PostItem[];
    };
    scope: 'global' | 'following';
}

export default function FeedIndex({ posts, scope }: FeedIndexProps) {
    const { auth } = usePage<Shared>().props;
    const [items, setItems] = useState(posts.data);

    useEffect(() => {
        setItems(posts.data);
    }, [posts.data]);

    return (
        <AppLayout>
            <div className="mb-4 flex gap-4 border-b border-gray-200 text-sm font-medium">
                <Link
                    href="/?scope=global"
                    preserveState
                    className={`-mb-px border-b-2 px-1 pb-2 ${
                        scope === 'global' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500'
                    }`}
                >
                    Global
                </Link>
                {auth.user && (
                    <Link
                        href="/?scope=following"
                        preserveState
                        className={`-mb-px border-b-2 px-1 pb-2 ${
                            scope === 'following' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500'
                        }`}
                    >
                        Following
                    </Link>
                )}
            </div>

            {auth.user ? (
                <PostComposer action="/posts" />
            ) : (
                <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 text-center text-sm text-gray-600">
                    <Link href="/login" className="font-semibold text-sky-600 hover:underline">
                        Log in
                    </Link>{' '}
                    to post.
                </div>
            )}

            <div className="overflow-hidden rounded-lg border border-gray-200">
                {items.length === 0 ? (
                    <p className="p-6 text-center text-sm text-gray-500">No posts yet.</p>
                ) : (
                    <AnimatePresence initial={false}>
                        {items.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </AppLayout>
    );
}
