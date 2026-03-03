"use client";

import { useState, useEffect, useCallback } from "react";
import { Send, Clock, Download, Trash2, Loader2, ExternalLink, CheckCircle2, Unplug, Smartphone, ChevronDown, ChevronRight, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Separator } from "@/components/ui/separator";
import { ThemeSelector } from "@/components/theme-selector";
import { Button } from "@/components/ui/button";
import { H3, P, Small } from "@/components/ui/typography";
import { PWAInstallGuide } from "@/components/pwa-install-guide";

type TelegramStatus = "loading" | "disconnected" | "connecting" | "connected";

export default function Settings() {
    const [telegramStatus, setTelegramStatus] = useState<TelegramStatus>("loading");
    const [deepLink, setDeepLink] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPWAInstructions, setShowPWAInstructions] = useState(false);

    // Check Telegram connection status on mount
    useEffect(() => {
        checkTelegramStatus();
    }, []);

    const checkTelegramStatus = async () => {
        try {
            const res = await fetch("/api/verify/check");
            const data = await res.json();
            setTelegramStatus(data.connected ? "connected" : "disconnected");
        } catch {
            setTelegramStatus("disconnected");
        }
    };

    // Poll for verification when in "connecting" state
    useEffect(() => {
        if (telegramStatus !== "connecting") return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch("/api/verify/check");
                const data = await res.json();
                if (data.connected) {
                    setTelegramStatus("connected");
                    setDeepLink(null);
                }
            } catch {
                // keep polling
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [telegramStatus]);

    const handleConnect = useCallback(async () => {
        setIsProcessing(true);
        try {
            const res = await fetch("/api/verify/start", { method: "POST" });
            const data = await res.json();
            if (data.deepLink) {
                setDeepLink(data.deepLink);
                setTelegramStatus("connecting");
            }
        } catch {
            // handle error silently
        } finally {
            setIsProcessing(false);
        }
    }, []);

    const handleDisconnect = useCallback(async () => {
        setIsProcessing(true);
        try {
            await fetch("/api/verify/disconnect", { method: "POST" });
            setTelegramStatus("disconnected");
            setDeepLink(null);
        } catch {
            // handle error silently
        } finally {
            setIsProcessing(false);
        }
    }, []);

    return (
        <div className="flex flex-col h-full bg-background">
            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-2xl mx-auto space-y-10">

                    {/* ── Ingestion Channels ── */}
                    <section>
                        <H3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
                            Ingestion Channels
                        </H3>
                        <div className="space-y-1">
                            {/* Telegram Channel */}
                            <div className="rounded-lg px-4 py-3.5 transition-colors hover:bg-muted/40">
                                <div className="flex items-center gap-4">
                                    <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-blue-400/10">
                                        <Send className="h-[18px] w-[18px] text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <P className="text-sm font-medium mt-0">Telegram</P>
                                        <Small className="text-muted-foreground">
                                            Send links to our Telegram bot to add them to your list.
                                        </Small>
                                    </div>

                                    {/* Status / Action */}
                                    {telegramStatus === "loading" && (
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    )}

                                    {telegramStatus === "disconnected" && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleConnect}
                                            disabled={isProcessing}
                                            className="shrink-0 gap-1.5"
                                        >
                                            {isProcessing ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Send className="h-3.5 w-3.5" />
                                            )}
                                            Connect
                                        </Button>
                                    )}

                                    {telegramStatus === "connected" && (
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Connected
                                            </span>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={handleDisconnect}
                                                disabled={isProcessing}
                                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                                title="Disconnect Telegram"
                                            >
                                                {isProcessing ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <Unplug className="h-3.5 w-3.5" />
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Deep Link — shown when connecting */}
                                {telegramStatus === "connecting" && deepLink && (
                                    <div className="mt-3">
                                        <div className="rounded-md border border-blue-500/20 bg-blue-500/5 p-4 space-y-4">
                                            {/* QR Code */}
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="bg-white rounded-lg p-3">
                                                    <QRCodeSVG
                                                        value={deepLink}
                                                        size={160}
                                                        level="M"
                                                        marginSize={0}
                                                    />
                                                </div>
                                                <Small className="text-muted-foreground text-center">
                                                    Scan with your phone to link via Telegram
                                                </Small>
                                            </div>

                                            {/* Divider with "or" */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-px bg-border/60" />
                                                <span className="text-xs text-muted-foreground/50 uppercase tracking-wider">or</span>
                                                <div className="flex-1 h-px bg-border/60" />
                                            </div>

                                            {/* Open in Telegram link */}
                                            <div className="flex flex-col items-center gap-2">
                                                <a
                                                    href={deepLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                    Open in Telegram
                                                </a>
                                            </div>

                                            {/* Waiting spinner */}
                                            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                Waiting for connection...
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* PWA Channel */}
                            <div className="rounded-lg px-4 py-3.5 transition-colors hover:bg-muted/40">
                                <div className="flex items-center gap-4">
                                    <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-indigo-400/10">
                                        <Smartphone className="h-[18px] w-[18px] text-indigo-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <P className="text-sm font-medium mt-0">Progressive Web App</P>
                                        <Small className="text-muted-foreground">
                                            Install our app to share links directly from your device.
                                        </Small>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowPWAInstructions(!showPWAInstructions)}
                                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                                            title={showPWAInstructions ? "Hide instructions" : "How to install"}
                                        >
                                            {showPWAInstructions ? (
                                                <ChevronDown className="h-3.5 w-3.5" />
                                            ) : (
                                                <ChevronRight className="h-3.5 w-3.5" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Installation Instructions */}
                                {showPWAInstructions && (
                                    <PWAInstallGuide isOpen={true} />
                                )}
                            </div>
                        </div>
                    </section>

                    <Separator className="border-border/40" />

                    {/* ── Preferences ── */}
                    <section>
                        <H3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
                            Preferences
                        </H3>
                        <div className="flex items-center justify-between rounded-lg px-4 py-3.5 hover:bg-muted/40 transition-colors">
                            <div>
                                <P className="text-sm font-medium mt-0">Theme</P>
                                <Small className="text-muted-foreground">Choose your preferred color scheme.</Small>
                            </div>
                            <ThemeSelector />
                        </div>
                    </section>

                    <Separator className="border-border/40" />

                    {/* ── Account ── */}
                    <section>
                        <H3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
                            Account
                        </H3>
                        <div className="space-y-1">
                            <div className="flex items-center justify-between rounded-lg px-4 py-3.5 hover:bg-muted/40 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Download className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <P className="text-sm font-medium mt-0">Export Data</P>
                                        <Small className="text-muted-foreground">Download a copy of all your saved links.</Small>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border shrink-0">
                                    <Clock className="h-3 w-3" />
                                    Coming Soon
                                </span>
                            </div>

                            <div className="flex items-center justify-between rounded-lg px-4 py-3.5 hover:bg-muted/40 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Trash2 className="h-4 w-4 text-destructive/70" />
                                    <div>
                                        <P className="text-sm font-medium text-destructive mt-0">Delete Account</P>
                                        <Small className="text-muted-foreground">Permanently remove your account and all data.</Small>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border shrink-0">
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
