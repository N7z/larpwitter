import { Link } from '@inertiajs/react';
import PostCard from '@/components/post-card';
import PostComposer from '@/components/post-composer';
import AppLayout from '@/layouts/app-layout';
import { PostItem } from '@/types';

interface FeedIndexProps {
    posts: {
        data: PostItem[];
    };
    scope: 'global' | 'following';
}

export default function FeedIndex({ posts, scope }: FeedIndexProps) {
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
                <Link
                    href="/?scope=following"
                    preserveState
                    className={`-mb-px border-b-2 px-1 pb-2 ${
                        scope === 'following' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500'
                    }`}
                >
                    Following
                </Link>
            </div>

            <PostComposer action="/posts" />

            <div className="overflow-hidden rounded-lg border border-gray-200">
                {posts.data.length === 0 ? (
                    <p className="p-6 text-center text-sm text-gray-500">No posts yet.</p>
                ) : (
                    posts.data.map((post) => <PostCard key={post.id} post={post} />)
                )}
            </div>
        </AppLayout>
    );
}
