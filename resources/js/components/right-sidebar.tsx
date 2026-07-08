import { Link, usePage } from '@inertiajs/react';
import { Hash } from 'lucide-react';
import Avatar from '@/components/avatar';
import FollowButton from '@/components/follow-button';
import UserBadge from '@/components/user-badge';
import { Shared } from '@/types';

export default function RightSidebar() {
    const { auth, newUsers, trendingHashtags } = usePage<Shared>().props;

    return (
        <div className="sticky top-6 space-y-4">
            <section className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <h2 className="border-b border-gray-200 px-4 py-3 text-sm font-bold text-gray-900 dark:border-gray-800 dark:text-gray-100">
                    New users
                </h2>
                {newUsers.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">No users yet.</p>
                ) : (
                    newUsers.map((user) => (
                        <div key={user.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <Link href={`/u/${user.username}`} className="flex min-w-0 flex-1 items-center gap-3">
                                <Avatar username={user.username} displayName={user.display_name} avatarUrl={user.avatar_url} size="sm" />
                                <div className="min-w-0">
                                    <p className="flex items-center gap-1 truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        <span className="truncate">{user.display_name}</span>
                                        <UserBadge user={user} className="h-3.5 w-3.5" />
                                    </p>
                                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">@{user.username}</p>
                                </div>
                            </Link>
                            {auth.user && (
                                <FollowButton
                                    username={user.username}
                                    isFollowing={user.is_following}
                                    className="!px-3 !py-1 !text-xs"
                                />
                            )}
                        </div>
                    ))
                )}
            </section>

            <section className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <h2 className="border-b border-gray-200 px-4 py-3 text-sm font-bold text-gray-900 dark:border-gray-800 dark:text-gray-100">
                    Trending
                </h2>
                {trendingHashtags.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">Nothing trending yet.</p>
                ) : (
                    trendingHashtags.map((hashtag) => (
                        <Link
                            key={hashtag.id}
                            href={`/tag/${hashtag.name}`}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                                <Hash className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">#{hashtag.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {hashtag.posts_count} {hashtag.posts_count === 1 ? 'post' : 'posts'}
                                </p>
                            </div>
                        </Link>
                    ))
                )}
            </section>
        </div>
    );
}
