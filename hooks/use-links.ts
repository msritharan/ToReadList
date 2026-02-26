"use client";

import { useState, useEffect } from "react";
import { LinkItem } from "@/types";

const mockData: LinkItem[] = [
    {
        id: "1",
        url: "https://wired.com/future-of-ai",
        title: "The Future of AI in Productivity Apps",
        domain: "wired.com",
        favicon_url: "https://www.google.com/s2/favicons?domain=wired.com&sz=64",
        status: "unread",
        is_favorite: false,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    {
        id: "2",
        url: "https://nytimes.com/deep-work",
        title: "How to Master Deep Work in a Distracted World",
        domain: "nytimes.com",
        favicon_url: "https://www.google.com/s2/favicons?domain=nytimes.com&sz=64",
        status: "unread",
        is_favorite: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
        id: "3",
        url: "https://techcrunch.com/startup-advice",
        title: "10 Lessons from Y Combinator Founders",
        domain: "techcrunch.com",
        favicon_url: "https://www.google.com/s2/favicons?domain=techcrunch.com&sz=64",
        status: "unread",
        is_favorite: false,
        created_at: new Date().toISOString(),
    },
];

export function useLinks() {
    const [links, setLinks] = useState<LinkItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("toreadlist_links");
        if (stored) {
            setLinks(JSON.parse(stored));
        } else {
            setLinks(mockData);
            localStorage.setItem("toreadlist_links", JSON.stringify(mockData));
        }
        setIsLoaded(true);
    }, []);

    const updateLink = (id: string, updates: Partial<LinkItem>) => {
        setLinks((prev) => {
            const newLinks = prev.map((link) => (link.id === id ? { ...link, ...updates } : link));
            localStorage.setItem("toreadlist_links", JSON.stringify(newLinks));
            return newLinks;
        });
    };

    const deleteLink = (id: string) => {
        setLinks((prev) => {
            const newLinks = prev.filter((link) => link.id !== id);
            localStorage.setItem("toreadlist_links", JSON.stringify(newLinks));
            return newLinks;
        });
    };

    const addLink = (newLink: Omit<LinkItem, "id" | "created_at">) => {
        setLinks((prev) => {
            const link: LinkItem = {
                ...newLink,
                id: crypto.randomUUID(),
                created_at: new Date().toISOString(),
            };
            const newLinks = [link, ...prev];
            localStorage.setItem("toreadlist_links", JSON.stringify(newLinks));
            return newLinks;
        });
    };

    return { links, addLink, updateLink, deleteLink, isLoaded };
}
