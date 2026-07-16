import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { FormEvent, useState } from 'react';
import AdminUserMenu from '@/components/admin-user-menu';
import Avatar from '@/components/avatar';
import Seo from '@/components/seo';
import UserBadge from '@/components/user-badge';
import AdminLayout from '@/layouts/admin-layout';
import { AdminUserRow, Paginated, Shared, VerificationType } from '@/types';

const VERIFICATION_LABELS: Record<VerificationType, string> = {
    0: 'Not verified',
    1: 'Verified',
    2: 'Company',
};

interface AdminUsersIndexProps {
    users: Paginated<AdminUserRow>;
    search: string | null;
}

export default function AdminUsersIndex({ users, search }: AdminUsersIndexProps) {
    const { auth } = usePage<Shared>().props;
    const [query, setQuery] = useState(search ?? '');
    const [feedback, setFeedback] = useState<string | null>(null);

    function submitSearch(event: FormEvent) {
        event.preventDefault();
        router.get('/admin/users', query ? { q: query } : {}, { preserveState: true, replace: true });
    }

    function toggleAdmin(userId: number) {
        router.patch(`/admin/users/${userId}/toggle-admin`, {}, { preserveScroll: true });
    }

    function updateVerification(userId: number, type: VerificationType) {
        router.patch(`/admin/users/${userId}/verification`, { type }, { preserveScroll: true });
    }

    function deleteUser(userId: number) {
        router.delete(`/admin/users/${userId}`, { preserveScroll: true });
    }

    async function resetPassword(userId: number) {
        try {
            const { data } = await axios.post<{ url: string }>(`/admin/users/${userId}/reset-password`);
            await navigator.clipboard.writeText(data.url);
            setFeedback('Reset link copied to clipboard.');
        } catch {
            setFeedback('Could not generate a reset link.');
        }

        setTimeout(() => setFeedback(null), 4000);
    }

    return (
        <AdminLayout>
            <Seo title="Admin · Users" />

            <h1 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">Users</h1>

            {feedback && (
                <p className="mb-4 rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-700 dark:bg-sky-950 dark:text-sky-400">{feedback}</p>
            )}

            <form onSubmit={submitSearch} className="mb-4 flex gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search by username or name"
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
                {users.data.length === 0 ? (
                    <p className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">No users found.</p>
                ) : (
                    users.data.map((user) => (
                        <div
                            key={user.id}
                            className="flex items-center justify-between gap-4 border-b border-gray-200 p-4 last:border-b-0 dark:border-gray-800"
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <Avatar username={user.username} displayName={user.display_name} avatarUrl={user.avatar_url} size="sm" />
                                <div className="min-w-0">
                                    <p className="flex items-center gap-1 truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {user.display_name}
                                        <UserBadge user={user} />
                                        {user.is_admin && (
                                            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:bg-sky-950 dark:text-sky-400">
                                                Admin
                                            </span>
                                        )}
                                    </p>
                                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                        @{user.username} · {user.posts_count} posts · {user.followers_count} followers
                                    </p>
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                                {user.id !== auth.user?.id ? (
                                    <AdminUserMenu
                                        isAdmin={user.is_admin}
                                        verification={user.is_verified}
                                        onToggleAdmin={() => toggleAdmin(user.id)}
                                        onUpdateVerification={(type) => updateVerification(user.id, type)}
                                        onResetPassword={() => resetPassword(user.id)}
                                        onDelete={() => deleteUser(user.id)}
                                        deleteTitle={`Delete @${user.username}?`}
                                        deleteDescription="This permanently deletes the user and all their posts, likes, and follows."
                                    />
                                ) : (
                                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                        {VERIFICATION_LABELS[user.is_verified]}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>
                    Page {users.current_page} of {users.last_page} ({users.total} total)
                </span>
                <div className="flex gap-2">
                    {users.prev_page_url && (
                        <button
                            type="button"
                            onClick={() => router.get(users.prev_page_url!, {}, { preserveState: true })}
                            className="rounded-lg px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Previous
                        </button>
                    )}
                    {users.next_page_url && (
                        <button
                            type="button"
                            onClick={() => router.get(users.next_page_url!, {}, { preserveState: true })}
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
