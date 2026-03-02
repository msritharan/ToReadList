"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LinkItem } from "@/types";

export type LinkStatus = "all" | "unread" | "read" | "skipped";
export type SortOrder = "asc" | "desc";
export const PAGE_SIZE_OPTIONS = [25, 50, 100, 200] as const;
export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];

export interface LinksQueryState {
    page: number;
    limit: PageSizeOption;
    status: LinkStatus;
    isFavorite: boolean;
    search: string;
    sortBy: "created_at";
    sortOrder: SortOrder;
    domainFilter: string;
    tagFilter: string;
}

export interface LinksQueryResult {
    links: LinkItem[];
    allLinks: LinkItem[];
    total: number;
    totalPages: number;
    isLoading: boolean;
    queryState: LinksQueryState;
    setPage: (page: number) => void;
    setLimit: (limit: PageSizeOption) => void;
    setStatus: (status: LinkStatus) => void;
    setIsFavorite: (val: boolean) => void;
    setSearch: (search: string) => void;
    setSortOrder: (order: SortOrder) => void;
    toggleSortOrder: () => void;
    setDomainFilter: (domain: string) => void;
    setTagFilter: (tag: string) => void;
    addLink: (link: Omit<LinkItem, "id" | "created_at">) => Promise<void>;
    updateLink: (id: string, updates: Partial<LinkItem>) => Promise<void>;
    bulkUpdateLinks: (ids: string[], updates: Partial<LinkItem>) => Promise<void>;
    deleteLink: (id: string) => Promise<void>;
    bulkDeleteLinks: (ids: string[]) => Promise<void>;
}

