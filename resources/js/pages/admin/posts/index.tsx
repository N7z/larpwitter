import { Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import Avatar from '@/components/avatar';
import ConfirmDialog from '@/components/confirm-dialog';
import Seo from '@/components/seo';
import UserBadge from '@/components/user-badge';
import AdminLayout from '@/layouts/admin-layout';
import { AdminPostRow, Paginated } from '@/types';

interface AdminPostsIndexProps {
    posts: Paginated<AdminPostRow>;
    search: string | null;
}

function kindLabel(post: AdminPostRow): string {
    if (post.repost_of_id) return 'Repost';
    if (post.parent_id) return 'Reply';

    return 'Post';
}

export default function AdminPostsIndex({ posts, search }: AdminPostsIndexProps) {
    const [query, setQuery] = useState(search ?? '');

    function submitSearch(event: FormEvent) {
        event.preventDefault();
        router.get('/admin/posts', query ? { q: query } : {}, { preserveState: true, replace: true });
    }

    function deletePost(postId: number) {
        router.delete(`/admin/posts/${postId}`, { preserveScroll: true });
    }

    return (
        <AdminLayout>
            <Seo title="Admin · Posts" />

            <h1 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">Posts</h1>

            <form onSubmit={submitSearch} className="mb-4 flex gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search post text"
                    className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />
                <button
                    type="submit"
                    className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                    Search
                </button>
            </form>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                {posts.data.length === 0 ? (
                    <p className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">No posts found.</p>
                ) : (
                    posts.data.map((post) => (
                        <div
                            key={post.id}
                            className="flex items-start justify-between gap-4 border-b border-gray-200 p-4 last:border-b-0 dark:border-gray-800"
                        >
                            <div className="flex min-w-0 items-start gap-3">
                                <Avatar
                                    username={post.user.username}
                                    displayName={post.user.display_name}
                                    avatarUrl={post.user.avatar_url}
                                    size="sm"
                                />
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                            {kindLabel(post)}
                                        </span>{' '}
                                        <Link
                                            href={`/u/${post.user.username}`}
                                            className="inline-flex items-center gap-1 font-medium text-gray-700 hover:underline dark:text-gray-300"
                                        >
                                            @{post.user.username}
                                            <UserBadge user={post.user} className="h-3.5 w-3.5" />
                                        </Link>{' '}
                                        · {new Date(post.created_at).toLocaleString()}
                                    </p>
                                    {post.body && <p className="mt-1 line-clamp-2 text-sm text-gray-900 dark:text-gray-100">{post.body}</p>}
                                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                        {post.likes_count} likes · {post.replies_count} replies · {post.reposts_count} reposts
                                    </p>
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                                <Link
                                    href={`/posts/${post.parent_id ?? post.repost_of_id ?? post.id}`}
                                    className="text-xs font-medium text-sky-600 hover:underline dark:text-sky-400"
                                >
                                    View
                                </Link>
                                <ConfirmDialog
                                    trigger={
                                        <button
                                            type="button"
                                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                                        >
                                            Delete
                                        </button>
                                    }
                                    title="Delete this post?"
                                    description="This permanently deletes the post and any replies to it."
                                    confirmLabel="Delete"
                                    onConfirm={() => deletePost(post.id)}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>
                    Page {posts.current_page} of {posts.last_page} ({posts.total} total)
                </span>
                <div className="flex gap-2">
                    {posts.prev_page_url && (
                        <button
                            type="button"
                            onClick={() => router.get(posts.prev_page_url!, {}, { preserveState: true })}
                            className="rounded-lg px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Previous
                        </button>
                    )}
                    {posts.next_page_url && (
                        <button
                            type="button"
                            onClick={() => router.get(posts.next_page_url!, {}, { preserveState: true })}
                            className="rounded-lg px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Next
                        </button>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
