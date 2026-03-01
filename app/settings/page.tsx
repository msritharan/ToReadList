"use client";

import { MessageSquare, Send, Clock, Download, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ThemeSelector } from "@/components/theme-selector";

const channels = [
    {
        name: "WhatsApp",
        description: "Forward links to our bot to save them instantly.",
        icon: MessageSquare,
        iconColor: "text-green-500",
        iconBg: "bg-green-500/10",
        status: "Coming Soon" as const,
    },
    {
        name: "Telegram",
        description: "Send links to our Telegram bot to add them to your list.",
        icon: Send,
        iconColor: "text-blue-400",
        iconBg: "bg-blue-400/10",
        status: "Coming Soon" as const,
    },
];

export default function Settings() {
    return (
        <div className="flex flex-col h-full bg-background">
            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-2xl mx-auto space-y-10">

                    {/* ── Ingestion Channels ── */}
                    <section>
                        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
                            Ingestion Channels
                        </h2>
                        <div className="space-y-1">
                            {channels.map((ch) => (
                                <div
                                    key={ch.name}
                                    className="flex items-center gap-4 rounded-lg px-4 py-3.5 transition-colors hover:bg-muted/40"
                                >
                                    <div className={`h-9 w-9 flex items-center justify-center rounded-lg ${ch.iconBg}`}>
                                        <ch.icon className={`h-[18px] w-[18px] ${ch.iconColor}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">{ch.name}</p>
                                        <p className="text-xs text-muted-foreground">{ch.description}</p>
                                    </div>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                                        <Clock className="h-3 w-3" />
                                        {ch.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <Separator className="border-border/40" />

                    {/* ── Preferences ── */}
                    <section>
                        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
                            Preferences
                        </h2>
                        <div className="flex items-center justify-between rounded-lg px-4 py-3.5 hover:bg-muted/40 transition-colors">
                            <div>
                                <p className="text-sm font-medium">Theme</p>
                                <p className="text-xs text-muted-foreground">Choose your preferred color scheme.</p>
                            </div>
                            <ThemeSelector />
                        </div>
                    </section>

                    <Separator className="border-border/40" />

                    {/* ── Account ── */}
                    <section>
                        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
                            Account
                        </h2>
                        <div className="space-y-1">
                            <div className="flex items-center justify-between rounded-lg px-4 py-3.5 hover:bg-muted/40 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Download className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Export Data</p>
                                        <p className="text-xs text-muted-foreground">Download a copy of all your saved links.</p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                                    <Clock className="h-3 w-3" />
                                    Coming Soon
                                </span>
                            </div>

                            <div className="flex items-center justify-between rounded-lg px-4 py-3.5 hover:bg-muted/40 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Trash2 className="h-4 w-4 text-destructive/70" />
                                    <div>
                                        <p className="text-sm font-medium text-destructive">Delete Account</p>
                                        <p className="text-xs text-muted-foreground">Permanently remove your account and all data.</p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                                    <Clock className="h-3 w-3" />
                                    Coming Soon
                                </span>
                            </div>
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
}
