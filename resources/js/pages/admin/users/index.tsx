import { router, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import Avatar from '@/components/avatar';
import ConfirmDialog from '@/components/confirm-dialog';
import Seo from '@/components/seo';
import UserBadge from '@/components/user-badge';
import AdminLayout from '@/layouts/admin-layout';
import { AdminUserRow, Paginated, Shared, VerificationType } from '@/types';

interface AdminUsersIndexProps {
    users: Paginated<AdminUserRow>;
    search: string | null;
}

export default function AdminUsersIndex({ users, search }: AdminUsersIndexProps) {
    const { auth } = usePage<Shared>().props;
    const [query, setQuery] = useState(search ?? '');

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

    return (
        <AdminLayout>
            <Seo title="Admin · Users" />

            <h1 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">Users</h1>

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
                                <select
                                    value={user.is_verified}
                                    onChange={(event) => updateVerification(user.id, Number(event.target.value) as VerificationType)}
                                    className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-600 focus:border-sky-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                >
                                    <option value={0}>Not verified</option>
                                    <option value={1}>Verified</option>
                                    <option value={2}>Company</option>
                                </select>
                                {user.id !== auth.user?.id && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => toggleAdmin(user.id)}
                                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                        >
                                            {user.is_admin ? 'Revoke admin' : 'Make admin'}
                                        </button>
                                        <ConfirmDialog
                                            trigger={
                                                <button
                                                    type="button"
                                                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                                                >
                                                    Delete
                                                </button>
                                            }
                                            title={`Delete @${user.username}?`}
                                            description="This permanently deletes the user and all their posts, likes, and follows."
                                            confirmLabel="Delete"
                                            onConfirm={() => deleteUser(user.id)}
                                        />
                                    </>
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
