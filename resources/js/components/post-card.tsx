import { Link, router, usePage } from '@inertiajs/react';
import { Heart, Pencil, Repeat2, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import Avatar from '@/components/avatar';
import ConfirmDialog from '@/components/confirm-dialog';
import EditPostDialog from '@/components/edit-post-dialog';
import PostEmbed from '@/components/post-embed';
import RepostDialog from '@/components/repost-dialog';
import RichText from '@/components/rich-text';
import UserBadge from '@/components/user-badge';
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
        if (!auth.user) {
            router.visit('/login');
            return;
        }

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
            className="border-b border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
        >
            {post.parent && (
                <div className="mb-2">
                    <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                        Replying to{' '}
                        <Link href={`/u/${post.parent.user.username}`} className="text-sky-600 hover:underline dark:text-sky-400">
                            @{post.parent.user.username}
                        </Link>
                    </div>
                    <PostEmbed post={post.parent} />
                </div>
            )}
            <div className="flex gap-3">
                <Link href={`/u/${post.user.username}`}>
                    <Avatar username={post.user.username} displayName={post.user.display_name} avatarUrl={post.user.avatar_url} size="sm" />
                </Link>
                <div className="min-w-0 flex-1">
                    {post.repost_of && !post.body && (
                        <div className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                            <Repeat2 className="h-3.5 w-3.5" />
                            {post.user.display_name} reposted
                        </div>
                    )}
                    <div className="flex items-baseline gap-2">
                        <Link href={`/u/${post.user.username}`}>
                            <span className="inline-flex items-center gap-1 font-semibold text-gray-900 hover:text-blue-500 dark:text-gray-100 dark:hover:text-blue-400">
                                {post.user.display_name}
                                <UserBadge user={post.user} />
                            </span>
                        </Link>
                        <span className="text-sm text-gray-500 dark:text-gray-400">@{post.user.username}</span>
                        <span className="text-sm text-gray-400 dark:text-gray-500">· {new Date(post.created_at).toLocaleString()}</span>
                    </div>
                    {post.body && <RichText text={post.body} className="mt-1 whitespace-pre-wrap text-gray-900 dark:text-gray-100" />}
                    {post.image_url && (
                        <div className="relative mt-2 h-96 w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800">
                            <img
                                src={post.image_url}
                                alt=""
                                aria-hidden="true"
                                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-xl"
                            />
                            <img src={post.image_url} alt="" className="relative h-full w-full object-contain" />
                        </div>
                    )}
                    {post.repost_of && <PostEmbed post={post.repost_of} />}
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <motion.button
                            type="button"
                            onClick={toggleLike}
                            whileTap={{ scale: 0.85 }}
                            className={`flex items-center gap-1 hover:text-rose-600 dark:hover:text-rose-400 ${liked ? 'text-rose-600 dark:text-rose-400' : ''}`}
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
                        {auth.user ? (
                            <RepostDialog
                                post={post}
                                trigger={
                                    <motion.button
                                        type="button"
                                        whileTap={{ scale: 0.85 }}
                                        className="flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400"
                                        aria-label="Repost"
                                    >
                                        <Repeat2 className="h-4 w-4" />
                                        {post.reposts_count}
                                    </motion.button>
                                }
                            />
                        ) : (
                            <Link href="/login" className="flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400" aria-label="Repost">
                                <Repeat2 className="h-4 w-4" />
                                {post.reposts_count}
                            </Link>
                        )}
                        {linkToShow && (
                            <Link href={`/posts/${post.id}`} className="hover:text-sky-600 dark:hover:text-sky-400">
                                {post.replies_count} {post.replies_count === 1 ? 'reply' : 'replies'}
                            </Link>
                        )}
                        {isOwnPost && (
                            <div className="ml-auto flex items-center gap-4">
                                {!post.repost_of && (
                                    <EditPostDialog
                                        postId={post.id}
                                        body={post.body ?? ''}
                                        trigger={
                                            <motion.button
                                                type="button"
                                                whileTap={{ scale: 0.85 }}
                                                aria-label="Edit post"
                                                className="hover:text-sky-600 dark:hover:text-sky-400"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </motion.button>
                                        }
                                    />
                                )}
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
                                            className="hover:text-red-600 disabled:opacity-50 dark:hover:text-red-400"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </motion.button>
                                    }
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.article>
    );
}
