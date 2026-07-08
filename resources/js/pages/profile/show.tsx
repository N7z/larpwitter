import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AvatarUpload from '@/components/avatar-upload';
import Avatar from '@/components/avatar';
import BioEditor from '@/components/bio-editor';
import FollowButton from '@/components/follow-button';
import PostCard from '@/components/post-card';
import Seo from '@/components/seo';
import UserBadge from '@/components/user-badge';
import AppLayout from '@/layouts/app-layout';
import { excerpt } from '@/lib/text';
import { PostItem, ProfileUser } from '@/types';

interface ProfileShowProps {
    profileUser: ProfileUser;
    postsCount: number;
    repliesCount: number;
    followersCount: number;
    followingCount: number;
    isFollowing: boolean | null;
    isOwnProfile: boolean;
    tab: 'posts' | 'replies';
    posts: PostItem[];
}

export default function ProfileShow({
    profileUser,
    postsCount,
    repliesCount,
    followersCount,
    followingCount,
    isFollowing,
    isOwnProfile,
    tab,
    posts,
}: ProfileShowProps) {
    const [avatarUrl, setAvatarUrl] = useState(profileUser.avatar_url);
    const [bio, setBio] = useState(profileUser.bio);

    useEffect(() => {
        setAvatarUrl(profileUser.avatar_url);
    }, [profileUser.avatar_url]);

    useEffect(() => {
        setBio(profileUser.bio);
    }, [profileUser.bio]);

    return (
        <AppLayout>
            <Seo
                title={`${profileUser.display_name} (@${profileUser.username})`}
                description={bio ? excerpt(bio) : `@${profileUser.username}'s profile on Larpwitter.`}
                image={avatarUrl ?? undefined}
            />

            <div className="mb-4 rounded-lg border border-gray-200 bg-white p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar username={profileUser.username} displayName={profileUser.display_name} avatarUrl={avatarUrl} size="lg" />
                        <div>
                            <h1 className="flex items-center gap-1 text-xl font-bold text-gray-900">
                                {profileUser.display_name}
                                <UserBadge user={profileUser} className="h-5 w-5" />
                            </h1>
                            <p className="text-sm text-gray-500">@{profileUser.username}</p>
                            {isOwnProfile && (
                                <div className="mt-1">
                                    <AvatarUpload onPreview={setAvatarUrl} />
                                </div>
                            )}
                        </div>
                    </div>
                    {isFollowing !== null && <FollowButton username={profileUser.username} isFollowing={isFollowing} />}
                </div>

                <div className="mt-3">
                    {isOwnProfile ? (
                        <BioEditor bio={bio} onSaved={setBio} />
                    ) : (
                        bio && <p className="text-sm whitespace-pre-wrap text-gray-700">{bio}</p>
                    )}
                </div>

                <div className="mt-4 flex gap-4 text-sm text-gray-600">
                    <span>
                        <strong className="text-gray-900">{postsCount + repliesCount}</strong> posts
                    </span>
                    <span>
                        <strong className="text-gray-900">{followersCount}</strong> followers
                    </span>
                    <span>
                        <strong className="text-gray-900">{followingCount}</strong> following
                    </span>
                </div>
            </div>

            <div className="mb-4 flex gap-4 border-b border-gray-200 text-sm font-medium">
                <Link
                    href={`/u/${profileUser.username}?tab=posts`}
                    preserveState
                    className={`-mb-px border-b-2 px-1 pb-2 ${
                        tab === 'posts' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500'
                    }`}
                >
                    Posts
                </Link>
                <Link
                    href={`/u/${profileUser.username}?tab=replies`}
                    preserveState
                    className={`-mb-px border-b-2 px-1 pb-2 ${
                        tab === 'replies' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500'
                    }`}
                >
                    Replies
                </Link>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200">
                {posts.length === 0 ? (
                    <p className="p-6 text-center text-sm text-gray-500">
                        {tab === 'replies' ? 'No replies yet.' : 'No posts yet.'}
                    </p>
                ) : (
                    posts.map((post) => <PostCard key={post.id} post={post} />)
                )}
            </div>
        </AppLayout>
    );
}