export function useLinksQuery(): LinksQueryResult {
    const queryClient = useQueryClient();

    const [queryState, setQueryState] = useState<LinksQueryState>({
        page: 1,
        limit: 25,
        status: "unread",
        isFavorite: false,
        search: "",
        sortBy: "created_at",
        sortOrder: "desc",
        domainFilter: "",
        tagFilter: "",
    });

    // 1. Fetch ALL links once (up to 2000)
    const { data: allLinks = [], isLoading: isFetchingLinks } = useQuery<LinkItem[]>({
        queryKey: ["links"],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.set("limit", "2000"); // Fetch all
            // IMPORTANT: Remove filters here so we get everything

            const res = await fetch(`/api/links?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch links");
            const json = await res.json();
            return json.data ?? [];
        },
    });

    // 2. Synchronously derive paginated/filtered data from the cache
    const { links: currentLinks, total, totalPages } = useMemo(() => {
        // First, explicitly filter out items that are in the trash
        let filtered = allLinks.filter((l) => l.deleted_at === null);

        // Apply Status Filter
        if (queryState.status !== "all") {
            filtered = filtered.filter((l) => l.status === queryState.status);
        }

        // Apply Favorites Filter
        if (queryState.isFavorite) {
            filtered = filtered.filter((l) => l.is_favorite === true);
        }

        // Apply Domain Filter
        if (queryState.domainFilter.trim()) {
            filtered = filtered.filter((l) => l.domain === queryState.domainFilter.trim());
        }

        // Apply Tag Filter
        if (queryState.tagFilter.trim()) {
            const lowerTag = queryState.tagFilter.toLowerCase();
            filtered = filtered.filter((l) => 
                l.tags?.some((tag) => tag.toLowerCase() === lowerTag)
            );
        }

        // Apply Search Filter
        if (queryState.search.trim()) {
            const lowerSearch = queryState.search.toLowerCase();
            filtered = filtered.filter(
                (l) =>
                    (l.title && l.title.toLowerCase().includes(lowerSearch)) ||
                    (l.url && l.url.toLowerCase().includes(lowerSearch)) ||
                    (l.domain && l.domain.toLowerCase().includes(lowerSearch))
            );
        }

        // Sort
        filtered.sort((a, b) => {
            if (queryState.sortBy === "created_at") {
                const dateA = new Date(a.created_at || 0).getTime();
                const dateB = new Date(b.created_at || 0).getTime();
                return queryState.sortOrder === "asc" ? dateA - dateB : dateB - dateA;
            }
            return 0;
        });

        const totalItems = filtered.length;
        const totalPgs = Math.max(1, Math.ceil(totalItems / queryState.limit));

        // Ensure page is within bounds if filter drastically reduces results
        const safePage = Math.min(queryState.page, totalPgs);
        if (safePage !== queryState.page && safePage > 0) {
            // It's considered bad practice to setState in useMemo, but we handle safePage slice here.
            // The actual page state will catch up next explicit setter.
        }

        // Paginate
        const start = (Math.min(queryState.page, totalPgs) - 1) * queryState.limit;
        const end = start + queryState.limit;
        const paginated = filtered.slice(start, end);

        return {
            links: paginated,
            total: totalItems,
            totalPages: totalPgs,
        };
    }, [allLinks, queryState]);


    // --- State setters ---
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
        // No longer tracking debounced state here since filtering is instant locally
        setQueryState((prev) => ({ ...prev, search, page: 1 }));
    }, []);

    const setSortOrder = useCallback((sortOrder: SortOrder) => {
        setQueryState((prev) => ({ ...prev, sortOrder, page: 1 }));
    }, []);

    const toggleSortOrder = useCallback(() => {
        setQueryState((prev) => ({
            ...prev,
            sortOrder: prev.sortOrder === "desc" ? "asc" : "desc",
            page: 1,
        }));
    }, []);

    const setDomainFilter = useCallback((domainFilter: string) => {
        setQueryState((prev) => ({ ...prev, domainFilter, page: 1 }));
    }, []);

    const setTagFilter = useCallback((tagFilter: string) => {
        setQueryState((prev) => ({ ...prev, tagFilter, page: 1 }));
    }, []);


    // --- Mutations ---

    const addMutation = useMutation({
        mutationFn: async (newLink: Omit<LinkItem, "id" | "created_at">) => {
            const res = await fetch("/api/links", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newLink),
            });
            if (!res.ok) throw new Error("Failed to add link");
            return res.json();
        },
        onSuccess: (addedLink) => {
            queryClient.setQueryData<LinkItem[]>(["links"], (old) => {
                return [(addedLink as LinkItem), ...(old || [])];
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<LinkItem> }) => {
            const res = await fetch(`/api/links/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            if (!res.ok) throw new Error("Failed to update link");
            return { id, updates };
        },
        onMutate: async ({ id, updates }) => {
            await queryClient.cancelQueries({ queryKey: ["links"] });
            const previousLinks = queryClient.getQueryData<LinkItem[]>(["links"]);
            queryClient.setQueryData<LinkItem[]>(["links"], (old) =>
                old?.map((link) => (link.id === id ? { ...link, ...updates } : link))
            );
            return { previousLinks };
        },
        onError: (err, newTodo, context) => {
            if (context?.previousLinks) {
                queryClient.setQueryData(["links"], context.previousLinks);
            }
        },
    });

    const bulkUpdateMutation = useMutation({
        mutationFn: async ({ ids, updates }: { ids: string[]; updates: Partial<LinkItem> }) => {
            const res = await fetch("/api/links/bulk", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids, updates }),
            });
            if (!res.ok) throw new Error("Failed to bulk update links");
            return { ids, updates };
        },
        onMutate: async ({ ids, updates }) => {
            await queryClient.cancelQueries({ queryKey: ["links"] });
            const previousLinks = queryClient.getQueryData<LinkItem[]>(["links"]);
            queryClient.setQueryData<LinkItem[]>(["links"], (old) =>
                old?.map((link) => (ids.includes(link.id) ? { ...link, ...updates } : link))
            );
            return { previousLinks };
        },
        onError: (err, newTodo, context) => {
            if (context?.previousLinks) {
                queryClient.setQueryData(["links"], context.previousLinks);
            }
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/links/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ deleted_at: new Date().toISOString() }),
            });
            if (!res.ok) throw new Error("Failed to delete link");
            return id;
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ["links"] });
            const previousLinks = queryClient.getQueryData<LinkItem[]>(["links"]);
            queryClient.setQueryData<LinkItem[]>(["links"], (old) =>
                old?.filter((link) => link.id !== id)
            );
            return { previousLinks };
        },
        onError: (err, newTodo, context) => {
            if (context?.previousLinks) {
                queryClient.setQueryData(["links"], context.previousLinks);
            }
        },
        onSuccess: () => {
            // Invalidate trash to trigger a refetch there since we added an item
            queryClient.invalidateQueries({ queryKey: ["trash"] });
        }
    });

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const res = await fetch("/api/links/bulk", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ids,
                    updates: { deleted_at: new Date().toISOString() },
                }),
            });
            if (!res.ok) throw new Error("Failed to bulk delete links");
            return ids;
        },
        onMutate: async (ids) => {
            await queryClient.cancelQueries({ queryKey: ["links"] });
            const previousLinks = queryClient.getQueryData<LinkItem[]>(["links"]);
            queryClient.setQueryData<LinkItem[]>(["links"], (old) =>
                old?.filter((link) => !ids.includes(link.id))
            );
            return { previousLinks };
        },
        onError: (err, newTodo, context) => {
            if (context?.previousLinks) {
                queryClient.setQueryData(["links"], context.previousLinks);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["trash"] });
        }
    });

    return {
        links: currentLinks,
        allLinks,
        total,
        totalPages,
        isLoading: isFetchingLinks,
        queryState,
        setPage,
        setLimit,
        setStatus,
        setIsFavorite,
        setSearch,
        setSortOrder,
        toggleSortOrder,
        setDomainFilter,
        setTagFilter,
        addLink: async (link) => { await addMutation.mutateAsync(link); },
        updateLink: async (id, updates) => { await updateMutation.mutateAsync({ id, updates }); },
        bulkUpdateLinks: async (ids, updates) => { await bulkUpdateMutation.mutateAsync({ ids, updates }); },
        deleteLink: async (id) => { await deleteMutation.mutateAsync(id); },
        bulkDeleteLinks: async (ids) => { await bulkDeleteMutation.mutateAsync(ids); },
    };
}
