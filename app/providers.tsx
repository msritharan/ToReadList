"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    // We instantiate the QueryClient inside the component state to ensure
    // that data is not shared across different users/requests if this were
    // to be rendered on the server during SSR.
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Keep data fresh indefinitely. We will rely on manual
                        // cache invalidation via mutations to keep data synced.
                        staleTime: Infinity,
                        // Optional: disable refetch on window focus to completely 
                        // minimize network requests as discussed.
                        refetchOnWindowFocus: false,
                        retry: 1,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
