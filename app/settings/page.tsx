"use client";

import { useState, useEffect } from "react";
import { Copy, MessageSquare, Phone, Smartphone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isLinked, setIsLinked] = useState(false);
    const [isLinking, setIsLinking] = useState(false);

    useEffect(() => {
        const linked = localStorage.getItem("toreadlist_whatsapp");
        if (linked) {
            setPhoneNumber(linked);
            setIsLinked(true);
        }
    }, []);

    const handleLinkDevice = (e: React.FormEvent) => {
        e.preventDefault();
        if (!phoneNumber) return;

        setIsLinking(true);
        // Simulate API call
        setTimeout(() => {
            localStorage.setItem("toreadlist_whatsapp", phoneNumber);
            setIsLinked(true);
            setIsLinking(false);
        }, 1000);
    };

    const handleUnlink = () => {
        localStorage.removeItem("toreadlist_whatsapp");
        setPhoneNumber("");
        setIsLinked(false);
    };

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
                                    <div>
                                        <CardTitle className="text-base font-medium">WhatsApp Integration</CardTitle>
                                        <CardDescription>Send links to our bot to instantly save them.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLinked ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-3 rounded-md bg-green-500/10 border border-green-500/20 text-green-500">
                                            <CheckCircle2 className="h-5 w-5" />
                                            <div>
                                                <p className="text-sm font-medium">Device Linked Successfully</p>
                                                <p className="text-xs opacity-80">Connected to {phoneNumber}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">How to use:</p>
                                            <ol className="text-sm text-muted-foreground list-decimal ml-5 space-y-2">
                                                <li>Save our bot number to your contacts: <span className="font-mono text-primary font-medium tracking-wider">+1 (555) 123-4567</span></li>
                                                <li>Forward any link to the chat to instantly save it.</li>
                                                <li>Send <code className="bg-muted px-1.5 py-0.5 rounded">list</code> to see your recent unread items.</li>
                                            </ol>
                                        </div>

                                        <Separator className="my-4 border-border/40" />

                                        <div className="flex justify-end">
                                            <Button variant="destructive" onClick={handleUnlink}>
                                                Unlink Device
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleLinkDevice} className="space-y-4">
                                        <div className="space-y-2">
                                            <label htmlFor="phone" className="text-sm font-medium">WhatsApp Phone Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    placeholder="+1 (555) 000-0000"
                                                    className="pl-9 bg-background focus-visible:ring-1 focus-visible:ring-primary/50"
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                                    disabled={isLinking}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">Include your country code. Note: In the final version, this will send an OTP.</p>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                            disabled={isLinking || !phoneNumber}
                                        >
                                            {isLinking ? "Verifying..." : "Link Device"}
                                        </Button>
                                    </form>
                                )}
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
