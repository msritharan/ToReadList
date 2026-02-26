"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";

export function LayoutShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLandingPage = pathname === "/";

    if (isLandingPage) {
        return <>{children}</>;
    }

    return (
        <>
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-background">
                {children}
            </main>
        </>
    );
}
