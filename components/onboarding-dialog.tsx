"use client";

import { useState, useEffect } from "react";
import {
    BookOpen,
    Plus,
    Smartphone,
    Send,
    ArrowRight,
    ArrowLeft,
    Settings,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

const ONBOARDING_KEY = "toreadlist_onboarding_seen"; // Legacy key, but we'll use API now

interface OnboardingDialogProps {
    userName?: string;
}

export function OnboardingDialog({ userName }: OnboardingDialogProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        const checkOnboarding = async () => {
            try {
                const res = await fetch("/api/onboarding");
                const data = await res.json();
                if (data.hasSeenOnboarding === false) {
                    setOpen(true);
                }
            } catch (err) {
                console.error("Failed to check onboarding status:", err);
            }
        };
        checkOnboarding();
    }, []);

    const handleClose = async () => {
        setOpen(false);
        try {
            await fetch("/api/onboarding", { method: "POST" });
        } catch (err) {
            console.error("Failed to update onboarding status:", err);
        }
    };

    const handleNext = () => {
        if (step < 2) setStep(step + 1);
        else handleClose();
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    const firstName = userName?.split(" ")[0] || "there";

    return (
        <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
            <DialogContent
                className="sm:max-w-[520px] bg-card border-border/40 p-0 gap-0 overflow-hidden"
                showCloseButton={true}
            >
                {/* Step 0: Welcome */}
                {step === 0 && (
                    <div className="flex flex-col items-center text-center px-8 pt-10 pb-8">
                        {/* Hero Icon */}
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full" />
                            <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/80 to-primary/20 border border-white/10 shadow-xl shadow-primary/20">
                                <BookOpen className="h-10 w-10 text-white" strokeWidth={1.5} />
                            </div>
                        </div>

                        <DialogHeader className="items-center">
                            <DialogTitle className="text-2xl font-bold tracking-tight">
                                Welcome, {firstName}! 👋
                            </DialogTitle>
                            <DialogDescription className="text-base text-muted-foreground max-w-sm leading-relaxed mt-2">
                                ToReadList helps you save articles and links from anywhere, so you can get back to them whenever you&apos;re ready.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                            <Sparkles className="h-4 w-4" />
                            Let&apos;s get you set up in 30 seconds
                        </div>
                    </div>
                )}

                {/* Step 1: Ingestion Channels */}
                {step === 1 && (
                    <div className="px-8 pt-8 pb-6">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold tracking-tight">
                                Save links from anywhere
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground mt-1">
                                Three ways to add articles to your reading list.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-6 space-y-3">
                            {/* Web / Add Link */}
                            <div className="flex items-start gap-4 rounded-xl border border-border/50 bg-muted/20 p-4 transition-colors hover:bg-muted/40">
                                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/15 shrink-0">
                                    <Plus className="h-5 w-5 text-primary" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-foreground">Add Link Button</p>
                                    <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                                        Click the <strong>&quot;Add Link&quot;</strong> button on your dashboard to paste any URL.
                                    </p>
                                </div>
                            </div>

                            {/* PWA / Mobile Share */}
                            <div className="flex items-start gap-4 rounded-xl border border-border/50 bg-muted/20 p-4 transition-colors hover:bg-muted/40">
                                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-400/15 shrink-0">
                                    <Smartphone className="h-5 w-5 text-indigo-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-foreground">Mobile App (PWA)</p>
                                    <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                                        Install our app on your phone, then use the <strong>native share menu</strong> to save links instantly.
                                    </p>
                                </div>
                            </div>

                            {/* Telegram Bot */}
                            <div className="flex items-start gap-4 rounded-xl border border-border/50 bg-muted/20 p-4 transition-colors hover:bg-muted/40">
                                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-400/15 shrink-0">
                                    <Send className="h-5 w-5 text-blue-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-foreground">Telegram Bot</p>
                                    <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                                        Connect our Telegram bot in <strong>Settings</strong> and forward any link to save it.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Get Started */}
                {step === 2 && (
                    <div className="flex flex-col items-center text-center px-8 pt-10 pb-8">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
                            <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/70 to-emerald-500/20 border border-white/10 shadow-xl shadow-emerald-500/20">
                                <Settings className="h-10 w-10 text-white" strokeWidth={1.5} />
                            </div>
                        </div>

                        <DialogHeader className="items-center">
                            <DialogTitle className="text-2xl font-bold tracking-tight">
                                You&apos;re all set!
                            </DialogTitle>
                            <DialogDescription className="text-base text-muted-foreground max-w-sm leading-relaxed mt-2">
                                Start adding links right away, or head to <strong className="text-foreground">Settings</strong> to connect Telegram and install the mobile app.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                            <Button
                                onClick={handleClose}
                                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-11 px-6 text-sm font-semibold"
                            >
                                Start Reading
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Footer with navigation */}
                <div className="flex items-center justify-between px-8 py-4 border-t border-border/40 bg-muted/10">
                    {/* Dot indicators */}
                    <div className="flex items-center gap-1.5">
                        {[0, 1, 2].map((i) => (
                            <button
                                key={i}
                                onClick={() => setStep(i)}
                                className={`h-2 rounded-full transition-all duration-300 ${i === step
                                    ? "w-6 bg-primary"
                                    : "w-2 bg-muted-foreground/25 hover:bg-muted-foreground/40"
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex items-center gap-2">
                        {step === 0 && (
                            <button
                                onClick={handleClose}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors mr-2"
                            >
                                Skip
                            </button>
                        )}
                        {step > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleBack}
                                className="gap-1 text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                Back
                            </Button>
                        )}
                        {step < 2 && (
                            <Button
                                size="sm"
                                onClick={handleNext}
                                className="gap-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                Next
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
