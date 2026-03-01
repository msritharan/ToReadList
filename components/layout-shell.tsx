"use client";

import { usePathname } from "next/navigation";
import { TopNavbar } from "@/components/top-navbar";

export function LayoutShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLandingPage = pathname === "/";

    if (isLandingPage) {
        return <>{children}</>;
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
