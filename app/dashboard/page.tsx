"use client";

import { BookOpen, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/links-table/data-table";
import { columns } from "@/components/links-table/columns";
import { AddLinkDialog } from "@/components/add-link-dialog";
import { useLinksQuery } from "@/hooks/use-links";

export default function Dashboard() {
  const {
    links,
    total,
    totalPages,
    isLoading,
    queryState,
    setPage,
    setLimit,
    setStatus,
    setIsFavorite,
    setSearch,
    addLink,
    updateLink,
    deleteLink,
  } = useLinksQuery();

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top Header */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-border/40 shrink-0">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={queryState.search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50 text-foreground"
          />
        </div>
        <div className="flex items-center gap-4">
          <AddLinkDialog
            onAddLink={addLink}
            trigger={
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all gap-2">
                <Plus className="h-4 w-4" />
                Add Link
              </Button>
            }
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          <h1 className="text-2xl font-semibold tracking-tight">Collection</h1>

          <DataTable
            columns={columns}
            data={links}
            meta={{ onLinkUpdate: updateLink, onLinkDelete: deleteLink }}
            activeStatus={queryState.status}
            showFavoritesOnly={queryState.isFavorite}
            isLoading={isLoading}
            page={queryState.page}
            totalPages={totalPages}
            total={total}
            limit={queryState.limit}
            onStatusChange={setStatus}
            onFavoriteToggle={setIsFavorite}
            onPageChange={setPage}
            onLimitChange={setLimit}
            emptyStateMessage="No links found. Try a different filter or add your first link!"
            emptyStateIcon={<BookOpen className="h-8 w-8 text-muted-foreground/50" />}
          />
        </div>
      </main>
    </div>
  );
}
