import { AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import PostCard from '@/components/post-card';
import Seo from '@/components/seo';
import AppLayout from '@/layouts/app-layout';
import { PostItem } from '@/types';

interface HashtagShowProps {
    hashtag: string;
    posts: {
        data: PostItem[];
    };
}

export default function HashtagShow({ hashtag, posts }: HashtagShowProps) {
    const [items, setItems] = useState(posts.data);

    useEffect(() => {
        setItems(posts.data);
    }, [posts.data]);

    return (
        <AppLayout>
            <Seo title={`#${hashtag}`} />

            <h1 className="mb-4 text-xl font-bold text-gray-900">#{hashtag}</h1>

            <div className="overflow-hidden rounded-lg border border-gray-200">
                {items.length === 0 ? (
                    <p className="p-6 text-center text-sm text-gray-500">No posts with this hashtag yet.</p>
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
