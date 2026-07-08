import { Link } from '@inertiajs/react';
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
            <h1 className="mb-4 text-xl font-bold text-gray-900">Dashboard</h1>

            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {STAT_LABELS.map(({ key, label }) => (
                    <div key={key} className="rounded-lg border border-gray-200 bg-white p-4">
                        <p className="text-2xl font-bold text-gray-900">{stats[key]}</p>
                        <p className="text-xs text-gray-500">{label}</p>
                    </div>
                ))}
            </div>

            <h2 className="mb-2 text-sm font-semibold text-gray-700">Recently joined</h2>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                {recentUsers.length === 0 ? (
                    <p className="p-4 text-center text-sm text-gray-500">No users yet.</p>
                ) : (
                    recentUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between border-b border-gray-200 p-4 last:border-b-0">
                            <div>
                                <p className="text-sm font-medium text-gray-900">{user.display_name}</p>
                                <Link href={`/u/${user.username}`} className="text-xs text-gray-500 hover:underline">
                                    @{user.username}
                                </Link>
                            </div>
                            <span className="text-xs text-gray-400">{new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                    ))
                )}
            </div>
        </AdminLayout>
    );
}
