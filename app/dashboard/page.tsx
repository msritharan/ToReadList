"use client";

import { BookOpen, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/links-table/data-table";
import { columns } from "@/components/links-table/columns";
import { AddLinkDialog } from "@/components/add-link-dialog";
import { useLinksQuery } from "@/hooks/use-links";
import { H1 } from "@/components/ui/typography";
import { OnboardingDialog } from "@/components/onboarding-dialog";

const emptyMessages: Record<string, { message: string; icon: React.ReactNode }> = {
  all: {
    message: "Your reading list is empty. Start building your knowledge empire!",
    icon: <BookOpen className="h-8 w-8 text-muted-foreground/50" />,
  },
  unread: {
    message: "All caught up! No unread articles waiting for you.",
    icon: <BookOpen className="h-8 w-8 text-muted-foreground/50" />,
  },
  skipped: {
    message: "Nothing in the skip zone. Every link gets a fair shot!",
    icon: <BookOpen className="h-8 w-8 text-muted-foreground/50" />,
  },
  read: {
    message: "No read articles yet. Time to start reading!",
    icon: <BookOpen className="h-8 w-8 text-muted-foreground/50" />,
  },
};

export default function Dashboard() {
  const {
    links,
    allLinks,
    total,
    totalPages,
    isLoading,
    queryState,
    setPage,
    setLimit,
    setStatus,
    setIsFavorite,
    setSearch,
    toggleSortOrder,
    setDomainFilter,
    setTagFilter,
    addLink,
    updateLink,
    bulkUpdateLinks,
    deleteLink,
    bulkDeleteLinks,
    availableTags,
  } = useLinksQuery();

  return (
    <div className="flex flex-col h-full bg-background">
      <OnboardingDialog />
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
            availableTags={availableTags}
            trigger={
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all gap-2">
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
          <H1 className="text-2xl font-semibold tracking-tight">Collection</H1>

          <DataTable
            columns={columns}
            data={links}
            allLinks={allLinks}
            meta={{ onLinkUpdate: updateLink, onBulkUpdate: bulkUpdateLinks, onDeleteLink: deleteLink, onBulkDeleteLink: bulkDeleteLinks }}
            activeStatus={queryState.status}
            showFavoritesOnly={queryState.isFavorite}
            sortOrder={queryState.sortOrder}
            domainFilter={queryState.domainFilter}
            tagFilter={queryState.tagFilter}
            isLoading={isLoading}
            page={queryState.page}
            totalPages={totalPages}
            total={total}
            limit={queryState.limit}
            onStatusChange={setStatus}
            onFavoriteToggle={setIsFavorite}
            onPageChange={setPage}
            onLimitChange={setLimit}
            onToggleSortOrder={toggleSortOrder}
            onDomainFilterChange={setDomainFilter}
            onTagFilterChange={setTagFilter}
            emptyStateMessage={emptyMessages[queryState.status]?.message || emptyMessages.all.message}
            emptyStateIcon={emptyMessages[queryState.status]?.icon || emptyMessages.all.icon}
          />
        </div>
      </main>
    </div>
  );
}
