"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Globe, Loader2, Link as LinkIcon, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LinkItem } from "@/types";

async function addLink(link: Omit<LinkItem, "id" | "created_at">) {
  const res = await fetch("/api/links", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(link),
  });
  if (!res.ok) throw new Error("Failed to add link");
  return res.json();
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "";
  }
}

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

interface AddLinkClientProps {
  url: string;
  title: string;
  description: string;
}

export function AddLinkClient({ url: initialUrl, title: initialTitle, description: initialDescription }: AddLinkClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [url, setUrl] = useState(initialUrl);
  const [title, setTitle] = useState(initialTitle);
  const [isExtracting, setIsExtracting] = useState(false);

  const domain = extractDomain(url);
  const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : "";
  const urlValid = isValidUrl(url);

  // Show brief extracting state when URL is pre-filled
  useEffect(() => {
    if (initialUrl && urlValid && !title) {
      setIsExtracting(true);
      const t = setTimeout(() => setIsExtracting(false), 600);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mutation = useMutation({
    mutationFn: addLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      router.push("/dashboard");
    },
  });

  const handleSubmit = () => {
    if (!url || !urlValid) return;
    mutation.mutate({
      url,
      title: title || domain || url,
      description: initialDescription || undefined,
      domain,
      favicon_url: faviconUrl,
      status: "unread",
      is_favorite: false,
      tags: [],
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/20">
          <BookOpen className="h-5 w-5 text-primary" strokeWidth={1.5} />
        </div>
        <span className="text-base font-semibold text-foreground">ToReadList</span>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-card border border-border/40 rounded-xl p-6 shadow-xl shadow-black/20 space-y-5">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Save a link</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Edit the details below and save to your reading list.
          </p>
        </div>

        {/* URL */}
        <div className="space-y-1.5">
          <label htmlFor="url" className="text-sm font-medium text-foreground">
            URL
          </label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="url"
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-9 bg-muted/50 border-border/40 focus-visible:ring-1 focus-visible:ring-primary/50"
              autoFocus={!initialUrl}
            />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label htmlFor="title" className="text-sm font-medium text-foreground">
            Title{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Input
            id="title"
            placeholder={domain ? `Article from ${domain}` : "Enter a custom title..."}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-muted/50 border-border/40 focus-visible:ring-1 focus-visible:ring-primary/50"
          />
        </div>

        {/* Preview */}
        {urlValid && (
          <div className="rounded-lg border border-border/40 bg-muted/20 p-3.5 space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Preview
            </p>
            <div className="flex items-center gap-3">
              {isExtracting ? (
                <Loader2 className="h-5 w-5 text-muted-foreground animate-spin flex-shrink-0" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={faviconUrl}
                  alt=""
                  className="w-5 h-5 rounded-sm bg-muted object-cover flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-[15px] text-foreground truncate">
                  {title || domain || url}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Globe className="h-3 w-3" />
                  {domain}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            variant="ghost"
            className="flex-1 text-muted-foreground"
            onClick={() => router.push("/dashboard")}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleSubmit}
            disabled={!urlValid || mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save Link"
            )}
          </Button>
        </div>

        {/* Error */}
        {mutation.isError && (
          <p className="text-sm text-destructive text-center">
            Failed to save link. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}
