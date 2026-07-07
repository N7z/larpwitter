export interface UserInfo {
    id: number;
    username: string;
    display_name: string;
}

export interface PostItem {
    id: number;
    body: string;
    created_at: string;
    user: UserInfo;
    likes_count: number;
    replies_count: number;
    liked: boolean;
    parent_id: number | null;
}

export interface Shared {
    auth: { user: UserInfo | null };
    flash: { status: string | null };
    [key: string]: unknown;
}
