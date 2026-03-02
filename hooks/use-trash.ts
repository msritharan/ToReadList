"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { LinkItem } from "@/types";

export interface UseTrashResult {
    trashItems: LinkItem[];
    trashCount: number;
    isLoading: boolean;
    restoreItem: (id: string) => Promise<void>;
    bulkRestore: (ids: string[]) => Promise<void>;
    deleteForever: (id: string) => Promise<void>;
    bulkDeleteForever: (ids: string[]) => Promise<void>;
    emptyTrash: () => Promise<void>;
    refetch: () => Promise<void>;
}

export function useTrash(): UseTrashResult {
    const queryClient = useQueryClient();

    // Use the exact same query as use-links to share the cache!
    const {
        data: allLinks = [],
        isLoading,
        refetch,
    } = useQuery<LinkItem[]>({
        queryKey: ["links"],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.set("limit", "2000"); // Fetch all
            const res = await fetch(`/api/links?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch links");
            const json = await res.json();
            return json.data ?? [];
        },
    });

    // Derive trash items synchronously
    const trashItems = useMemo(() => {
        return allLinks
            .filter((l) => l.deleted_at !== null)
            .sort((a, b) => new Date(b.deleted_at!).getTime() - new Date(a.deleted_at!).getTime());
    }, [allLinks]);

    const restoreMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/trash/${id}/restore`, { method: "POST" });
            if (!res.ok) throw new Error("Failed to restore item");
            return id;
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ["links"] });
            const previousLinks = queryClient.getQueryData<LinkItem[]>(["links"]);

            // Optimistically restore (set deleted_at to null)
            queryClient.setQueryData<LinkItem[]>(["links"], (old) =>
                old?.map((item) => (item.id === id ? { ...item, deleted_at: null } : item))
            );

            return { previousLinks };
        },
        onError: (err, newTodo, context) => {
            if (context?.previousLinks) {
                queryClient.setQueryData(["links"], context.previousLinks);
            }
        },
    });

    const bulkRestoreMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const res = await fetch("/api/trash/bulk/restore", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids }),
            });
            if (!res.ok) throw new Error("Failed to bulk restore");
            return ids;
        },
        onMutate: async (ids) => {
            await queryClient.cancelQueries({ queryKey: ["links"] });
            const previousLinks = queryClient.getQueryData<LinkItem[]>(["links"]);

            queryClient.setQueryData<LinkItem[]>(["links"], (old) =>
                old?.map((item) => (ids.includes(item.id) ? { ...item, deleted_at: null } : item))
            );

            return { previousLinks };
        },
        onError: (err, newTodo, context) => {
            if (context?.previousLinks) {
                queryClient.setQueryData(["links"], context.previousLinks);
            }
        },
    });

    const deleteForeverMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/links/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete item forever");
            return id;
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ["links"] });
            const previousLinks = queryClient.getQueryData<LinkItem[]>(["links"]);

            queryClient.setQueryData<LinkItem[]>(["links"], (old) =>
                old?.filter((item) => item.id !== id)
            );

            return { previousLinks };
        },
        onError: (err, newTodo, context) => {
            if (context?.previousLinks) {
                queryClient.setQueryData(["links"], context.previousLinks);
            }
        },
    });

    const bulkDeleteForeverMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const res = await fetch("/api/trash", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids }),
            });
            if (!res.ok) throw new Error("Failed to bulk delete");
            return ids;
        },
        onMutate: async (ids) => {
            await queryClient.cancelQueries({ queryKey: ["links"] });
            const previousLinks = queryClient.getQueryData<LinkItem[]>(["links"]);

            queryClient.setQueryData<LinkItem[]>(["links"], (old) =>
                old?.filter((item) => !ids.includes(item.id))
            );

            return { previousLinks };
        },
        onError: (err, newTodo, context) => {
            if (context?.previousLinks) {
                queryClient.setQueryData(["links"], context.previousLinks);
            }
        },
    });

    const emptyTrashMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/trash", { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to empty trash");
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ["links"] });
            const previousLinks = queryClient.getQueryData<LinkItem[]>(["links"]);

            // Remove all items that have deleted_at !== null
            queryClient.setQueryData<LinkItem[]>(["links"], (old) =>
                old?.filter((item) => item.deleted_at === null)
            );

            return { previousLinks };
        },
        onError: (err, newTodo, context) => {
            if (context?.previousLinks) {
                queryClient.setQueryData(["links"], context.previousLinks);
            }
        },
    });


    return {
        trashItems,
        trashCount: trashItems.length,
        isLoading,
        restoreItem: async (id) => { await restoreMutation.mutateAsync(id); },
        bulkRestore: async (ids) => { await bulkRestoreMutation.mutateAsync(ids); },
        deleteForever: async (id) => { await deleteForeverMutation.mutateAsync(id); },
        bulkDeleteForever: async (ids) => { await bulkDeleteForeverMutation.mutateAsync(ids); },
        emptyTrash: async () => { await emptyTrashMutation.mutateAsync(); },
        refetch: async () => { await refetch(); },
    };
}
