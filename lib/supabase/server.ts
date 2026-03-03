import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
}

/**
 * Fast session-based auth for API routes.
 * Reads the session from cookies locally (no network call to Supabase).
 * Safe to use behind middleware that already validates the session via getUser().
 */
export async function createClientWithSession() {
    const supabase = await createClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    return {
        supabase,
        user: session?.user ?? null,
    };
}

