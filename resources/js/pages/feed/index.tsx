import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import PostCard from '@/components/post-card';
import PostComposer from '@/components/post-composer';
import Seo from '@/components/seo';
import AppLayout from '@/layouts/app-layout';
import { PostItem, Shared } from '@/types';

type Scope = 'for_you' | 'following' | 'global';

interface FeedIndexProps {
    posts: {
        data: PostItem[];
    };
    scope: Scope;
}

const SCOPE_TITLES: Record<Scope, string> = {
    for_you: 'For You',
    following: 'Following',
    global: 'Home',
};

export default function FeedIndex({ posts, scope }: FeedIndexProps) {
    const { auth } = usePage<Shared>().props;
    const [items, setItems] = useState(posts.data);

    useEffect(() => {
        setItems(posts.data);
    }, [posts.data]);

    const tabs: { key: Scope; label: string }[] = [
        ...(auth.user
            ? [
                  { key: 'for_you' as const, label: 'For You' },
                  { key: 'following' as const, label: 'Following' },
              ]
            : []),
        { key: 'global' as const, label: 'Global' },
    ];

    return (
        <AppLayout>
            <Seo title={SCOPE_TITLES[scope]} />

            <div className="mb-4 flex gap-4 border-b border-gray-200 text-sm font-medium dark:border-gray-800">
                {tabs.map((tab) => (
                    <Link
                        key={tab.key}
                        href={`/?scope=${tab.key}`}
                        preserveState
                        className={`-mb-px border-b-2 px-1 pb-2 ${
                            scope === tab.key
                                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                                : 'border-transparent text-gray-500 dark:text-gray-400'
                        }`}
                    >
                        {tab.label}
                    </Link>
                ))}
            </div>

            {auth.user ? (
                <PostComposer action="/posts" />
            ) : (
                <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 text-center text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
                    <Link href="/login" className="font-semibold text-sky-600 hover:underline dark:text-sky-400">
                        Log in
                    </Link>{' '}
                    to post.
                </div>
            )}

            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                {items.length === 0 ? (
                    <p className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">No posts yet.</p>
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
