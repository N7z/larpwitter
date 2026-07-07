import { Link, router } from '@inertiajs/react';
import { PostItem } from '@/types';

interface PostCardProps {
    post: PostItem;
    linkToShow?: boolean;
}

export default function PostCard({ post, linkToShow = true }: PostCardProps) {
    function toggleLike() {
        if (post.liked) {
            router.delete(`/posts/${post.id}/like`, { preserveScroll: true });
        } else {
            router.post(`/posts/${post.id}/like`, {}, { preserveScroll: true });
        }
    }

    return (
        <article className="border-b border-gray-200 bg-white p-4">
            <div className="flex items-baseline gap-2">
                <span className="font-semibold text-gray-900">{post.user.display_name}</span>
                <span className="text-sm text-gray-500">@{post.user.username}</span>
                <span className="text-sm text-gray-400">· {new Date(post.created_at).toLocaleString()}</span>
            </div>
            <p className="mt-1 whitespace-pre-wrap text-gray-900">{post.body}</p>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                <button
                    type="button"
                    onClick={toggleLike}
                    className={`flex items-center gap-1 hover:text-rose-600 ${post.liked ? 'text-rose-600' : ''}`}
                >
                    {post.liked ? '♥' : '♡'} {post.likes_count}
                </button>
                {linkToShow && (
                    <Link href={`/posts/${post.id}`} className="hover:text-sky-600">
                        {post.replies_count} {post.replies_count === 1 ? 'reply' : 'replies'}
                    </Link>
                )}
            </div>
        </article>
    );
}
