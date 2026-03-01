import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/verify/disconnect
 *
 * Disconnects the user's Telegram account.
 */
export async function POST() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
        .from("profiles")
        .update({
            telegram_chat_id: null,
            telegram_verified: false,
            telegram_link_token: null,
            telegram_link_expires_at: null,
        })
        .eq("id", user.id);

    if (error) {
        return NextResponse.json(
            { error: "Failed to disconnect" },
            { status: 500 }
        );
    }

    return NextResponse.json({ ok: true });
}
