import FollowButton from '@/components/follow-button';
import PostCard from '@/components/post-card';
import AppLayout from '@/layouts/app-layout';
import { PostItem, UserInfo } from '@/types';

interface ProfileShowProps {
    profileUser: UserInfo;
    postsCount: number;
    followersCount: number;
    followingCount: number;
    isFollowing: boolean | null;
    posts: PostItem[];
}

export default function ProfileShow({ profileUser, postsCount, followersCount, followingCount, isFollowing, posts }: ProfileShowProps) {
    return (
        <AppLayout>
            <div className="mb-4 rounded-lg border border-gray-200 bg-white p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{profileUser.display_name}</h1>
                        <p className="text-sm text-gray-500">@{profileUser.username}</p>
                    </div>
                    {isFollowing !== null && <FollowButton username={profileUser.username} isFollowing={isFollowing} />}
                </div>
                <div className="mt-4 flex gap-4 text-sm text-gray-600">
                    <span>
                        <strong className="text-gray-900">{postsCount}</strong> posts
                    </span>
                    <span>
                        <strong className="text-gray-900">{followersCount}</strong> followers
                    </span>
                    <span>
                        <strong className="text-gray-900">{followingCount}</strong> following
                    </span>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200">
                {posts.length === 0 ? (
                    <p className="p-6 text-center text-sm text-gray-500">No posts yet.</p>
                ) : (
                    posts.map((post) => <PostCard key={post.id} post={post} />)
                )}
            </div>
        </AppLayout>
    );
}
