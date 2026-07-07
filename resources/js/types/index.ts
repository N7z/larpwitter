export interface UserInfo {
    id: number;
    username: string;
    display_name: string;
    avatar_url: string | null;
}

export interface RepostTarget {
    id: number;
    body: string;
    image_url: string | null;
    created_at: string;
    user: UserInfo;
}

export interface PostItem {
    id: number;
    body: string;
    image_url: string | null;
    created_at: string;
    user: UserInfo;
    likes_count: number;
    replies_count: number;
    reposts_count: number;
    liked: boolean;
    parent_id: number | null;
    repost_of: RepostTarget | null;
}

export interface NotificationItem {
    id: string;
    type: 'like' | 'reply' | 'repost' | 'follow';
    actor: UserInfo | null;
    post_id: number | null;
    is_quote: boolean;
    is_new: boolean;
    created_at: string;
}

export interface Shared {
    auth: { user: UserInfo | null };
    flash: { status: string | null };
    unreadNotificationsCount: number;
    [key: string]: unknown;
}
