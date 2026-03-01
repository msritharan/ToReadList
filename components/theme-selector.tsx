"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const themes = [
    { value: "light", label: "Light", icon: Moon },
    { value: "dark", label: "Dark", icon: Sun },
] as const;

export function ThemeSelector({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return <div className="h-9 w-[130px] rounded-md bg-muted/60 animate-pulse" />;
    }

    const selectedTheme = themes.find((t) => t.value === theme);
    const Icon = selectedTheme?.icon || Sun;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className={`justify-start gap-2 ${className}`}
                >
                    <Icon className="h-4 w-4" />
                    <span>{selectedTheme?.label || "Dark"}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[130px]">
                <DropdownMenuRadioGroup
                    value={theme}
                    onValueChange={(value) => setTheme(value as "light" | "dark")}
                >
                    {themes.map((t) => (
                        <DropdownMenuRadioItem
                            key={t.value}
                            value={t.value}
                            className="flex items-center gap-2"
                        >
                            <t.icon className="h-4 w-4" />
                            {t.label}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
