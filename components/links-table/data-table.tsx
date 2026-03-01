"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Inbox, Loader2, Star } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DataTableMeta } from "./columns";
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
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        meta: meta as any,
    });

    return (
        <div className="space-y-4">
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
