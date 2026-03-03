"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useState, useMemo, Fragment, useEffect, useCallback, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import {
    ChevronLeft,
    ChevronRight,
    Inbox,
    Loader2,
    Star,
    Check,
    SkipForward,
    BookOpen,
    MoreHorizontal,
    X,
    Undo2,
    Trash2,
    SlidersHorizontal,
    ArrowUpFromLine,
    ArrowDownToLine,
    RotateCcw,
} from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { DataTableMeta, selectionColumn } from "./columns";
import { LinkItem } from "@/types";
import {
    LinkStatus,
    PAGE_SIZE_OPTIONS,
    PageSizeOption,
    SortOrder,
} from "@/hooks/use-links";

interface DataTableProps<TValue> {
    columns: ColumnDef<LinkItem, TValue>[];
    data: LinkItem[];
    allLinks?: LinkItem[];
    meta: {
        onLinkUpdate: (id: string, updates: Partial<LinkItem>) => void;
        onBulkUpdate: (ids: string[], updates: Partial<LinkItem>) => void;
        onDeleteLink?: (id: string) => void;
        onBulkDeleteLink?: (ids: string[]) => void;
        isTrashView?: boolean;
        onRestoreLink?: (id: string) => void;
        onDeleteForever?: (id: string) => void;
        onBulkRestore?: (ids: string[]) => void;
        onBulkDeleteForever?: (ids: string[]) => void;
    };
    activeStatus: LinkStatus;
    showFavoritesOnly: boolean;
    sortOrder: SortOrder;
    domainFilter: string;
    tagFilter: string;
    isLoading: boolean;
    page: number;
    totalPages: number;
    total: number;
    limit: PageSizeOption;
    onStatusChange: (status: LinkStatus) => void;
    onFavoriteToggle: (val: boolean) => void;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: PageSizeOption) => void;
    onToggleSortOrder: () => void;
    onDomainFilterChange: (domain: string) => void;
    onTagFilterChange: (tag: string) => void;
    emptyStateMessage?: string;
    emptyStateIcon?: React.ReactNode;
}

