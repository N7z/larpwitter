import { Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Avatar from '@/components/avatar';
import { PostItem } from '@/types';

interface PostCardProps {
    post: PostItem;
    linkToShow?: boolean;
}

export default function PostCard({ post, linkToShow = true }: PostCardProps) {
    const [liked, setLiked] = useState(post.liked);
    const [likesCount, setLikesCount] = useState(post.likes_count);

    useEffect(() => {
        setLiked(post.liked);
        setLikesCount(post.likes_count);
    }, [post.liked, post.likes_count]);

    function toggleLike() {
        const wasLiked = liked;
        setLiked(!wasLiked);
        setLikesCount((count) => count + (wasLiked ? -1 : 1));

        function revert() {
            setLiked(wasLiked);
            setLikesCount((count) => count + (wasLiked ? 1 : -1));
        }

        if (wasLiked) {
            router.delete(`/posts/${post.id}/like`, { preserveScroll: true, preserveState: true, onError: revert });
        } else {
            router.post(`/posts/${post.id}/like`, {}, { preserveScroll: true, preserveState: true, onError: revert });
        }
    }

    return (
        <article className="flex gap-3 border-b border-gray-200 bg-white p-4">
            <Link href={`/u/${post.user.username}`}>
                <Avatar username={post.user.username} displayName={post.user.display_name} avatarUrl={post.user.avatar_url} size="sm" />
            </Link>
            <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                    <Link href={`/u/${post.user.username}`}>
                        <span className="font-semibold text-gray-900 hover:text-blue-500">{post.user.display_name}</span>
                    </Link>
                    <span className="text-sm text-gray-500">@{post.user.username}</span>
                    <span className="text-sm text-gray-400">· {new Date(post.created_at).toLocaleString()}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-gray-900">{post.body}</p>
                {post.image_url && (
                    <img
                        src={post.image_url}
                        alt=""
                        className="mt-2 max-h-96 w-full rounded-lg border border-gray-200 object-cover"
                    />
                )}
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                    <button
                        type="button"
                        onClick={toggleLike}
                        className={`flex items-center gap-1 hover:text-rose-600 ${liked ? 'text-rose-600' : ''}`}
                    >
                        {liked ? '♥' : '♡'} {likesCount}
                    </button>
                    {linkToShow && (
                        <Link href={`/posts/${post.id}`} className="hover:text-sky-600">
                            {post.replies_count} {post.replies_count === 1 ? 'reply' : 'replies'}
                        </Link>
                    )}
                </div>
            </div>
        </article>
    );
}
