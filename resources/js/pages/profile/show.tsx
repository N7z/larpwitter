import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AvatarUpload from '@/components/avatar-upload';
import Avatar from '@/components/avatar';
import BioEditor from '@/components/bio-editor';
import ChallengeButton from '@/components/challenge-button';
import DisplayNameEditor from '@/components/display-name-editor';
import FollowButton from '@/components/follow-button';
import PostCard from '@/components/post-card';
import Seo from '@/components/seo';
import UserBadge from '@/components/user-badge';
import AppLayout from '@/layouts/app-layout';
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
    const [displayName, setDisplayName] = useState(profileUser.display_name);

    useEffect(() => {
        setAvatarUrl(profileUser.avatar_url);
    }, [profileUser.avatar_url]);

    useEffect(() => {
        setBio(profileUser.bio);
    }, [profileUser.bio]);

    useEffect(() => {
        setDisplayName(profileUser.display_name);
    }, [profileUser.display_name]);

    return (
        <AppLayout>
            <Seo title={`${profileUser.display_name} (@${profileUser.username})`} />

            <div className="mb-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar username={profileUser.username} displayName={profileUser.display_name} avatarUrl={avatarUrl} size="lg" />
                        <div>
                            <h1 className="flex items-center gap-1 text-xl font-bold text-gray-900 dark:text-gray-100">
                                {displayName}
                                <UserBadge user={profileUser} className="h-5 w-5" />
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">@{profileUser.username}</p>
                            {isOwnProfile && (
                                <div className="mt-1 flex items-center gap-3">
                                    <AvatarUpload onPreview={setAvatarUrl} />
                                    <DisplayNameEditor displayName={displayName} onSaved={setDisplayName} />
                                </div>
                            )}
                        </div>
                    </div>
                    {isFollowing !== null && (
                        <div className="flex items-center gap-2">
                            <ChallengeButton username={profileUser.username} />
                            <FollowButton username={profileUser.username} isFollowing={isFollowing} />
                        </div>
                    )}
                </div>

                <div className="mt-3">
                    {isOwnProfile ? (
                        <BioEditor bio={bio} onSaved={setBio} />
                    ) : (
                        bio && <p className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">{bio}</p>
                    )}
                </div>

                <div className="mt-4 flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>
                        <strong className="text-gray-900 dark:text-gray-100">{postsCount + repliesCount}</strong> posts
                    </span>
                    <span>
                        <strong className="text-gray-900 dark:text-gray-100">{followersCount}</strong> followers
                    </span>
                    <span>
                        <strong className="text-gray-900 dark:text-gray-100">{followingCount}</strong> following
                    </span>
                </div>
            </div>

            <div className="mb-4 flex gap-4 border-b border-gray-200 text-sm font-medium dark:border-gray-800">
                <Link
                    href={`/u/${profileUser.username}?tab=posts`}
                    preserveState
                    className={`-mb-px border-b-2 px-1 pb-2 ${
                        tab === 'posts'
                            ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400'
                    }`}
                >
                    Posts
                </Link>
                <Link
                    href={`/u/${profileUser.username}?tab=replies`}
                    preserveState
                    className={`-mb-px border-b-2 px-1 pb-2 ${
                        tab === 'replies'
                            ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400'
                    }`}
                >
                    Replies
                </Link>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                {posts.length === 0 ? (
                    <p className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        {tab === 'replies' ? 'No replies yet.' : 'No posts yet.'}
                    </p>
                ) : (
                    posts.map((post) => <PostCard key={post.id} post={post} />)
                )}
            </div>
        </AppLayout>
    );
}
