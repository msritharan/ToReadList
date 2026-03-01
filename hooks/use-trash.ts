"use client";

import { useState, useEffect, useCallback } from "react";
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
    const [trashItems, setTrashItems] = useState<LinkItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTrash = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/trash");
            if (!res.ok) throw new Error("Failed to fetch trash");
            const json = await res.json();
            setTrashItems(json.data ?? []);
        } catch (err) {
            console.error("Error fetching trash:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTrash();
    }, [fetchTrash]);

    const restoreItem = useCallback(
        async (id: string) => {
            setTrashItems((prev) => prev.filter((item) => item.id !== id));
            try {
                const res = await fetch(`/api/trash/${id}/restore`, { method: "POST" });
                if (!res.ok) throw new Error("Failed to restore item");
            } catch (err) {
                console.error("Error restoring item:", err);
                await fetchTrash();
            }
        },
        [fetchTrash]
    );

    const bulkRestore = useCallback(
        async (ids: string[]) => {
            setTrashItems((prev) => prev.filter((item) => !ids.includes(item.id)));
            try {
                const res = await fetch("/api/trash/bulk/restore", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ids }),
                });
                if (!res.ok) throw new Error("Failed to bulk restore");
            } catch (err) {
                console.error("Error bulk restoring items:", err);
                await fetchTrash();
            }
        },
        [fetchTrash]
    );

    const deleteForever = useCallback(
        async (id: string) => {
            setTrashItems((prev) => prev.filter((item) => item.id !== id));
            try {
                const res = await fetch(`/api/links/${id}`, { method: "DELETE" });
                if (!res.ok) throw new Error("Failed to delete item");
            } catch (err) {
                console.error("Error deleting item:", err);
                await fetchTrash();
            }
        },
        [fetchTrash]
    );

    const bulkDeleteForever = useCallback(
        async (ids: string[]) => {
            setTrashItems((prev) => prev.filter((item) => !ids.includes(item.id)));
            try {
                const res = await fetch("/api/trash", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ids }),
                });
                if (!res.ok) throw new Error("Failed to bulk delete");
            } catch (err) {
                console.error("Error bulk deleting items:", err);
                await fetchTrash();
            }
        },
        [fetchTrash]
    );

    const emptyTrash = useCallback(async () => {
        const previous = [...trashItems];
        setTrashItems([]);
        try {
            const res = await fetch("/api/trash", { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to empty trash");
        } catch (err) {
            console.error("Error emptying trash:", err);
            setTrashItems(previous);
        }
    }, [trashItems]);

    return {
        trashItems,
        trashCount: trashItems.length,
        isLoading,
        restoreItem,
        bulkRestore,
        deleteForever,
        bulkDeleteForever,
        emptyTrash,
        refetch: fetchTrash,
    };
}
