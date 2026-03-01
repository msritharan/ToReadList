"use client";

import { MessageSquare, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default function Settings() {
    return (
        <div className="flex flex-col h-full bg-background">
            <header className="px-8 py-6 border-b border-border/40 shrink-0">
                <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
            </header>

            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-3xl mx-auto space-y-8">

                    <div>
                        <h2 className="text-lg font-medium mb-1">Ingestion Channels</h2>
                        <p className="text-sm text-muted-foreground mb-6">Connect external apps to automatically save links to your inbox.</p>

                        <Card className="border-border/40 bg-card/50">
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                                        <MessageSquare className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <CardTitle className="text-base font-medium">WhatsApp Integration</CardTitle>
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                                                <Clock className="h-3 w-3" />
                                                Coming Soon
                                            </span>
                                        </div>
                                        <CardDescription>Send links to our bot to instantly save them.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-lg border border-border/30 bg-muted/10 p-4 space-y-3">
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        We&apos;re building a WhatsApp bot that lets you forward any link and have it saved automatically to your reading list. Stay tuned!
                                    </p>
                                    <ul className="text-sm text-muted-foreground/70 space-y-1.5 list-disc ml-5">
                                        <li>Forward any link to save it instantly</li>
                                        <li>Get confirmation replies in chat</li>
                                        <li>Send <code className="bg-muted px-1.5 py-0.5 rounded text-xs">list</code> to see your recents</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Separator className="border-border/40" />

                    <div>
                        <h2 className="text-lg font-medium mb-1">Preferences</h2>
                        <p className="text-sm text-muted-foreground mb-6">Customize how ToReadList looks and feels.</p>

                        <Card className="border-border/40 bg-card/50">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-sm">Theme</p>
                                        <p className="text-sm text-muted-foreground">The application forces a dark aesthetic tailored for reading comfort.</p>
                                    </div>
                                    <Button variant="outline" disabled className="opacity-50">
                                        Dark Mode Only
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </main>
        </div>
    );
}
