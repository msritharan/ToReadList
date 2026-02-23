"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { Archive, Check, Inbox, MoreHorizontal, Plus, Search, Star, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type LinkItem = {
  id: string;
  url: string;
  title: string;
  domain: string;
  favicon_url: string;
  status: "unread" | "read" | "archived";
  is_favorite: boolean;
  created_at: string;
};

// Mock data
const mockData: LinkItem[] = [
  {
    id: "1",
    url: "https://wired.com/future-of-ai",
    title: "The Future of AI in Productivity Apps",
    domain: "wired.com",
    favicon_url: "https://www.google.com/s2/favicons?domain=wired.com&sz=64",
    status: "unread",
    is_favorite: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "2",
    url: "https://nytimes.com/deep-work",
    title: "How to Master Deep Work in a Distracted World",
    domain: "nytimes.com",
    favicon_url: "https://www.google.com/s2/favicons?domain=nytimes.com&sz=64",
    status: "unread",
    is_favorite: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "3",
    url: "https://techcrunch.com/startup-advice",
    title: "10 Lessons from Y Combinator Founders",
    domain: "techcrunch.com",
    favicon_url: "https://www.google.com/s2/favicons?domain=techcrunch.com&sz=64",
    status: "unread",
    is_favorite: false,
    created_at: new Date().toISOString(),
  },
];

export default function Dashboard() {
  const [data, setData] = useState<LinkItem[]>(mockData);

  const columns: ColumnDef<LinkItem>[] = [
    {
      accessorKey: "title",
      header: "Article",
      cell: ({ row }) => {
        const link = row.original;
        return (
          <div className="flex items-center gap-4 py-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={link.favicon_url}
              alt=""
              className="w-5 h-5 rounded-sm bg-muted object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>';
                (e.target as HTMLImageElement).className = "w-5 h-5 opacity-50";
              }}
            />
            <div className="flex flex-col">
              <a href={link.url} target="_blank" rel="noreferrer" className="font-semibold text-[15px] hover:underline hover:text-primary transition-colors line-clamp-1">
                {link.title}
              </a>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "domain",
      header: "Source",
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.domain}</span>,
    },
    {
      accessorKey: "created_at",
      header: "Date Saved",
      cell: ({ row }) => {
        const dateStr = row.original.created_at;
        const formatted = formatDistanceToNow(new Date(dateStr), { addSuffix: true });
        return <span className="text-muted-foreground text-sm">{formatted}</span>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const isFav = row.original.is_favorite;
        return (
          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-green-500 hover:bg-green-500/10" title="Mark as Read">
              <Check className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10" title={isFav ? "Unfavorite" : "Favorite"}>
              <Star className="h-4 w-4" fill={isFav ? "currentColor" : "none"} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10" title="Archive">
              <Archive className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top Header */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-border/40 shrink-0">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            className="pl-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50 text-foreground"
          />
        </div>
        <div className="flex items-center gap-4">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all gap-2">
            <Plus className="h-4 w-4" />
            Add Link
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
            <div className="text-sm text-muted-foreground border border-border/40 bg-muted/20 px-3 py-1 rounded-full">
              {data.length} unread articles
            </div>
          </div>

          {/* Table Container */}
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
                        <Inbox className="h-8 w-8 text-muted-foreground/50" />
                        <p>No links found. Add your first link.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
}
