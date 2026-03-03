"use client";

import * as React from "react";
import { X, Tag as TagIcon, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TagInputProps {
    /** Comma-separated string of tags (internal format) */
    value: string;
    /** Called with the new comma-separated string whenever tags change */
    onChange: (value: string) => void;
    /** List of existing tags for autocomplete suggestions */
    availableTags: string[];
    placeholder?: string;
    className?: string;
}

export function TagInput({
    value,
    onChange,
    availableTags,
    placeholder = "Type a tag and press Enter...",
    className,
}: TagInputProps) {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");
    const [activeIndex, setActiveIndex] = React.useState(0);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Parse comma-separated value into an array of tags
    const tags = React.useMemo(() => {
        return value
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter((t) => t.length > 0);
    }, [value]);

    // Filter autocomplete suggestions based on current input
    const suggestions = React.useMemo(() => {
        const query = inputValue.trim().toLowerCase();
        if (!query) return [];

        return availableTags
            .filter(
                (tag) =>
                    tag.toLowerCase().includes(query) &&
                    !tags.includes(tag.toLowerCase())
            )
            .slice(0, 8);
    }, [inputValue, availableTags, tags]);

    React.useEffect(() => {
        setActiveIndex(0);
    }, [suggestions]);

    // Serialize tags array back to comma-separated string
    const serializeTags = (newTags: string[]) => {
        onChange(newTags.join(", "));
    };

    const addTag = (tag: string) => {
        const normalizedTag = tag.trim().toLowerCase();
        if (!normalizedTag || tags.includes(normalizedTag)) return;
        serializeTags([...tags, normalizedTag]);
        setInputValue("");
        setOpen(false);
        inputRef.current?.focus();
    };

    const removeTag = (tagToRemove: string) => {
        serializeTags(tags.filter((t) => t !== tagToRemove));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);

        if (newValue.trim() && suggestions.length > 0) {
            setOpen(true);
        } else {
            setOpen(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown" && open && suggestions.length > 0) {
            e.preventDefault();
            setActiveIndex((prev) => (prev + 1) % suggestions.length);
        } else if (e.key === "ArrowUp" && open && suggestions.length > 0) {
            e.preventDefault();
            setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (open && suggestions.length > 0) {
                // Select the highlighted suggestion
                addTag(suggestions[activeIndex]);
            } else if (inputValue.trim()) {
                // Add whatever the user typed as a new tag
                addTag(inputValue);
            }
        } else if (e.key === "Escape") {
            setOpen(false);
        } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
            // Remove the last tag when pressing backspace on empty input
            removeTag(tags[tags.length - 1]);
        }
    };

    return (
        <div className={cn("space-y-2", className)}>
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                        <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1 py-0.5 px-2 hover:bg-primary/20 transition-all font-medium"
                        >
                            <TagIcon className="h-3 w-3" />
                            {tag}
                            <button
                                onClick={() => removeTag(tag)}
                                className="hover:text-destructive transition-colors ml-0.5"
                                type="button"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
            <Popover open={open && suggestions.length > 0} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <div className="relative">
                        <Input
                            ref={inputRef}
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder={tags.length > 0 ? "Add another tag..." : placeholder}
                            className="bg-muted/30 border-border/40 focus-visible:ring-1 focus-visible:ring-primary/50"
                            autoComplete="off"
                        />
                    </div>
                </PopoverTrigger>
                <PopoverContent
                    className="p-1 w-[var(--radix-popover-trigger-width)] bg-popover border-border/60 shadow-xl rounded-xl z-50"
                    align="start"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <div className="flex flex-col gap-0.5 max-h-[200px] overflow-y-auto overflow-x-hidden">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={suggestion}
                                onClick={() => addTag(suggestion)}
                                className={cn(
                                    "flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all text-left group",
                                    index === activeIndex
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                                )}
                                type="button"
                            >
                                <div className="flex items-center gap-2">
                                    <TagIcon className="h-3.5 w-3.5 opacity-60" />
                                    <span>{suggestion}</span>
                                </div>
                                {index === activeIndex && (
                                    <Check className="h-3.5 w-3.5" />
                                )}
                            </button>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
