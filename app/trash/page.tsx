"use client";

import Link from "next/link";
import { ArrowLeft, Trash2, AlertTriangle, PackageOpen, Loader2 } from "lucide-react";
import { useTrash } from "@/hooks/use-trash";
import { DataTable } from "@/components/links-table/data-table";
import { columns } from "@/components/links-table/columns";
import { useState } from "react";
import { SortOrder, PAGE_SIZE_OPTIONS, PageSizeOption } from "@/hooks/use-links";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const TRASH_TTL_DAYS = 7;

export default function TrashPage() {
    const {
        trashItems,
        isLoading,
        restoreItem,
        bulkRestore,
        deleteForever,
        bulkDeleteForever,
        emptyTrash,
    } = useTrash();

    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [domainFilter, setDomainFilter] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState<PageSizeOption>(PAGE_SIZE_OPTIONS[2]);
    const [isEmptying, setIsEmptying] = useState(false);

    // Apply front-end filtering and sorting to the trashItems
    let filteredItems = [...trashItems];

    if (domainFilter) {
        filteredItems = filteredItems.filter((i) => i.domain === domainFilter);
    }

    filteredItems.sort((a, b) => {
        const dA = new Date(a.created_at).getTime();
        const dB = new Date(b.created_at).getTime();
        return sortOrder === "desc" ? dB - dA : dA - dB;
    });

    const total = filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const paginatedItems = filteredItems.slice((page - 1) * limit, page * limit);

    const handleEmptyTrash = async () => {
        setIsEmptying(true);
        await emptyTrash();
        setIsEmptying(false);
    };

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <header className="flex items-center justify-between px-8 py-6 border-b border-border/40 shrink-0">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Collection
                    </Link>
                </div>
                {trashItems.length > 0 && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="destructive"
                                size="sm"
                                disabled={isEmptying || isLoading}
                                className="gap-2"
                            >
                                {isEmptying ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                                Empty Trash
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Empty Trash?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete all{" "}
                                    <span className="font-semibold text-foreground">
                                        {trashItems.length} {trashItems.length === 1 ? "item" : "items"}
                                    </span>{" "}
                                    in your trash. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleEmptyTrash}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Yes, empty trash
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </header>

            {/* Main */}
            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                                <Trash2 className="h-6 w-6 text-muted-foreground" />
                                Trash
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                                <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />
                                Items are permanently deleted after {TRASH_TTL_DAYS} days.
                            </p>
                        </div>
                    </div>

                    <DataTable
                        columns={columns}
                        data={paginatedItems}
                        meta={{
                            // Required but unused here
                            onLinkUpdate: () => { },
                            onBulkUpdate: () => { },
                            onDeleteLink: () => { },
                            // Trash actions
                            isTrashView: true,
                            onRestoreLink: restoreItem,
                            onDeleteForever: deleteForever,
                            onBulkRestore: bulkRestore,
                            onBulkDeleteForever: bulkDeleteForever,
                        }}
                        // Filters & Layout
                        activeStatus="all"
                        showFavoritesOnly={false}
                        sortOrder={sortOrder}
                        domainFilter={domainFilter}
                        isLoading={isLoading && trashItems.length === 0}
                        // Pagination
                        page={page}
                        totalPages={totalPages}
                        total={total}
                        limit={limit}
                        // Callbacks
                        onStatusChange={() => { }}
                        onFavoriteToggle={() => { }}
                        onPageChange={setPage}
                        onLimitChange={(l) => {
                            setLimit(l);
                            setPage(1);
                        }}
                        onToggleSortOrder={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                        onDomainFilterChange={(domain) => {
                            setDomainFilter(domain);
                            setPage(1);
                        }}
                        emptyStateMessage="Your trash is empty."
                        emptyStateIcon={<PackageOpen className="h-10 w-10 text-muted-foreground/40" />}
                    />
                </div>
            </main>
        </div>
    );
}
