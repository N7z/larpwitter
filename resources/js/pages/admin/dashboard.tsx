import { Link } from '@inertiajs/react';
import Seo from '@/components/seo';
import AdminLayout from '@/layouts/admin-layout';
import { AdminRecentUser, AdminStats } from '@/types';

interface AdminDashboardProps {
    stats: AdminStats;
    recentUsers: AdminRecentUser[];
}

const STAT_LABELS: { key: keyof AdminStats; label: string }[] = [
    { key: 'users', label: 'Users' },
    { key: 'admins', label: 'Admins' },
    { key: 'posts', label: 'Posts' },
    { key: 'replies', label: 'Replies' },
    { key: 'reposts', label: 'Reposts' },
    { key: 'likes', label: 'Likes' },
    { key: 'follows', label: 'Follows' },
];

export default function AdminDashboard({ stats, recentUsers }: AdminDashboardProps) {
    return (
        <AdminLayout>
            <Seo title="Admin · Dashboard" />

            <h1 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>

            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {STAT_LABELS.map(({ key, label }) => (
                    <div key={key} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats[key]}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                    </div>
                ))}
            </div>

            <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Recently joined</h2>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                {recentUsers.length === 0 ? (
                    <p className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">No users yet.</p>
                ) : (
                    recentUsers.map((user) => (
                        <div
                            key={user.id}
                            className="flex items-center justify-between border-b border-gray-200 p-4 last:border-b-0 dark:border-gray-800"
                        >
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.display_name}</p>
                                <Link
                                    href={`/u/${user.username}`}
                                    className="text-xs text-gray-500 hover:underline dark:text-gray-400"
                                >
                                    @{user.username}
                                </Link>
                            </div>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                {new Date(user.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </AdminLayout>
    );
}
