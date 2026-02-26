"use client";

import { useState, useEffect, useCallback } from "react";
import { LinkItem } from "@/types";

export function useLinks() {
    const [links, setLinks] = useState<LinkItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const fetchLinks = useCallback(async () => {
        try {
            const res = await fetch("/api/links");
            if (!res.ok) throw new Error("Failed to fetch links");
            const data = await res.json();
            setLinks(data);
        } catch (err) {
            console.error("Error fetching links:", err);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    useEffect(() => {
        fetchLinks();
    }, [fetchLinks]);

    const addLink = async (newLink: Omit<LinkItem, "id" | "created_at">) => {
        // Optimistic update
        const tempId = crypto.randomUUID();
        const optimisticLink: LinkItem = {
            ...newLink,
            id: tempId,
            created_at: new Date().toISOString(),
        };
        setLinks((prev) => [optimisticLink, ...prev]);

        try {
            const res = await fetch("/api/links", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newLink),
            });

            if (!res.ok) throw new Error("Failed to add link");

            const savedLink = await res.json();
            // Replace optimistic entry with real data from server
            setLinks((prev) =>
                prev.map((link) => (link.id === tempId ? savedLink : link))
            );
        } catch (err) {
            console.error("Error adding link:", err);
            // Revert optimistic update
            setLinks((prev) => prev.filter((link) => link.id !== tempId));
        }
    };

    const updateLink = async (id: string, updates: Partial<LinkItem>) => {
        // Optimistic update
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
            // Revert optimistic update
            setLinks(previousLinks);
        }
    };

    const deleteLink = async (id: string) => {
        // Optimistic update
        const previousLinks = [...links];
        setLinks((prev) => prev.filter((link) => link.id !== id));

        try {
            const res = await fetch(`/api/links/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete link");
        } catch (err) {
            console.error("Error deleting link:", err);
            // Revert optimistic update
            setLinks(previousLinks);
        }
    };

    return { links, addLink, updateLink, deleteLink, isLoaded };
}
