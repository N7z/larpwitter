import { Link } from '@inertiajs/react';
import Avatar from '@/components/avatar';
import { RepostTarget } from '@/types';

interface PostEmbedProps {
    post: RepostTarget;
}

export default function PostEmbed({ post }: PostEmbedProps) {
    return (
        <Link href={`/posts/${post.id}`} className="mt-2 block rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
            <div className="flex items-center gap-2">
                <Avatar username={post.user.username} displayName={post.user.display_name} avatarUrl={post.user.avatar_url} size="sm" />
                <span className="text-sm font-semibold text-gray-900">{post.user.display_name}</span>
                <span className="text-sm text-gray-500">@{post.user.username}</span>
            </div>
            {post.body && <p className="mt-1 line-clamp-4 text-sm whitespace-pre-wrap text-gray-800">{post.body}</p>}
            {post.image_url && (
                <div className="relative mt-2 h-64 w-full overflow-hidden rounded-md bg-gray-100">
                    <img
                        src={post.image_url}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-xl"
                    />
                    <img src={post.image_url} alt="" className="relative h-full w-full object-contain" />
                </div>
            )}
        </Link>
    );
}
