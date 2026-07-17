export type VerificationType = 0 | 1 | 2;

export const VERIFICATION_NONE: VerificationType = 0;
export const VERIFICATION_VERIFIED: VerificationType = 1;
export const VERIFICATION_COMPANY: VerificationType = 2;

export interface UserInfo {
    id: number;
    username: string;
    display_name: string;
    avatar_url: string | null;
    is_admin?: boolean;
    is_verified?: VerificationType;
}

export interface ProfileUser extends UserInfo {
    bio: string | null;
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
    parent?: RepostTarget | null;
}

export interface NotificationItem {
    id: string;
    type: 'like' | 'reply' | 'repost' | 'follow' | 'mention' | 'verified' | 'admin' | 'post_removed' | 'typing_race';
    actor: UserInfo | null;
    post_id: number | null;
    race_id: number | null;
    is_quote: boolean;
    excerpt: string | null;
    is_new: boolean;
    created_at: string;
}

export interface RacerInfo extends UserInfo {
    progress: number;
    wpm: number | null;
    accuracy: number | null;
    finished: boolean;
}

export interface TypingRaceState {
    id: number;
    status: 'pending' | 'active' | 'finished' | 'declined' | 'expired';
    passage: string;
    starts_at: string | null;
    server_now: string;
    me: 'challenger' | 'opponent' | null;
    winner_id: number | null;
    post_id: number | null;
    challenger: RacerInfo;
    opponent: RacerInfo;
}

export interface SidebarUser extends UserInfo {
    is_following: boolean;
}

export interface TrendingHashtag {
    id: number;
    name: string;
    posts_count: number;
}

export interface Shared {
    auth: { user: UserInfo | null };
    flash: { status: string | null };
    unreadNotificationsCount: number;
    newUsers: SidebarUser[];
    trendingHashtags: TrendingHashtag[];
    [key: string]: unknown;
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    total: number;
}

export interface AdminStats {
    users: number;
    admins: number;
    posts: number;
    replies: number;
    reposts: number;
    likes: number;
    follows: number;
}

export interface AdminRecentUser {
    id: number;
    username: string;
    display_name: string;
    created_at: string;
}

export interface AdminUserRow {
    id: number;
    username: string;
    display_name: string;
    avatar_url: string | null;
    is_admin: boolean;
    is_verified: VerificationType;
    created_at: string;
    posts_count: number;
    followers_count: number;
    following_count: number;
}

export interface AdminPostRow {
    id: number;
    body: string;
    image_url: string | null;
    created_at: string;
    user: UserInfo;
    parent_id: number | null;
    repost_of_id: number | null;
    likes_count: number;
    replies_count: number;
    reposts_count: number;
}
