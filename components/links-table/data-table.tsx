"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Inbox } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DataTableMeta } from "./columns";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    meta: DataTableMeta;
    emptyStateMessage?: string;
    emptyStateIcon?: React.ReactNode;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    meta,
    emptyStateMessage = "No links found.",
    emptyStateIcon = <Inbox className="h-8 w-8 text-muted-foreground/50" />,
}: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        meta: meta as any,
    });

    return (
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
    );
}
