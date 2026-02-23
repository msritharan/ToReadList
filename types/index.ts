export type LinkItem = {
    id: string;
    url: string;
    title: string;
    domain: string;
    favicon_url: string;
    status: "unread" | "read" | "archived" | "wont_read";
    is_favorite: boolean;
    created_at: string;
};
