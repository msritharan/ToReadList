"use client";

import { useState, useEffect } from "react";
import { Globe, Loader2, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { LinkItem } from "@/types";

interface AddLinkDialogProps {
    onAddLink: (link: Omit<LinkItem, "id" | "created_at">) => void;
    trigger: React.ReactNode;
    initialUrl?: string;
    initialTitle?: string;
    initialDescription?: string;
}

function extractDomain(url: string): string {
    try {
        return new URL(url).hostname.replace("www.", "");
    } catch {
        return "";
    }
}

function isValidUrl(str: string): boolean {
    try {
        const url = new URL(str);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

export function AddLinkDialog({ onAddLink, trigger, initialUrl = "", initialTitle = "", initialDescription = "" }: AddLinkDialogProps) {
    const [open, setOpen] = useState(false);
    const [url, setUrl] = useState(initialUrl);
    const [title, setTitle] = useState(initialTitle);
    const [description] = useState(initialDescription);
    const [isExtracting, setIsExtracting] = useState(false);

    // Open dialog automatically when initial URL is provided
    useEffect(() => {
        if (initialUrl) {
            setOpen(true);
        }
    }, [initialUrl]);

    const domain = extractDomain(url);
    const faviconUrl = domain
        ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
        : "";
    const urlValid = isValidUrl(url);

    // Auto-generate a title placeholder from the URL when no custom title is provided
    useEffect(() => {
        if (url && urlValid && !title) {
            // Push update to next tick to avoid synchronous update in render
            const initialTimer = setTimeout(() => setIsExtracting(true), 0);
            const extractTimer = setTimeout(() => {
                setIsExtracting(false);
            }, 600);
            return () => {
                clearTimeout(initialTimer);
                clearTimeout(extractTimer);
            };
        } else {
            const timer = setTimeout(() => setIsExtracting(false), 0);
            return () => clearTimeout(timer);
        }
    }, [url, urlValid, title]);

    const handleSubmit = () => {
        if (!url || !urlValid) return;

        onAddLink({
            url,
            title: title || domain || url,
            description: description || undefined,
            domain,
            favicon_url: faviconUrl,
            status: "unread",
            is_favorite: false,
        });

        // Reset and close
        setUrl("");
        setTitle("");
        setOpen(false);
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            setUrl("");
            setTitle("");
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[480px] bg-card border-border/40">
                <DialogHeader>
                    <DialogTitle className="text-lg">Add a new link</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Paste a URL to save it to your reading list.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* URL Input */}
                    <div className="space-y-2">
                        <label
                            htmlFor="url"
                            className="text-sm font-medium text-foreground"
                        >
                            URL
                        </label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="url"
                                placeholder="https://example.com/article"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="pl-9 bg-muted/50 border-border/40 focus-visible:ring-1 focus-visible:ring-primary/50"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Title Input */}
                    <div className="space-y-2">
                        <label
                            htmlFor="title"
                            className="text-sm font-medium text-foreground"
                        >
                            Title{" "}
                            <span className="text-muted-foreground font-normal">
                                (optional)
                            </span>
                        </label>
                        <Input
                            id="title"
                            placeholder={
                                domain
                                    ? `Article from ${domain}`
                                    : "Enter a custom title..."
                            }
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-muted/50 border-border/40 focus-visible:ring-1 focus-visible:ring-primary/50"
                        />
                    </div>

                    {/* Live Preview */}
                    {urlValid && (
                        <div className="rounded-lg border border-border/40 bg-muted/20 p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                                Preview
                            </p>
                            <div className="flex items-center gap-3">
                                {isExtracting ? (
                                    <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                                ) : (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={faviconUrl}
                                        alt=""
                                        className="w-5 h-5 rounded-sm bg-muted object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = "none";
                                        }}
                                    />
                                )}
                                <div className="flex flex-col min-w-0">
                                    <span className="font-semibold text-[15px] text-foreground truncate">
                                        {title || domain || url}
                                    </span>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                        <Globe className="h-3 w-3" />
                                        {domain}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => handleOpenChange(false)}
                        className="text-muted-foreground"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!urlValid}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
                    >
                        Save Link
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
