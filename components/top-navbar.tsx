"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Settings, LogOut, User, Trash2, MessageCircleQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTrash } from "@/hooks/use-trash";
import { SupportDialog } from "@/components/support-dialog";

interface UserInfo {
    name: string;
    email: string;
    avatar_url: string | null;
}

export function TopNavbar() {
    const router = useRouter();
    const [user, setUser] = useState<UserInfo | null>(null);
    const { trashCount } = useTrash();

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
        router.push("/");
    };

    return (
        <header className="flex items-center justify-between h-16 px-6 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
            {/* Left: Logo */}
            <Link href="/dashboard" className="flex items-center gap-3 group">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 text-primary transition-colors group-hover:bg-primary/30">
                    <BookOpen className="h-5 w-5" />
                </div>
                <span className="font-semibold text-lg tracking-tight">ToReadList</span>
            </Link>

            {/* Right: Theme Toggle + User Avatar Dropdown */}
            <div className="flex items-center gap-1">
                <ThemeToggle />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 hover:ring-2 hover:ring-primary/20 transition-all">
                            {user?.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={user.avatar_url}
                                    alt=""
                                    className="w-9 h-9 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                                    {user?.name?.charAt(0).toUpperCase() || "U"}
                                </div>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-popover">
                        {user && (
                            <>
                                <div className="px-3 py-2">
                                    <p className="text-sm font-medium">{user.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                </div>
                                <DropdownMenuSeparator />
                            </>
                        )}
                        <DropdownMenuItem className="cursor-pointer" asChild>
                            <Link href="/profile">
                                <User className="mr-2 h-4 w-4" />
                                Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" asChild>
                            <Link href="/settings">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" asChild>
                            <Link href="/trash">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Trash
                                {trashCount > 0 && (
                                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold !text-white">
                                        {trashCount > 99 ? "99+" : trashCount}
                                    </span>
                                )}
                            </Link>
                        </DropdownMenuItem>
                        <SupportDialog
                            userName={user?.name}
                            userEmail={user?.email}
                            trigger={
                                <DropdownMenuItem className="cursor-pointer" onSelect={(e) => e.preventDefault()}>
                                    <MessageCircleQuestion className="mr-2 h-4 w-4" />
                                    Support
                                </DropdownMenuItem>
                            }
                        />
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                            onClick={handleSignOut}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
