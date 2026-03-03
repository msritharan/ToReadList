"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Globe, Loader2, Link as LinkIcon, BookOpen, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LinkItem } from "@/types";
import { TagInput } from "@/components/tag-input";

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
  title?: string;
  description?: string;
  availableTags?: string[];
}

export function AddLinkClient({ url: initialUrl, title: initialTitle = "", description: initialDescription = "", availableTags = [] }: AddLinkClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [url, setUrl] = useState(initialUrl);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [tags, setTags] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  // Track whether the user has manually edited title/description
  const userEditedTitle = useRef(!!initialTitle);
  const userEditedDescription = useRef(!!initialDescription);

  const domain = extractDomain(url);
  const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : "";
  const urlValid = isValidUrl(url);

  // Auto-fetch metadata when the URL is valid
  useEffect(() => {
    let isMounted = true;

    const fetchMetadata = async () => {
      if (!url || !urlValid) {
        setIsExtracting(false);
        return;
      }

      // Don't overwrite user edits
      if (userEditedTitle.current && userEditedDescription.current) return;

      setIsExtracting(true);
      try {
        const res = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.title && !userEditedTitle.current) setTitle(data.title);
            if (data.description && !userEditedDescription.current) setDescription(data.description);
          }
        }
      } catch (err) {
        console.warn("[AddLinkClient] Failed to fetch metadata:", err);
      } finally {
        if (isMounted) setIsExtracting(false);
      }
    };

    const timer = setTimeout(fetchMetadata, 500); // debounce
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
    // Only re-run when URL changes, not when title/description change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, urlValid]);

  const mutation = useMutation({
    mutationFn: addLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      router.push("/dashboard");
    },
  });

  const handleSubmit = () => {
    if (!url || !urlValid) return;

    const parsedTags = tags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    mutation.mutate({
      url,
      title: title || domain || url,
      description: description || undefined,
      domain,
      favicon_url: faviconUrl,
      status: "unread",
      is_favorite: false,
      tags: parsedTags,
      source: "pwa",
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

        {/* Auto-detect info banner */}
        {urlValid && isExtracting && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10 animate-in fade-in duration-200">
            <Loader2 className="h-3.5 w-3.5 text-primary animate-spin flex-shrink-0" />
            <span className="text-xs text-primary/80">Auto-detecting title and description…</span>
          </div>
        )}
        {urlValid && !isExtracting && (title || description) && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/30 animate-in fade-in duration-200">
            <Info className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground">Title and description were auto-detected. Feel free to edit.</span>
          </div>
        )}

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
          <div className="relative">
            <Input
              id="title"
              placeholder={isExtracting ? "Detecting title…" : (domain ? `Article from ${domain}` : "Enter a custom title...")}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                userEditedTitle.current = true;
              }}
              className={`bg-muted/50 border-border/40 focus-visible:ring-1 focus-visible:ring-primary/50 ${isExtracting && !title ? "animate-pulse" : ""}`}
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label htmlFor="description" className="text-sm font-medium text-foreground">
            Description{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Textarea
            id="description"
            placeholder={isExtracting ? "Detecting description…" : "Enter a description..."}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              userEditedDescription.current = true;
            }}
            className={`bg-muted/50 border-border/40 focus-visible:ring-1 focus-visible:ring-primary/50 min-h-[80px] resize-y ${isExtracting && !description ? "animate-pulse" : ""}`}
          />
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label htmlFor="tags" className="text-sm font-medium text-foreground">
            Tags
          </label>
          <TagInput
            availableTags={availableTags}
            value={tags}
            onChange={setTags}
            placeholder="Add tags..."
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
