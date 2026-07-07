import { Link, router, usePage } from '@inertiajs/react';
import { Heart, Repeat2, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import Avatar from '@/components/avatar';
import ConfirmDialog from '@/components/confirm-dialog';
import PostEmbed from '@/components/post-embed';
import RepostDialog from '@/components/repost-dialog';
import { PostItem, Shared } from '@/types';

interface PostCardProps {
    post: PostItem;
    linkToShow?: boolean;
}

export default function PostCard({ post, linkToShow = true }: PostCardProps) {
    const { auth } = usePage<Shared>().props;
    const [liked, setLiked] = useState(post.liked);
    const [likesCount, setLikesCount] = useState(post.likes_count);
    const [deleting, setDeleting] = useState(false);
    const isOwnPost = auth.user?.id === post.user.id;

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

    function deletePost() {
        setDeleting(true);
        router.delete(`/posts/${post.id}`, {
            preserveScroll: true,
            onError: () => setDeleting(false),
        });
    }

    return (
        <motion.article
            layout
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="flex gap-3 border-b border-gray-200 bg-white p-4"
        >
            <Link href={`/u/${post.user.username}`}>
                <Avatar username={post.user.username} displayName={post.user.display_name} avatarUrl={post.user.avatar_url} size="sm" />
            </Link>
            <div className="min-w-0 flex-1">
                {post.repost_of && !post.body && (
                    <div className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500">
                        <Repeat2 className="h-3.5 w-3.5" />
                        {post.user.display_name} reposted
                    </div>
                )}
                <div className="flex items-baseline gap-2">
                    <Link href={`/u/${post.user.username}`}>
                        <span className="font-semibold text-gray-900 hover:text-blue-500">{post.user.display_name}</span>
                    </Link>
                    <span className="text-sm text-gray-500">@{post.user.username}</span>
                    <span className="text-sm text-gray-400">· {new Date(post.created_at).toLocaleString()}</span>
                </div>
                {post.body && <p className="mt-1 whitespace-pre-wrap text-gray-900">{post.body}</p>}
                {post.image_url && (
                    <img
                        src={post.image_url}
                        alt=""
                        className="mt-2 max-h-96 w-full rounded-lg border border-gray-200 object-cover"
                    />
                )}
                {post.repost_of && <PostEmbed post={post.repost_of} />}
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                    <motion.button
                        type="button"
                        onClick={toggleLike}
                        whileTap={{ scale: 0.85 }}
                        className={`flex items-center gap-1 hover:text-rose-600 ${liked ? 'text-rose-600' : ''}`}
                    >
                        <motion.span
                            key={liked ? 'liked' : 'unliked'}
                            initial={{ scale: 0.6 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                            className="flex"
                        >
                            <Heart className="h-4 w-4" fill={liked ? 'currentColor' : 'none'} />
                        </motion.span>
                        {likesCount}
                    </motion.button>
                    <RepostDialog
                        post={post}
                        trigger={
                            <motion.button
                                type="button"
                                whileTap={{ scale: 0.85 }}
                                className="flex items-center gap-1 hover:text-emerald-600"
                                aria-label="Repost"
                            >
                                <Repeat2 className="h-4 w-4" />
                                {post.reposts_count}
                            </motion.button>
                        }
                    />
                    {linkToShow && (
                        <Link href={`/posts/${post.id}`} className="hover:text-sky-600">
                            {post.replies_count} {post.replies_count === 1 ? 'reply' : 'replies'}
                        </Link>
                    )}
                    {isOwnPost && (
                        <ConfirmDialog
                            title="Delete this post?"
                            description="This cannot be undone."
                            confirmLabel="Delete"
                            onConfirm={deletePost}
                            trigger={
                                <motion.button
                                    type="button"
                                    disabled={deleting}
                                    whileTap={{ scale: 0.85 }}
                                    aria-label="Delete post"
                                    className="ml-auto hover:text-red-600 disabled:opacity-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </motion.button>
                            }
                        />
                    )}
                </div>
            </div>
        </motion.article>
    );
}