export function DataTable<TValue>({
    columns,
    data,
    allLinks,
    meta,
    activeStatus,
    showFavoritesOnly,
    sortOrder,
    domainFilter,
    tagFilter,
    isLoading,
    page,
    totalPages,
    total,
    limit,
    onStatusChange,
    onFavoriteToggle,
    onPageChange,
    onLimitChange,
    onToggleSortOrder,
    onDomainFilterChange,
    onTagFilterChange,
    emptyStateMessage = "No links found.",
    emptyStateIcon = <Inbox className="h-8 w-8 text-muted-foreground/50" />,
}: DataTableProps<TValue>) {
    const [rowSelection, setRowSelection] = useState({});
    const tableContainerRef = useRef<HTMLDivElement>(null);

    // Collect unique domains from ALL links for the filter dropdown
    const availableDomains = useMemo(() => {
        const domains = new Set<string>();
        (allLinks || data).forEach((d) => {
            if (d.domain && d.deleted_at === null) domains.add(d.domain);
        });
        return Array.from(domains).sort();
    }, [allLinks, data]);

    // Collect unique tags from ALL links for the filter dropdown
    const availableTags = useMemo(() => {
        const tags = new Set<string>();
        (allLinks || data).forEach((d) => {
            if (d.tags && d.deleted_at === null) {
                d.tags.forEach((tag) => tags.add(tag));
            }
        });
        return Array.from(tags).sort();
    }, [allLinks, data]);

    const tableMeta: DataTableMeta = {
        ...meta,
        sortOrder,
        onToggleSortOrder,
        domainFilter,
        onDomainFilterChange,
        availableDomains,
        tagFilter,
        onTagFilterChange,
        availableTags,
        statusFilter: activeStatus,
        onStatusFilterChange: onStatusChange,
        onColumnResize: () => { },
        onResetColumnSizes: () => { },
    };

    const table = useReactTable({
        data,
        columns: [selectionColumn, ...columns],
        state: {
            rowSelection,
        },
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => row.id,
        meta: tableMeta as unknown as Record<string, unknown>,
    });

    const selectedRows = Object.keys(rowSelection);
    const selectedCount = selectedRows.length;

    const handleBulkUpdate = (updates: Partial<LinkItem>) => {
        meta.onBulkUpdate(selectedRows, updates);
        setRowSelection({});
    };

    const isTrash = meta.isTrashView;

    return (
        <div className="space-y-4">
            {/* Bulk Action Bar */}
            {selectedCount > 0 && (
                <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 whitespace-nowrap self-start sm:self-auto">
                        {selectedCount} {selectedCount === 1 ? "item" : "items"} selected
                    </span>
                    <div className="flex items-center gap-1 sm:gap-2 sm:ml-auto overflow-x-auto w-full sm:w-auto scrollbar-hide pb-1 sm:pb-0">
                        {isTrash ? (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        meta.onBulkRestore?.(selectedRows);
                                        setRowSelection({});
                                    }}
                                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 px-2 sm:px-3"
                                    title="Restore Selected"
                                >
                                    <Undo2 className="h-4 w-4 sm:mr-1.5" />
                                    <span className="hidden sm:inline">Restore Selected</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        meta.onBulkDeleteForever?.(selectedRows);
                                        setRowSelection({});
                                    }}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 px-2 sm:px-3"
                                    title="Delete Forever"
                                >
                                    <Trash2 className="h-4 w-4 sm:mr-1.5" />
                                    <span className="hidden sm:inline">Delete Forever</span>
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleBulkUpdate({ status: "read" })}
                                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 px-2 sm:px-3"
                                    title="Mark as Read"
                                >
                                    <Check className="h-4 w-4 sm:mr-1.5" />
                                    <span className="hidden sm:inline">Mark as Read</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleBulkUpdate({ status: "unread" })}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-500/10 px-2 sm:px-3"
                                    title="Mark as Unread"
                                >
                                    <BookOpen className="h-4 w-4 sm:mr-1.5" />
                                    <span className="hidden sm:inline">Mark as Unread</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleBulkUpdate({ status: "skipped" })}
                                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-500/10 px-2 sm:px-3"
                                    title="Skip"
                                >
                                    <SkipForward className="h-4 w-4 sm:mr-1.5" />
                                    <span className="hidden sm:inline">Skip</span>
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="px-2 sm:px-3" title="More">
                                            <MoreHorizontal className="h-4 w-4 sm:mr-1.5" />
                                            <span className="hidden sm:inline">More</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[180px] bg-popover">
                                        <DropdownMenuItem
                                            className="cursor-pointer"
                                            onClick={() => handleBulkUpdate({ is_favorite: true })}
                                        >
                                            <Star className="mr-2 h-4 w-4 text-yellow-500" />
                                            Add to Favorites
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="cursor-pointer"
                                            onClick={() => handleBulkUpdate({ is_favorite: false })}
                                        >
                                            <Star className="mr-2 h-4 w-4 text-muted-foreground" />
                                            Remove from Favorites
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                                            onClick={() => {
                                                meta.onBulkDeleteLink?.(selectedRows);
                                                setRowSelection({});
                                            }}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Move to Trash
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-between">
                {/* Left: active filter chips */}
                <div className="flex items-center gap-2 flex-wrap">
                    {activeStatus !== "all" && (
                        <button
                            onClick={() => onStatusChange("all")}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                        >
                            Status: {activeStatus}
                            <X className="h-3 w-3" />
                        </button>
                    )}
                    {domainFilter && (
                        <button
                            onClick={() => onDomainFilterChange("")}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                        >
                            Source: {domainFilter}
                            <X className="h-3 w-3" />
                        </button>
                    )}
                    {tagFilter && (
                        <button
                            onClick={() => onTagFilterChange("")}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-violet-500/10 text-violet-500 border border-violet-500/20 hover:bg-violet-500/20 transition-colors"
                        >
                            Tag: {tagFilter}
                            <X className="h-3 w-3" />
                        </button>
                    )}
                    {(!isTrash && showFavoritesOnly) && (
                        <button
                            onClick={() => onFavoriteToggle(false)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors"
                        >
                            <Star className="h-3 w-3 fill-current" />
                            Favorites only
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Mobile Sort & Filter */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="md:hidden gap-2 bg-background shadow-sm h-8"
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                <span className="sr-only">Sort & Filter</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[400px] max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Sort & Filter</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                                {/* Sort Section */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium leading-none">Sort By</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            variant={sortOrder === "desc" ? "default" : "outline"}
                                            className="w-full justify-start gap-2"
                                            onClick={() => {
                                                if (sortOrder !== "desc") onToggleSortOrder();
                                            }}
                                        >
                                            <ArrowDownToLine className="h-4 w-4" />
                                            Newest First
                                        </Button>
                                        <Button
                                            variant={sortOrder === "asc" ? "default" : "outline"}
                                            className="w-full justify-start gap-2"
                                            onClick={() => {
                                                if (sortOrder !== "asc") onToggleSortOrder();
                                            }}
                                        >
                                            <ArrowUpFromLine className="h-4 w-4" />
                                            Oldest First
                                        </Button>
                                    </div>
                                </div>

                                {/* Status Filter */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium leading-none">Filter by Status</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {(["all", "unread", "read", "skipped"] as const).map((status) => (
                                            <Button
                                                key={status}
                                                variant={activeStatus === status ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => onStatusChange(status)}
                                                className="capitalize"
                                            >
                                                {status}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Domain Filter */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium leading-none">Filter by Source</h4>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={domainFilter}
                                        onChange={(e) => onDomainFilterChange(e.target.value)}
                                    >
                                        <option value="">All Sources</option>
                                        {availableDomains.map((domain) => (
                                            <option key={domain} value={domain}>
                                                {domain}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Tag Filter */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium leading-none">Filter by Tag</h4>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={tagFilter}
                                        onChange={(e) => onTagFilterChange(e.target.value)}
                                    >
                                        <option value="">All Tags</option>
                                        {availableTags.map((tag) => (
                                            <option key={tag} value={tag}>
                                                {tag}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {!isTrash && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onFavoriteToggle(!showFavoritesOnly)}
                            className={cn(
                                "gap-2 transition-all h-8",
                                showFavoritesOnly
                                    ? "text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20 hover:text-yellow-500"
                                    : "text-muted-foreground hover:text-yellow-500"
                            )}
                        >
                            <Star className="h-4 w-4" fill={showFavoritesOnly ? "currentColor" : "none"} />
                            <span className="hidden sm:inline">Favorites</span>
                        </Button>
                    )}
                    <div className="text-sm text-muted-foreground border border-border/40 bg-muted/20 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                        {total} {total === 1 ? "link" : "links"}
                    </div>
                </div>
            </div>

            {/* Data View */}
            <div className="relative">
                {/* Loading overlay */}
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded-xl">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                )}

                {/* Mobile Card Grid View */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <div
                                key={row.id}
                                className={cn(
                                    "flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm transition-all relative overflow-hidden",
                                    row.getIsSelected() ? "border-indigo-500/50 bg-indigo-500/5" : "border-border/40"
                                )}
                            >
                                {/* Top row: selection, title, actions */}
                                <div className="flex items-start gap-3">
                                    <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                                        {row.getVisibleCells().map(cell =>
                                            cell.column.id === 'select' ? (
                                                <Fragment key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </Fragment>
                                            ) : null
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 font-medium break-words">
                                        {row.getVisibleCells().map(cell =>
                                            cell.column.id === 'title' ? (
                                                <Fragment key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </Fragment>
                                            ) : null
                                        )}
                                    </div>
                                    <div className="-mt-1 -mr-2" onClick={(e) => e.stopPropagation()}>
                                        {row.getVisibleCells().map(cell =>
                                            cell.column.id === 'actions' ? (
                                                <Fragment key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </Fragment>
                                            ) : null
                                        )}
                                    </div>
                                </div>
                                {/* Description row - compact single line */}
                                <div className="pl-7">
                                    {(() => {
                                        const link = row.original;
                                        if (!link.description) return null;
                                        const displayText = link.description.length > 100
                                            ? link.description.slice(0, 100) + "..."
                                            : link.description;
                                        return (
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                {displayText}
                                            </p>
                                        );
                                    })()}
                                </div>
                                {/* Bottom row: domain · date · status - all inline */}
                                <div className="flex items-center gap-2 pl-7 text-xs text-muted-foreground flex-wrap">
                                    <span className="truncate">{row.original.domain}</span>
                                    <span>·</span>
                                    <span className="whitespace-nowrap tabular-nums">
                                        {formatDistanceToNow(new Date(row.original.created_at), { addSuffix: true })}
                                    </span>
                                    <span>·</span>
                                    <span>
                                        {row.getVisibleCells().map(cell =>
                                            cell.column.id === 'status' ? (
                                                <Fragment key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </Fragment>
                                            ) : null
                                        )}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border rounded-xl border-dashed">
                            {isLoading ? null : (
                                <>
                                    {emptyStateIcon}
                                    <p className="mt-2">{emptyStateMessage}</p>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Desktop Table View */}
                <div ref={tableContainerRef} className="hidden md:block rounded-xl border border-border/40 bg-card overflow-hidden shadow-sm">
                    <div className="w-full min-w-0">
                        <Table style={{ width: "100%", tableLayout: "fixed" }}>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id} className="border-border/40 hover:bg-transparent">
                                        {headerGroup.headers.map((header) => (
                                            <TableHead
                                                key={header.id}
                                                className="text-xs uppercase tracking-wider text-muted-foreground font-medium h-10 px-4 relative overflow-hidden align-middle"
                                                style={{ width: header.getSize(), minWidth: header.getSize() }}
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && "selected"}
                                            className="group border-border/40 cursor-default hover:bg-muted/30 transition-colors h-14"
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell
                                                    key={cell.id}
                                                    className="py-2 px-4 min-w-0 overflow-hidden align-middle"
                                                    style={{ width: cell.column.getSize() }}
                                                >
                                                    <div className="min-w-0 overflow-hidden">
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </div>
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                                            {isLoading ? null : (
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    {emptyStateIcon}
                                                    <p>{emptyStateMessage}</p>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
                {/* Page size selector */}
                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                    <span className="text-sm text-muted-foreground whitespace-nowrap hidden min-[370px]:inline-block">Rows per page</span>
                    <span className="text-sm text-muted-foreground whitespace-nowrap min-[370px]:hidden">Rows:</span>
                    <div className="flex items-center gap-1 p-0.5 rounded-md bg-muted/30 border border-border/40 whitespace-nowrap">
                        {PAGE_SIZE_OPTIONS.map((size) => (
                            <button
                                key={size}
                                onClick={() => onLimitChange(size)}
                                className={cn(
                                    "px-2 sm:px-2.5 py-1 rounded text-sm font-medium transition-all duration-150",
                                    limit === size
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Prev / Page X of N / Next */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-2 sm:gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPageChange(page - 1)}
                        disabled={page <= 1 || isLoading}
                        className="gap-1 text-muted-foreground hover:text-foreground px-2 sm:px-3"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Previous</span>
                        <span className="sm:hidden">Prev</span>
                    </Button>

                    <span className="text-xs sm:text-sm text-muted-foreground tabular-nums text-center whitespace-nowrap">
                        Page <span className="font-medium text-foreground">{page}</span> of{" "}
                        <span className="font-medium text-foreground">{totalPages}</span>
                    </span>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= totalPages || isLoading}
                        className="gap-1 text-muted-foreground hover:text-foreground px-2 sm:px-3"
                    >
                        <span className="hidden sm:inline">Next</span>
                        <span className="sm:hidden">Next</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
