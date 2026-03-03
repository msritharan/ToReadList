"use client";

import { Suspense } from "react";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { H1, Lead } from "@/components/ui/typography";
import { useSearchParams } from "next/navigation";

function LoginContent() {
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirectTo") || "/dashboard";

    const handleGoogleLogin = async () => {
        const supabase = createClient();
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
            },
        });
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background overflow-hidden selection:bg-primary/30">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                {/* Radial gradient grid */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_90%)]" />

                {/* Ambient glow */}
                <div className="absolute w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full mix-blend-screen opacity-50 animate-in fade-in duration-1000 transition-colors" />

                {/* Subtle Telegram blue glow hint */}
                <div className="absolute w-[400px] h-[400px] bg-sky-500/5 blur-[100px] rounded-full translate-y-32 translate-x-32" />
            </div>

            {/* Main Content */}
            <main className="relative z-10 w-full max-w-5xl px-6 py-12 lg:px-8 flex flex-col items-center justify-center text-center mx-auto my-auto animate-in slide-in-from-bottom-8 fade-in duration-1000 ease-out fill-mode-both">

                {/* Top Badge */}
                <div className="mb-10 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-sky-500/20 bg-sky-500/10 text-sky-400 text-sm font-medium tracking-wide shadow-[0_0_15px_rgba(14,165,233,0.1)]">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
                    </span>
                    Available on iOS, Android & Telegram
                </div>

                {/* Hero Icon */}
                <div className="group relative mb-12 flex justify-center">
                    <div className="absolute inset-0 bg-primary/40 blur-2xl rounded-full opacity-50 group-hover:opacity-100 group-hover:bg-primary/60 transition-all duration-700" />
                    <div className="relative flex items-center justify-center w-28 h-28 rounded-[2rem] bg-gradient-to-br from-primary/80 to-primary/20 backdrop-blur-xl border border-white/10 shadow-2xl shadow-primary/20 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6">
                        <BookOpen className="h-14 w-14 text-white" strokeWidth={1.5} />
                    </div>
                </div>

                {/* Typography */}
                <div className="space-y-6 mb-14 w-full flex flex-col items-center">
                    <H1 className="text-5xl sm:text-7xl lg:text-8xl pb-2 text-center text-foreground font-black tracking-tighter leading-[1.1]">
                        ToReadList
                    </H1>
                    <p className="text-3xl sm:text-4xl text-center font-bold tracking-tight text-foreground/90">
                        Save it now. Read it later.
                    </p>
                    <Lead className="text-xl sm:text-2xl max-w-2xl text-center leading-relaxed font-light text-muted-foreground pb-2">
                        Easily save articles using the native share menu on your iPhone or Android device, or by sending a link to our Telegram bot. Get back to your reading in a beautifully clean, distraction-free space.
                    </Lead>
                </div>

                {/* Action Area */}
                <div className="flex flex-col items-center gap-8 w-full">
                    <Button
                        onClick={handleGoogleLogin}
                        size="lg"
                        className="h-16 px-10 rounded-full bg-foreground hover:bg-foreground/90 text-background font-semibold shadow-[0_0_40px_rgba(0,0,0,0.1)] hover:shadow-[0_0_80px_rgba(0,0,0,0.15)] transition-all duration-500 gap-4 group text-xl hover:-translate-y-1"
                    >
                        <svg className="h-7 w-7 transition-transform group-hover:scale-110 duration-500" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Start for free with Google
                    </Button>
                    <p className="text-sm font-medium text-muted-foreground/60 tracking-wide uppercase">
                        Free forever for beta users
                    </p>
                </div>

            </main>

            {/* Footer */}
            <footer className="absolute bottom-8 w-full text-center z-10 flex justify-center">
                <p className="text-sm font-medium text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors duration-300">
                    &copy; {new Date().getFullYear()} ToReadList.
                </p>
            </footer>
        </div>
    );
}

export default function LandingPage() {
    return (
        <Suspense fallback={
            <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background overflow-hidden">
                <BookOpen className="h-14 w-14 text-foreground animate-pulse" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
