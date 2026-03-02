"use client";

import { useEffect, useState } from "react";
import { Mail, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Large, Small } from "@/components/ui/typography";

interface UserProfile {
    name: string;
    email: string;
    avatar_url: string | null;
    created_at: string;
}

interface LinkStats {
    total: number;
    read: number;
    unread: number;
    skipped: number;
}

export default function Profile() {
    const [stats, setStats] = useState<LinkStats>({ total: 0, read: 0, unread: 0, skipped: 0 });
    const [user, setUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setUser({
                    name: user.user_metadata?.full_name || user.user_metadata?.name || "User",
                    email: user.email || "",
                    avatar_url: user.user_metadata?.avatar_url || null,
                    created_at: user.created_at,
                });
            }
        });

        fetch("/api/links/stats")
            .then((res) => res.json())
            .then((data: LinkStats) => setStats(data))
            .catch(console.error);
    }, []);

    const percentRead =
        stats.total === 0 ? 0 : Math.round((stats.read / stats.total) * 100);

    const joinDate = user?.created_at
        ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
        : "";

    return (
        <div className="flex flex-col h-full bg-background">
            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-2xl mx-auto space-y-10">

                    {/* ── User Info ── */}
                    <section className="flex items-center gap-5">
                        <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                            {user?.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={user.avatar_url}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-xl font-semibold text-primary">
                                    {user?.name?.charAt(0).toUpperCase() || "U"}
                                </span>
                            )}
                        </div>
                        <div className="min-w-0">
                            <Large className="truncate">{user?.name || "User"}</Large>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                                <span className="inline-flex items-center gap-1.5">
                                    <Mail className="h-3.5 w-3.5" />
                                    {user?.email}
                                </span>
                                {joinDate && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Joined {joinDate}
                                    </span>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* ── Reading Stats ── */}
                    <section>
                        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
                            Reading Stats
                        </h2>
                        <div className="grid grid-cols-3 gap-3">
                            <Card className="border-border/40 bg-card/50">
                                <CardContent className="p-5">
                                    <p className="text-2xl font-bold text-primary">{stats.total}</p>
                                    <Small className="mt-1 text-muted-foreground">Links Saved</Small>
                                </CardContent>
                            </Card>
                            <Card className="border-border/40 bg-card/50">
                                <CardContent className="p-5">
                                    <p className="text-2xl font-bold text-green-500">{stats.read}</p>
                                    <Small className="mt-1 text-muted-foreground">Articles Read</Small>
                                </CardContent>
                            </Card>
                            <Card className="border-border/40 bg-card/50">
                                <CardContent className="p-5">
                                    <p className="text-2xl font-bold text-blue-500">{percentRead}%</p>
                                    <Small className="mt-1 text-muted-foreground">Completion</Small>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
}
