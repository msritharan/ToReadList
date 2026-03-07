"use client";

import { usePathname } from "next/navigation";
import { TopNavbar } from "@/components/top-navbar";

export function LayoutShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLandingPage = pathname === "/";

    if (isLandingPage) {
        // The app shell locks body scrolling and provides its own scroll area.
        // The landing page needs a scroll container too, especially on mobile.
        return <div className="h-full w-full overflow-y-auto">{children}</div>;
    }

    return (
        <div className="flex flex-col h-full w-full">
            <TopNavbar />
            <main className="flex-1 overflow-y-auto bg-background">
                {children}
            </main>
        </div>
    );
}
