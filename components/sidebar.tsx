"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Inbox, Star, Archive, CheckSquare, Settings, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
    { name: "Inbox", href: "/", icon: Inbox },
    { name: "Favorites", href: "/favorites", icon: Star },
    { name: "Archive", href: "/archive", icon: Archive },
    { name: "History", href: "/history", icon: CheckSquare },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col w-64 h-full border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-6">
            <div className="flex items-center gap-3 px-2 mb-8">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 text-primary">
                    <BookOpen className="h-5 w-5" />
                </div>
                <span className="font-semibold text-lg tracking-tight">ToReadList</span>
            </div>

            <div className="flex flex-col gap-1 flex-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Button
                            key={item.href}
                            variant={isActive ? "secondary" : "ghost"}
                            className={cn("justify-start gap-3 px-3", isActive ? "font-medium" : "text-muted-foreground hover:text-foreground")}
                            asChild
                        >
                            <Link href={item.href}>
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        </Button>
                    );
                })}
            </div>

            <div className="flex flex-col gap-1 mt-auto">
                <Button variant="ghost" className="justify-start gap-3 px-3 text-muted-foreground hover:text-foreground" asChild>
                    <Link href="/settings">
                        <Settings className="h-4 w-4" />
                        Settings
                    </Link>
                </Button>
                <Button variant="ghost" className="justify-start gap-3 px-3 text-muted-foreground hover:text-foreground" asChild>
                    <Link href="/profile">
                        <UserCircle className="h-4 w-4" />
                        Profile
                    </Link>
                </Button>
            </div>
        </div>
    );
}
