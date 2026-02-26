"use client";

import { useState } from "react";
import { Archive, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/links-table/data-table";
import { columns } from "@/components/links-table/columns";
import { AddLinkDialog } from "@/components/add-link-dialog";
import { useLinks } from "@/hooks/use-links";

export default function ArchivePage() {
    const { links, addLink, updateLink, deleteLink, isLoaded } = useLinks();
    const [searchQuery, setSearchQuery] = useState("");

    if (!isLoaded) return <div className="p-8">Loading...</div>;

    const archivedLinks = links.filter((link) => link.status === "archived");

    return (
        <div className="flex flex-col h-full bg-background">
            <header className="flex items-center justify-between px-8 py-6 border-b border-border/40 shrink-0">
                <div className="flex-1 max-w-md relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search articles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
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

            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-semibold tracking-tight">Archive</h1>
                        <div className="text-sm text-muted-foreground border border-border/40 bg-muted/20 px-3 py-1 rounded-full">
                            {archivedLinks.length} items
                        </div>
                    </div>

                    <DataTable
                        columns={columns}
                        data={archivedLinks}
                        meta={{ onLinkUpdate: updateLink, onLinkDelete: deleteLink }}
                        searchQuery={searchQuery}
                        emptyStateMessage="Your archive is empty."
                        emptyStateIcon={<Archive className="h-8 w-8 text-muted-foreground/50" />}
                    />
                </div>
            </main>
        </div>
    );
}
