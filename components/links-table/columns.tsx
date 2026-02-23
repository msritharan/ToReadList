"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { Archive, Check, MoreHorizontal, Star, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LinkItem } from "@/types";

export interface DataTableMeta {
    onLinkUpdate: (id: string, updates: Partial<LinkItem>) => void;
    onLinkDelete: (id: string) => void;
}

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
                    <div className="flex flex-col">
                        <a href={link.url} target="_blank" rel="noreferrer" className="font-semibold text-[15px] hover:underline hover:text-primary transition-colors line-clamp-1">
                            {link.title}
                        </a>
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
            const isFav = link.is_favorite;
            const meta = table.options.meta as DataTableMeta;

            return (
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-green-500 hover:bg-green-500/10"
                        title={link.status === "read" ? "Mark as Unread" : "Mark as Read"}
                        onClick={() => meta.onLinkUpdate(link.id, { status: link.status === "read" ? "unread" : "read" })}
                    >
                        <Check className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10"
                        title={isFav ? "Unfavorite" : "Favorite"}
                        onClick={() => meta.onLinkUpdate(link.id, { is_favorite: !isFav })}
                    >
                        <Star className="h-4 w-4" fill={isFav ? "currentColor" : "none"} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10"
                        title={link.status === "archived" ? "Unarchive" : "Archive"}
                        onClick={() => meta.onLinkUpdate(link.id, { status: link.status === "archived" ? "unread" : "archived" })}
                    >
                        <Archive className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px] bg-popover">
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
