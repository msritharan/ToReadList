import { NextResponse } from "next/server";
import { createClientWithSession } from "@/lib/supabase/server";

/**
 * GET /api/verify/check
 *
 * Polls the user's Telegram verification status.
 * Used by the Settings page to detect when linking completes.
 */
export async function GET() {
    const { supabase, user } = await createClientWithSession();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("telegram_chat_id, telegram_verified")
        .eq("id", user.id)
        .single();

    if (error) {
        return NextResponse.json(
            { error: "Failed to check status" },
            { status: 500 }
        );
    }

    return NextResponse.json({
        connected: !!profile?.telegram_verified,
        chatId: profile?.telegram_chat_id ?? null,
    });
}
