"use client";

import { LogOut, UserCircle2, Mail, ExternalLink, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLinks } from "@/hooks/use-links";

export default function Profile() {
    const { links, isLoaded } = useLinks();

    if (!isLoaded) return <div className="p-8">Loading...</div>;

    const totalLinks = links.length;
    const readLinksCount = links.filter((l) => l.status === "read").length;
    const percentRead = totalLinks === 0 ? 0 : Math.round((readLinksCount / totalLinks) * 100);

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
                            <div className="h-20 w-20 rounded-full bg-background border-4 border-background flex items-center justify-center absolute -top-10 text-muted-foreground shadow-lg">
                                <UserCircle2 className="h-16 w-16" />
                            </div>

                            <div className="mt-12 flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-semibold">User Profile</h2>
                                    <div className="flex items-center gap-2 mt-1 text-muted-foreground text-sm">
                                        <Mail className="h-4 w-4" />
                                        <span>user@example.com</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 text-muted-foreground text-sm">
                                        <Calendar className="h-4 w-4" />
                                        <span>Joined October 2023</span>
                                    </div>
                                </div>

                                <Button variant="outline" className="text-muted-foreground hover:text-foreground">
                                    Edit Profile
                                </Button>
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
                            <CardContent className="p-1 divider-y divide-border/40">
                                <Button variant="ghost" className="w-full justify-start text-muted-foreground py-6 h-auto rounded-none">
                                    <ExternalLink className="mr-3 h-5 w-5" />
                                    <div className="text-left">
                                        <div className="font-medium text-foreground">Export Data</div>
                                        <div className="text-xs mt-1">Download a CSV of all your saved links</div>
                                    </div>
                                </Button>

                                <Button variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive py-6 h-auto rounded-none">
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
