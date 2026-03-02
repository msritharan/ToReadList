"use client";

import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { useState, Fragment } from "react";
import {
    ArrowDown,
    ArrowUp,
    ListFilter,
    MoreVertical,
    Search,
    Star,
    X,
    ChevronUp,
    ChevronDown,
    Check,
    BookOpen,
    SkipForward,
    Undo2,
    Trash2,
    Tag,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

// ─── Tag color utilities ───────────────────────────────────────────────────────

const TAG_COLORS = [
    { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/20" },
    { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/20" },
    { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/20" },
    { bg: "bg-rose-500/15", text: "text-rose-400", border: "border-rose-500/20" },
    { bg: "bg-cyan-500/15", text: "text-cyan-400", border: "border-cyan-500/20" },
    { bg: "bg-indigo-500/15", text: "text-indigo-400", border: "border-indigo-500/20" },
    { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/20" },
    { bg: "bg-pink-500/15", text: "text-pink-400", border: "border-pink-500/20" },
    { bg: "bg-teal-500/15", text: "text-teal-400", border: "border-teal-500/20" },
    { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/20" },
];

function getTagColor(tag: string) {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = ((hash << 5) - hash) + tag.charCodeAt(i);
        hash = hash & hash;
    }
    const index = Math.abs(hash) % TAG_COLORS.length;
    return TAG_COLORS[index];
}

// ─── Column size configuration ─────────────────────────────────────────────────
// Multipliers are relative weights for flexible columns (only title and description are resizable)
// Fixed values are in pixels
export const COLUMN_CONFIG = {
    select: { type: "fixed" as const, value: 40, minSize: 40 },
    title: { type: "multiplier" as const, value: 1.5, minSize: 80 },
    description: { type: "multiplier" as const, value: 2, minSize: 50 },
    domain: { type: "fixed" as const, value: 100, minSize: 60 },
    tags: { type: "fixed" as const, value: 120, minSize: 80 },
    status: { type: "fixed" as const, value: 100, minSize: 60 },
    created_at: { type: "fixed" as const, value: 120, minSize: 70 },
    actions: { type: "fixed" as const, value: 40, minSize: 40 },
} as const;

export type ColumnId = keyof typeof COLUMN_CONFIG;

// ─── Column meta ────────────────────────────────────────────────────────────

export interface DataTableMeta {
    onLinkUpdate: (id: string, updates: Partial<LinkItem>) => void;
    onBulkUpdate: (ids: string[], updates: Partial<LinkItem>) => void;
    onDeleteLink?: (id: string) => void;
    onBulkDeleteLink?: (ids: string[]) => void;
    // Trash specific
    isTrashView?: boolean;
    onRestoreLink?: (id: string) => void;
    onDeleteForever?: (id: string) => void;
    // Sort
    sortOrder: SortOrder;
    onToggleSortOrder: () => void;
    // Domain filter
    domainFilter: string;
    onDomainFilterChange: (domain: string) => void;
    availableDomains: string[];
    // Tag filter
    tagFilter: string;
    onTagFilterChange: (tag: string) => void;
    availableTags: string[];
    // Status filter
    statusFilter: LinkStatus;
    onStatusFilterChange: (status: LinkStatus) => void;
    // Column resize
    onColumnResize?: (columnId: string, width: number) => void;
    onResetColumnSizes?: () => void;
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

function TagFilterHeader({ table }: HeaderContext<LinkItem, unknown>) {
    const meta = table.options.meta as DataTableMeta;
    const { tagFilter, onTagFilterChange, availableTags } = meta;
    const isActive = tagFilter !== "";
    const [search, setSearch] = useState("");

    const filtered = availableTags.filter((t) =>
        t.toLowerCase().includes(search.toLowerCase())
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
                    Tags
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
                        Filter by Tag
                    </span>
                    {isActive && (
                        <button
                            onClick={() => onTagFilterChange("")}
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
                            placeholder="Search tags..."
                            className="w-full pl-7 pr-2 py-1.5 text-sm rounded-md bg-muted/40 border border-border/40 focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/60"
                        />
                    </div>
                </div>
                {/* Scrollable option list */}
                <div className="overflow-y-auto max-h-48 px-2 pb-2 space-y-0.5">
                    {search === "" && (
                        <button
                            onClick={() => onTagFilterChange("")}
                            className={cn(
                                "w-full text-left px-2 py-1.5 rounded text-sm transition-colors",
                                tagFilter === ""
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                        >
                            All tags
                        </button>
                    )}
                    {filtered.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => onTagFilterChange(tag)}
                            className={cn(
                                "w-full text-left px-2 py-1.5 rounded text-sm transition-colors truncate",
                                tagFilter === tag
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                        >
                            {tag}
                        </button>
                    ))}
                    {filtered.length === 0 && (
                        <p className="text-xs text-muted-foreground px-2 py-2 italic text-center">
                            No tags match &ldquo;{search}&rdquo;
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

type DescriptionCellProps = {
    description: string;
    variant?: "desktop" | "mobile";
};

function DescriptionCell({ description, variant = "desktop" }: DescriptionCellProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const shouldTruncateDesktop = description.length > 150;
    const shouldTruncateMobile = description.length > 100;
    
    const shouldTruncate = variant === "mobile" ? shouldTruncateMobile : shouldTruncateDesktop;
    const truncateLength = variant === "mobile" ? 100 : 150;
    
    const displayText = isExpanded || !shouldTruncate
        ? description
        : description.slice(0, truncateLength) + "...";

    const isCompact = variant === "mobile";

    return (
        <div className={isCompact ? "" : "max-w-md"}>
            <p className={`text-sm text-muted-foreground leading-relaxed ${isExpanded || isCompact ? "whitespace-normal break-words" : "whitespace-normal break-words line-clamp-2"}`}>
                {displayText}
            </p>
            {!isCompact && shouldTruncateDesktop && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs text-primary hover:text-primary/80 font-medium mt-1 flex items-center gap-1 transition-colors"
                >
                    {isExpanded ? (
                        <>
                            <ChevronUp className="h-3 w-3" />
                            Show less
                        </>
                    ) : (
                        <>
                            <ChevronDown className="h-3 w-3" />
                            Show more
                        </>
                    )}
                </button>
            )}
        </div>
    );
}

function TagEditMenuItem({ link, onUpdate }: { link: LinkItem; onUpdate: (id: string, updates: Partial<LinkItem>) => void }) {
    const [open, setOpen] = useState(false);
    const [tags, setTags] = useState(link.tags?.join(", ") || "");

    const handleSave = () => {
        const parsedTags = tags
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter((t) => t.length > 0);
        onUpdate(link.id, { tags: parsedTags });
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <DropdownMenuItem className="cursor-pointer" onSelect={(e) => e.preventDefault()}>
                    <Tag className="mr-2 h-4 w-4 text-violet-500" />
                    Edit Tags
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Edit Tags</DialogTitle>
                    <DialogDescription>
                        Add or remove tags for this link. Tags are comma separated.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Input
                        placeholder="work, tech, reading"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSave();
                        }}
                    />
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Column definitions ───────────────────────────────────────────────────────

export const columns: ColumnDef<LinkItem>[] = [
    {
        accessorKey: "title",
        header: () => <span className="text-center block w-full">Article</span>,
        size: 250,
        minSize: 150,
        cell: ({ row }) => {
            const link = row.original;
            return (
                <div className="flex items-start gap-2 py-1 min-w-0 justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={link.favicon_url}
                        alt=""
                        className="w-5 h-5 rounded-sm bg-muted object-cover shrink-0 mt-0.5"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>';
                            (e.target as HTMLImageElement).className = "w-5 h-5 opacity-50";
                        }}
                    />
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                        <a href={link.url} target="_blank" rel="noreferrer" className="font-semibold text-[15px] hover:underline hover:text-primary transition-colors whitespace-normal break-words">
                            {link.title}
                        </a>
                        {link.is_favorite && (
                            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 shrink-0 mt-0.5" />
                        )}
                    </div>
                </div>
            );
        },
    },
    {
        id: "description",
        accessorKey: "description",
        header: () => <span className="text-center block w-full">Description</span>,
        size: 300,
        minSize: 100,
        cell: ({ row }) => {
            const description = row.original.description;
            if (!description) return null;
            return <div className="text-center"><DescriptionCell description={description} /></div>;
        },
    },
    {
        accessorKey: "domain",
        header: (ctx) => <span className="text-center block w-full"><DomainFilterHeader {...ctx} /></span>,
        size: 100,
        minSize: 80,
        cell: ({ row }) => <span className="text-muted-foreground text-sm truncate block text-center w-full">{row.original.domain}</span>,
    },
    {
        accessorKey: "tags",
        header: (ctx) => <span className="text-center block w-full"><TagFilterHeader {...ctx} /></span>,
        size: 120,
        minSize: 80,
        cell: ({ row }) => {
            const tags = row.original.tags;
            if (!tags || tags.length === 0) return <span className="text-muted-foreground text-sm text-center block w-full">—</span>;
            return (
                <div className="text-center">
                    <div className="flex flex-wrap justify-center gap-1">
                        {tags.slice(0, 3).map((tag) => {
                            const color = getTagColor(tag);
                            return (
                                <span
                                    key={tag}
                                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${color.bg} ${color.text} border ${color.border}`}
                                >
                                    {tag}
                                </span>
                            );
                        })}
                        {tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">+{tags.length - 3}</span>
                        )}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: (ctx) => <span className="text-center block w-full"><StatusFilterHeader {...ctx} /></span>,
        size: 100,
        minSize: 80,
        cell: ({ row }) => {
            const status = row.original.status;
            const config = statusConfig[status] || statusConfig.unread;
            return (
                <div className="text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
                        {config.label}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "created_at",
        header: (ctx) => <span className="text-center block w-full"><SortableDateHeader {...ctx} /></span>,
        size: 120,
        minSize: 80,
        cell: ({ row }) => {
            const dateStr = row.original.created_at;
            const formatted = formatDistanceToNow(new Date(dateStr), { addSuffix: true });
            return <span className="text-muted-foreground text-sm text-center block w-full">{formatted}</span>;
        },
    },
    {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        size: 48,
        minSize: 48,
        cell: ({ row, table }) => {
            const link = row.original;
            const meta = table.options.meta as DataTableMeta;

            return (
                <div className="flex items-center justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px] bg-popover">
                            {meta.isTrashView ? (
                                <>
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => meta.onRestoreLink?.(link.id)}
                                    >
                                        <Undo2 className="mr-2 h-4 w-4" />
                                        Restore
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                                        onClick={() => meta.onDeleteForever?.(link.id)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Forever
                                    </DropdownMenuItem>
                                </>
                            ) : (
                                <>
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

                                    <DropdownMenuSeparator />

                                    <TagEditMenuItem link={link} onUpdate={meta.onLinkUpdate} />

                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem
                                        className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                                        onClick={() => meta.onDeleteLink?.(link.id)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Move to Trash
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];

export const selectionColumn: ColumnDef<LinkItem> = {
    id: "select",
    size: COLUMN_CONFIG.select.value,
    minSize: 40,
    header: ({ table }) => (
        <div className="text-center">
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        </div>
    ),
    cell: ({ row }) => (
        <div className="text-center">
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        </div>
    ),
    enableSorting: false,
    enableHiding: false,
};
