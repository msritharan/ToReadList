"use client";

import { useState } from "react";
import { Loader2, MessageCircleQuestion, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface SupportDialogProps {
    userName?: string;
    userEmail?: string;
    trigger: React.ReactNode;
}

const CATEGORIES = [
    { value: "support", label: "Support" },
    { value: "feature_request", label: "Feature Request" },
    { value: "bug_report", label: "Bug Report" },
    { value: "other", label: "Other" },
];

export function SupportDialog({ userName = "", userEmail = "", trigger }: SupportDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(userName);
    const [email, setEmail] = useState(userEmail);
    const [category, setCategory] = useState("support");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const canSubmit = name.trim() && email.trim() && message.trim() && !isSubmitting;

    const handleSubmit = async () => {
        if (!canSubmit) return;

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/support", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim(), email: email.trim(), category, message: message.trim() }),
            });

            if (res.ok) {
                setSubmitted(true);
                setTimeout(() => {
                    setOpen(false);
                    // Reset after close animation
                    setTimeout(() => {
                        setMessage("");
                        setCategory("support");
                        setSubmitted(false);
                    }, 200);
                }, 1500);
            }
        } catch (err) {
            console.error("Failed to submit support request:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (newOpen) {
            // Re-fill name/email on open in case they changed
            setName(userName);
            setEmail(userEmail);
        }
        if (!newOpen) {
            // Reset on close (after a brief delay for animation)
            setTimeout(() => {
                setMessage("");
                setCategory("support");
                setSubmitted(false);
            }, 200);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <div onClick={() => setOpen(true)}>{trigger}</div>
            <DialogContent className="sm:max-w-[480px] bg-card border-border/40">
                {submitted ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-4 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-500/15 text-green-500">
                            <Send className="h-6 w-6" />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-lg font-semibold text-foreground">Request Submitted!</p>
                            <p className="text-sm text-muted-foreground">
                                We&apos;ll get back to you as soon as possible.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-lg flex items-center gap-2">
                                <MessageCircleQuestion className="h-5 w-5 text-primary" />
                                Contact Support
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                Have a question, feature request, or found a bug? Let us know!
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {/* Name */}
                            <div className="space-y-2">
                                <label htmlFor="support-name" className="text-sm font-medium text-foreground">
                                    Name
                                </label>
                                <Input
                                    id="support-name"
                                    placeholder="Your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-muted/50 border-border/40 focus-visible:ring-1 focus-visible:ring-primary/50"
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label htmlFor="support-email" className="text-sm font-medium text-foreground">
                                    Email
                                </label>
                                <Input
                                    id="support-email"
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-muted/50 border-border/40 focus-visible:ring-1 focus-visible:ring-primary/50"
                                />
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <label htmlFor="support-category" className="text-sm font-medium text-foreground">
                                    Category
                                </label>
                                <select
                                    id="support-category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full h-9 rounded-md border border-border/40 bg-muted/50 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
                                >
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Message */}
                            <div className="space-y-2">
                                <label htmlFor="support-message" className="text-sm font-medium text-foreground">
                                    Message
                                </label>
                                <Textarea
                                    id="support-message"
                                    placeholder="Describe your request or issue..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    maxLength={2000}
                                    className="bg-muted/50 border-border/40 focus-visible:ring-1 focus-visible:ring-primary/50 min-h-[120px] resize-y"
                                />
                                <p className="text-xs text-muted-foreground text-right">
                                    {message.length}/2000
                                </p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="ghost"
                                onClick={() => handleOpenChange(false)}
                                className="text-muted-foreground"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={!canSubmit}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Submit
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
