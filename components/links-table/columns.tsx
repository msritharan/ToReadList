"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import {
    Check,
    MoreHorizontal,
    Star,
    Trash2,
    Undo2,
    SkipForward,
    BookOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LinkItem } from "@/types";

export interface DataTableMeta {
    onLinkUpdate: (id: string, updates: Partial<LinkItem>) => void;
    onLinkDelete: (id: string) => void;
}

const statusConfig: Record<
    LinkItem["status"],
    { label: string; className: string }
> = {
    unread: {
        label: "Unread",
        className:
            "bg-blue-500/15 text-blue-400 border-blue-500/20",
    },
    read: {
        label: "Read",
        className:
            "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    },
    skipped: {
        label: "Skipped",
        className:
            "bg-orange-500/15 text-orange-400 border-orange-500/20",
    },
};

export const columns: ColumnDef<LinkItem>[] = [
    {
        accessorKey: "title",
        header: "Article",
        cell: ({ row }) => {
            const link = row.original;
            return (
                <div className="flex items-center gap-4 py-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={link.favicon_url}
                        alt=""
                        className="w-5 h-5 rounded-sm bg-muted object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>';
                            (e.target as HTMLImageElement).className = "w-5 h-5 opacity-50";
                        }}
                    />
                    <div className="flex items-center gap-2">
                        <a href={link.url} target="_blank" rel="noreferrer" className="font-semibold text-[15px] hover:underline hover:text-primary transition-colors line-clamp-1">
                            {link.title}
                        </a>
                        {link.is_favorite && (
                            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 shrink-0" />
                        )}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "domain",
        header: "Source",
        cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.domain}</span>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;
            const config = statusConfig[status] || statusConfig.unread;
            return (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
                    {config.label}
                </span>
            );
        },
    },
    {
        accessorKey: "created_at",
        header: "Date Saved",
        cell: ({ row }) => {
            const dateStr = row.original.created_at;
            const formatted = formatDistanceToNow(new Date(dateStr), { addSuffix: true });
            return <span className="text-muted-foreground text-sm">{formatted}</span>;
        },
    },
    {
        id: "actions",
        cell: ({ row, table }) => {
            const link = row.original;
            const meta = table.options.meta as DataTableMeta;

            return (
                <div className="flex items-center justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px] bg-popover">
                            {/* Mark as Read / Unread */}
                            {link.status !== "read" && (
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => meta.onLinkUpdate(link.id, { status: "read" })}
                                >
                                    <Check className="mr-2 h-4 w-4 text-emerald-500" />
                                    Mark as Read
                                </DropdownMenuItem>
                            )}
                            {link.status === "read" && (
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => meta.onLinkUpdate(link.id, { status: "unread" })}
                                >
                                    <BookOpen className="mr-2 h-4 w-4 text-blue-500" />
                                    Mark as Unread
                                </DropdownMenuItem>
                            )}

                            {/* Skip / Undo Skip */}
                            {link.status !== "skipped" && (
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => meta.onLinkUpdate(link.id, { status: "skipped" })}
                                >
                                    <SkipForward className="mr-2 h-4 w-4 text-orange-500" />
                                    Skip
                                </DropdownMenuItem>
                            )}
                            {link.status === "skipped" && (
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => meta.onLinkUpdate(link.id, { status: "unread" })}
                                >
                                    <Undo2 className="mr-2 h-4 w-4 text-blue-500" />
                                    Move to Unread
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            {/* Favorite toggle */}
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => meta.onLinkUpdate(link.id, { is_favorite: !link.is_favorite })}
                            >
                                <Star className="mr-2 h-4 w-4 text-yellow-500" fill={link.is_favorite ? "currentColor" : "none"} />
                                {link.is_favorite ? "Unfavorite" : "Favorite"}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {/* Delete */}
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive cursor-pointer focus:bg-destructive/10"
                                onClick={() => meta.onLinkDelete(link.id)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];
