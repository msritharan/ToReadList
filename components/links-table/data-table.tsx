"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Inbox, Loader2, Star, Check, SkipForward, BookOpen, MoreHorizontal } from "lucide-react";

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
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { DataTableMeta, selectionColumn } from "./columns";
import { LinkItem } from "@/types";
import {
    LinkStatus,
    PAGE_SIZE_OPTIONS,
    PageSizeOption,
} from "@/hooks/use-links";

type StatusFilter = LinkStatus;

const statusFilters: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "unread", label: "Unread" },
    { value: "read", label: "Read" },
    { value: "skipped", label: "Skipped" },
];

interface DataTableProps<TValue> {
    columns: ColumnDef<LinkItem, TValue>[];
    data: LinkItem[];
    meta: DataTableMeta;
    // Server-driven filter state (read-only for display)
    activeStatus: StatusFilter;
    showFavoritesOnly: boolean;
    isLoading: boolean;
    // Pagination
    page: number;
    totalPages: number;
    total: number;
    limit: PageSizeOption;
    // Callbacks
    onStatusChange: (status: StatusFilter) => void;
    onFavoriteToggle: (val: boolean) => void;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: PageSizeOption) => void;
    // Empty state
    emptyStateMessage?: string;
    emptyStateIcon?: React.ReactNode;
}

export function DataTable<TValue>({
    columns,
    data,
    meta,
    activeStatus,
    showFavoritesOnly,
    isLoading,
    page,
    totalPages,
    total,
    limit,
    onStatusChange,
    onFavoriteToggle,
    onPageChange,
    onLimitChange,
    emptyStateMessage = "No links found.",
    emptyStateIcon = <Inbox className="h-8 w-8 text-muted-foreground/50" />,
}: DataTableProps<TValue>) {
    const [rowSelection, setRowSelection] = useState({});

    const table = useReactTable({
        data,
        columns: [selectionColumn, ...columns],
        state: { rowSelection },
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => row.id,
        meta: meta as any,
    });

    const selectedRows = Object.keys(rowSelection);
    const selectedCount = selectedRows.length;

    const handleBulkUpdate = (updates: Partial<LinkItem>) => {
        meta.onBulkUpdate(selectedRows, updates);
        setRowSelection({});
    };

    return (
        <div className="space-y-4">
            {/* Bulk Action Bar */}
            {selectedCount > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <span className="text-sm font-medium text-primary">
                        {selectedCount} {selectedCount === 1 ? "item" : "items"} selected
                    </span>
                    <div className="flex items-center gap-2 ml-auto">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBulkUpdate({ status: "read" })}
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                        >
                            <Check className="h-4 w-4 mr-1.5" />
                            Mark as Read
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBulkUpdate({ status: "unread" })}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-500/10"
                        >
                            <BookOpen className="h-4 w-4 mr-1.5" />
                            Mark as Unread
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBulkUpdate({ status: "skipped" })}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-500/10"
                        >
                            <SkipForward className="h-4 w-4 mr-1.5" />
                            Skip
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4 mr-1.5" />
                                    More
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
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            )}

            {/* Filter Toolbar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 p-1 rounded-lg bg-muted/30 border border-border/40">
                    {statusFilters.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => onStatusChange(filter.value)}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                                activeStatus === filter.value
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onFavoriteToggle(!showFavoritesOnly)}
                        className={cn(
                            "gap-2 transition-all",
                            showFavoritesOnly
                                ? "text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20 hover:text-yellow-500"
                                : "text-muted-foreground hover:text-yellow-500"
                        )}
                    >
                        <Star className="h-4 w-4" fill={showFavoritesOnly ? "currentColor" : "none"} />
                        Favorites
                    </Button>
                    <div className="text-sm text-muted-foreground border border-border/40 bg-muted/20 px-3 py-1 rounded-full">
                        {total} {total === 1 ? "link" : "links"}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border/40 bg-card overflow-hidden shadow-sm relative">
                {/* Loading overlay */}
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded-xl">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                )}
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-border/40 hover:bg-transparent">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="text-xs uppercase tracking-wider text-muted-foreground font-medium h-10 px-6">
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
                                        <TableCell key={cell.id} className="py-2 px-6">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
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

            {/* Pagination Footer */}
            <div className="flex items-center justify-between">
                {/* Page size selector */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rows per page</span>
                    <div className="flex items-center gap-1 p-0.5 rounded-md bg-muted/30 border border-border/40">
                        {PAGE_SIZE_OPTIONS.map((size) => (
                            <button
                                key={size}
                                onClick={() => onLimitChange(size)}
                                className={cn(
                                    "px-2.5 py-1 rounded text-sm font-medium transition-all duration-150",
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
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPageChange(page - 1)}
                        disabled={page <= 1 || isLoading}
                        className="gap-1.5 text-muted-foreground hover:text-foreground"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>

                    <span className="text-sm text-muted-foreground tabular-nums">
                        Page <span className="font-medium text-foreground">{page}</span> of{" "}
                        <span className="font-medium text-foreground">{totalPages}</span>
                    </span>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= totalPages || isLoading}
                        className="gap-1.5 text-muted-foreground hover:text-foreground"
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
