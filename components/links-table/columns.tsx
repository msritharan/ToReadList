"use client";

import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import {
    Check,
    MoreHorizontal,
    Star,
    Undo2,
    SkipForward,
    BookOpen,
    ArrowUp,
    ArrowDown,
    ListFilter,
    X,
    Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { LinkItem } from "@/types";
import { SortOrder, LinkStatus } from "@/hooks/use-links";
import { cn } from "@/lib/utils";

// ─── Column meta ────────────────────────────────────────────────────────────

export interface DataTableMeta {
    onLinkUpdate: (id: string, updates: Partial<LinkItem>) => void;
    onBulkUpdate: (ids: string[], updates: Partial<LinkItem>) => void;
    // Sort
    sortOrder: SortOrder;
    onToggleSortOrder: () => void;
    // Domain filter
    domainFilter: string;
    onDomainFilterChange: (domain: string) => void;
    availableDomains: string[];
    // Status filter
    statusFilter: LinkStatus;
    onStatusFilterChange: (status: LinkStatus) => void;
}

// ─── Status config ───────────────────────────────────────────────────────────

const statusConfig: Record<
    LinkItem["status"],
    { label: string; className: string }
> = {
    unread: {
        label: "Unread",
        className: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    },
    read: {
        label: "Read",
        className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    },
    skipped: {
        label: "Skipped",
        className: "bg-orange-500/15 text-orange-400 border-orange-500/20",
    },
};

const STATUS_OPTIONS: { value: LinkStatus; label: string }[] = [
    { value: "all", label: "All" },
    { value: "unread", label: "Unread" },
    { value: "read", label: "Read" },
    { value: "skipped", label: "Skipped" },
];

// ─── Header helpers ──────────────────────────────────────────────────────────

function SortableDateHeader({ table }: HeaderContext<LinkItem, unknown>) {
    const meta = table.options.meta as DataTableMeta;
    const { sortOrder, onToggleSortOrder } = meta;

    return (
        <button
            onClick={onToggleSortOrder}
            className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground font-medium hover:text-foreground transition-colors group"
        >
            Date Saved
            <span className="transition-transform">
                {sortOrder === "desc" ? (
                    <ArrowDown className="h-3.5 w-3.5 text-primary" />
                ) : (
                    <ArrowUp className="h-3.5 w-3.5 text-primary" />
                )}
            </span>
        </button>
    );
}

function DomainFilterHeader({ table }: HeaderContext<LinkItem, unknown>) {
    const meta = table.options.meta as DataTableMeta;
    const { domainFilter, onDomainFilterChange, availableDomains } = meta;
    const isActive = domainFilter !== "";
    const [search, setSearch] = useState("");

    const filtered = availableDomains.filter((d) =>
        d.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Popover onOpenChange={() => setSearch("")}>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        "flex items-center gap-1.5 text-xs uppercase tracking-wider font-medium hover:text-foreground transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground"
                    )}
                >
                    Source
                    <ListFilter className={cn("h-3.5 w-3.5", isActive && "text-primary")} />
                    {isActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-56 p-0 bg-popover border-border/60">
                {/* Header */}
                <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5 border-b border-border/40">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Filter by Source
                    </span>
                    {isActive && (
                        <button
                            onClick={() => onDomainFilterChange("")}
                            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                        >
                            <X className="h-3 w-3" />
                            Clear
                        </button>
                    )}
                </div>
                {/* Search input */}
                <div className="px-2 pt-2 pb-1">
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                        <input
                            autoFocus
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search sources..."
                            className="w-full pl-7 pr-2 py-1.5 text-sm rounded-md bg-muted/40 border border-border/40 focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/60"
                        />
                    </div>
                </div>
                {/* Scrollable option list */}
                <div className="overflow-y-auto max-h-48 px-2 pb-2 space-y-0.5">
                    {search === "" && (
                        <button
                            onClick={() => onDomainFilterChange("")}
                            className={cn(
                                "w-full text-left px-2 py-1.5 rounded text-sm transition-colors",
                                domainFilter === ""
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                        >
                            All sources
                        </button>
                    )}
                    {filtered.map((domain) => (
                        <button
                            key={domain}
                            onClick={() => onDomainFilterChange(domain)}
                            className={cn(
                                "w-full text-left px-2 py-1.5 rounded text-sm transition-colors truncate",
                                domainFilter === domain
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                        >
                            {domain}
                        </button>
                    ))}
                    {filtered.length === 0 && (
                        <p className="text-xs text-muted-foreground px-2 py-2 italic text-center">
                            No sources match &ldquo;{search}&rdquo;
                        </p>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}

function StatusFilterHeader({ table }: HeaderContext<LinkItem, unknown>) {
    const meta = table.options.meta as DataTableMeta;
    const { statusFilter, onStatusFilterChange } = meta;
    const isActive = statusFilter !== "all";
    const [search, setSearch] = useState("");

    const filtered = STATUS_OPTIONS.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Popover onOpenChange={() => setSearch("")}>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        "flex items-center gap-1.5 text-xs uppercase tracking-wider font-medium hover:text-foreground transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground"
                    )}
                >
                    Status
                    <ListFilter className={cn("h-3.5 w-3.5", isActive && "text-primary")} />
                    {isActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-48 p-0 bg-popover border-border/60">
                {/* Header */}
                <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5 border-b border-border/40">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Filter by Status
                    </span>
                    {isActive && (
                        <button
                            onClick={() => onStatusFilterChange("all")}
                            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                        >
                            <X className="h-3 w-3" />
                            Clear
                        </button>
                    )}
                </div>
                {/* Search input */}
                <div className="px-2 pt-2 pb-1">
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                        <input
                            autoFocus
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search status..."
                            className="w-full pl-7 pr-2 py-1.5 text-sm rounded-md bg-muted/40 border border-border/40 focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/60"
                        />
                    </div>
                </div>
                {/* Scrollable option list */}
                <div className="overflow-y-auto max-h-48 px-2 pb-2 space-y-0.5">
                    {filtered.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => onStatusFilterChange(opt.value)}
                            className={cn(
                                "w-full text-left px-2 py-1.5 rounded text-sm transition-colors",
                                statusFilter === opt.value
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                        >
                            {opt.label}
                        </button>
                    ))}
                    {filtered.length === 0 && (
                        <p className="text-xs text-muted-foreground px-2 py-2 italic text-center">
                            No match for &ldquo;{search}&rdquo;
                        </p>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}

// ─── Column definitions ───────────────────────────────────────────────────────

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
        header: (ctx) => <DomainFilterHeader {...ctx} />,
        cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.domain}</span>,
    },
    {
        accessorKey: "status",
        header: (ctx) => <StatusFilterHeader {...ctx} />,
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
        header: (ctx) => <SortableDateHeader {...ctx} />,
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

                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => meta.onLinkUpdate(link.id, { is_favorite: !link.is_favorite })}
                            >
                                <Star className="mr-2 h-4 w-4 text-yellow-500" fill={link.is_favorite ? "currentColor" : "none"} />
                                {link.is_favorite ? "Unfavorite" : "Favorite"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];

export const selectionColumn: ColumnDef<LinkItem> = {
    id: "select",
    header: ({ table }) => (
        <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
        />
    ),
    cell: ({ row }) => (
        <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
        />
    ),
    enableSorting: false,
    enableHiding: false,
};
