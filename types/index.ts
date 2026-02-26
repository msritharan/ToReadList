export type LinkItem = {
    id: string;
    user_id?: string;
    url: string;
    title: string;
    description?: string;
    domain: string;
    favicon_url: string;
    content_type?: string;
    extraction_status?: string;
    source?: string;
    status: "unread" | "read" | "archived" | "wont_read";
    is_favorite: boolean;
    reading_time_mins?: number;
    read_at?: string;
    created_at: string;
    updated_at?: string;
};
