"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Inbox, Star, Archive, CheckSquare, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

const navItems = [
    { name: "Inbox", href: "/", icon: Inbox },
    { name: "Favorites", href: "/favorites", icon: Star },
    { name: "Archive", href: "/archive", icon: Archive },
    { name: "History", href: "/history", icon: CheckSquare },
];

interface UserInfo {
    name: string;
    email: string;
    avatar_url: string | null;
}

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<UserInfo | null>(null);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setUser({
                    name: user.user_metadata?.full_name || user.user_metadata?.name || "User",
                    email: user.email || "",
                    avatar_url: user.user_metadata?.avatar_url || null,
                });
            }
        });
    }, []);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
    };

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

                {/* User info + Sign out */}
                <div className="mt-3 pt-3 border-t border-border/40">
                    {user && (
                        <div className="flex items-center gap-3 px-2 mb-3">
                            {user.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={user.avatar_url}
                                    alt=""
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium truncate">{user.name}</span>
                                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                            </div>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        className="justify-start gap-3 px-3 text-muted-foreground hover:text-destructive w-full"
                        onClick={handleSignOut}
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </div>
        </div>
    );
}
