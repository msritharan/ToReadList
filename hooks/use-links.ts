"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { LinkItem } from "@/types";

export type LinkStatus = "all" | "unread" | "read" | "skipped";
export const PAGE_SIZE_OPTIONS = [25, 50, 100, 200] as const;
export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];

export interface LinksQueryState {
    page: number;
    limit: PageSizeOption;
    status: LinkStatus;
    isFavorite: boolean;
    search: string;
}

export interface LinksQueryResult {
    links: LinkItem[];
    total: number;
    totalPages: number;
    isLoading: boolean;
    queryState: LinksQueryState;
    setPage: (page: number) => void;
    setLimit: (limit: PageSizeOption) => void;
    setStatus: (status: LinkStatus) => void;
    setIsFavorite: (val: boolean) => void;
    setSearch: (search: string) => void;
    addLink: (link: Omit<LinkItem, "id" | "created_at">) => Promise<void>;
    updateLink: (id: string, updates: Partial<LinkItem>) => Promise<void>;
    bulkUpdateLinks: (ids: string[], updates: Partial<LinkItem>) => Promise<void>;
}

export function useLinksQuery(): LinksQueryResult {
    const [queryState, setQueryState] = useState<LinksQueryState>({
        page: 1,
        limit: 25,
        status: "unread",
        isFavorite: false,
        search: "",
    });

    const [links, setLinks] = useState<LinkItem[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    // Debounce ref for search
    const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Track the search input separately so we can debounce it
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const fetchLinks = useCallback(
        async (state: LinksQueryState, resolvedSearch: string) => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                params.set("page", String(state.page));
                params.set("limit", String(state.limit));
                if (state.status !== "all") params.set("status", state.status);
                if (state.isFavorite) params.set("is_favorite", "true");
                if (resolvedSearch.trim()) params.set("search", resolvedSearch.trim());

                const res = await fetch(`/api/links?${params.toString()}`);
                if (!res.ok) throw new Error("Failed to fetch links");

                const json = await res.json();
                setLinks(json.data ?? []);
                setTotal(json.total ?? 0);
                setTotalPages(json.totalPages ?? 1);
            } catch (err) {
                console.error("Error fetching links:", err);
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    // Re-fetch whenever queryState or debouncedSearch changes
    useEffect(() => {
        fetchLinks(queryState, debouncedSearch);
    }, [queryState, debouncedSearch, fetchLinks]);

    // --- State setters ---
    // Changing filter/search always resets to page 1
    const setPage = useCallback((page: number) => {
        setQueryState((prev) => ({ ...prev, page }));
    }, []);

    const setLimit = useCallback((limit: PageSizeOption) => {
        setQueryState((prev) => ({ ...prev, limit, page: 1 }));
    }, []);

    const setStatus = useCallback((status: LinkStatus) => {
        setQueryState((prev) => ({ ...prev, status, page: 1 }));
    }, []);

    const setIsFavorite = useCallback((isFavorite: boolean) => {
        setQueryState((prev) => ({ ...prev, isFavorite, page: 1 }));
    }, []);

    const setSearch = useCallback((search: string) => {
        // Update the visible input value immediately (via queryState.search)
        setQueryState((prev) => ({ ...prev, search, page: 1 }));
        // Debounce the actual server fetch trigger
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
    }, []);

    // --- Mutations ---
    const addLink = useCallback(
        async (newLink: Omit<LinkItem, "id" | "created_at">) => {
            try {
                const res = await fetch("/api/links", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newLink),
                });
                if (!res.ok) throw new Error("Failed to add link");
                // Re-fetch current page to reflect the new link
                await fetchLinks(queryState, debouncedSearch);
            } catch (err) {
                console.error("Error adding link:", err);
            }
        },
        [queryState, debouncedSearch, fetchLinks]
    );

    const updateLink = useCallback(
        async (id: string, updates: Partial<LinkItem>) => {
            // Optimistic update in-place
            const previousLinks = [...links];
            setLinks((prev) =>
                prev.map((link) => (link.id === id ? { ...link, ...updates } : link))
            );
            try {
                const res = await fetch(`/api/links/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updates),
                });
                if (!res.ok) throw new Error("Failed to update link");
            } catch (err) {
                console.error("Error updating link:", err);
                setLinks(previousLinks);
            }
        },
        [links]
    );

    const bulkUpdateLinks = useCallback(
        async (ids: string[], updates: Partial<LinkItem>) => {
            const previousLinks = [...links];
            setLinks((prev) =>
                prev.map((link) => (ids.includes(link.id) ? { ...link, ...updates } : link))
            );
            try {
                const res = await fetch("/api/links/bulk", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ids, updates }),
                });
                if (!res.ok) throw new Error("Failed to bulk update links");
            } catch (err) {
                console.error("Error bulk updating links:", err);
                setLinks(previousLinks);
            }
        },
        [links]
    );

    return {
        links,
        total,
        totalPages,
        isLoading,
        queryState,
        setPage,
        setLimit,
        setStatus,
        setIsFavorite,
        setSearch,
        addLink,
        updateLink,
        bulkUpdateLinks,
    };
}
