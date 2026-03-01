"use client";

import { useState, useMemo } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Inbox, Star } from "lucide-react";

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

type StatusFilter = "all" | "unread" | "read" | "skipped";

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
    searchQuery?: string;
    emptyStateMessage?: string;
    emptyStateIcon?: React.ReactNode;
}

export function DataTable<TValue>({
    columns,
    data,
    meta,
    searchQuery = "",
    emptyStateMessage = "No links found.",
    emptyStateIcon = <Inbox className="h-8 w-8 text-muted-foreground/50" />,
}: DataTableProps<TValue>) {
    const [activeStatus, setActiveStatus] = useState<StatusFilter>("all");
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    const filteredData = useMemo(() => {
        let result = data;

        if (activeStatus !== "all") {
            result = result.filter((link) => link.status === activeStatus);
        }

        if (showFavoritesOnly) {
            result = result.filter((link) => link.is_favorite);
        }

        return result;
    }, [data, activeStatus, showFavoritesOnly]);

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            globalFilter: searchQuery,
        },
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
                            onClick={() => setActiveStatus(filter.value)}
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
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
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
                        {filteredData.length} {filteredData.length === 1 ? "link" : "links"}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border/40 bg-card overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-border/40 hover:bg-transparent">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="text-xs uppercase tracking-wider text-muted-foreground font-medium h-10 px-6">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
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
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        {emptyStateIcon}
                                        <p>{emptyStateMessage}</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
