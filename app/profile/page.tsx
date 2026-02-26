"use client";

import { useEffect, useState } from "react";
import { LogOut, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLinks } from "@/hooks/use-links";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface UserProfile {
    name: string;
    email: string;
    avatar_url: string | null;
    created_at: string;
}

export default function Profile() {
    const { links, isLoaded } = useLinks();
    const [user, setUser] = useState<UserProfile | null>(null);
    const router = useRouter();

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
    }, []);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
    };

    if (!isLoaded) return <div className="p-8">Loading...</div>;

    const totalLinks = links.length;
    const readLinksCount = links.filter((l) => l.status === "read").length;
    const percentRead = totalLinks === 0 ? 0 : Math.round((readLinksCount / totalLinks) * 100);

    const joinDate = user?.created_at
        ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
        : "";

    return (
        <div className="flex flex-col h-full bg-background">
            <header className="px-8 py-6 border-b border-border/40 shrink-0">
                <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
            </header>

            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-2xl mx-auto space-y-8">

                    <Card className="border-border/40 bg-card/50 overflow-hidden">
                        <div className="h-24 bg-gradient-to-r from-primary/30 to-primary/10 w-full" />
                        <div className="px-6 pb-6 relative">
                            <div className="h-20 w-20 rounded-full bg-background border-4 border-background flex items-center justify-center absolute -top-10 shadow-lg overflow-hidden">
                                {user?.avatar_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={user.avatar_url}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary text-2xl font-semibold">
                                        {user?.name?.charAt(0).toUpperCase() || "U"}
                                    </div>
                                )}
                            </div>

                            <div className="mt-12 flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-semibold">{user?.name || "User"}</h2>
                                    <div className="flex items-center gap-2 mt-1 text-muted-foreground text-sm">
                                        <Mail className="h-4 w-4" />
                                        <span>{user?.email || ""}</span>
                                    </div>
                                    {joinDate && (
                                        <div className="flex items-center gap-2 mt-1 text-muted-foreground text-sm">
                                            <Calendar className="h-4 w-4" />
                                            <span>Joined {joinDate}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div>
                        <h3 className="text-lg font-medium mb-4">Reading Stats</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="border-border/40 bg-card/50">
                                <CardContent className="p-6">
                                    <p className="text-3xl font-bold text-primary">{totalLinks}</p>
                                    <p className="text-sm text-muted-foreground font-medium mt-1">Total Links Saved</p>
                                </CardContent>
                            </Card>

                            <Card className="border-border/40 bg-card/50">
                                <CardContent className="p-6">
                                    <p className="text-3xl font-bold text-green-500">{readLinksCount}</p>
                                    <p className="text-sm text-muted-foreground font-medium mt-1">Articles Read</p>
                                </CardContent>
                            </Card>

                            <Card className="border-border/40 bg-card/50">
                                <CardContent className="p-6">
                                    <p className="text-3xl font-bold text-blue-500">{percentRead}%</p>
                                    <p className="text-sm text-muted-foreground font-medium mt-1">Completion Rate</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium mb-4">Account Actions</h3>
                        <Card className="border-border/40 bg-card/50">
                            <CardContent className="p-1">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive py-6 h-auto rounded-none"
                                    onClick={handleSignOut}
                                >
                                    <LogOut className="mr-3 h-5 w-5" />
                                    <div className="text-left">
                                        <div className="font-medium">Sign Out</div>
                                        <div className="text-xs mt-1 opacity-80">Log out of this device</div>
                                    </div>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </main>
        </div>
    );
}
