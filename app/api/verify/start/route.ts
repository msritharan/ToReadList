import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";

/**
 * POST /api/verify/start
 *
 * Generates a unique link token for Telegram account linking.
 * Returns the deep link URL that the user taps to connect.
 */
export async function POST() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate a secure random token
    const token = randomBytes(16).toString("hex");

    // Token expires in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Store the token on the user's profile
    const { error } = await supabase
        .from("profiles")
        .update({
            telegram_link_token: token,
            telegram_link_expires_at: expiresAt,
        })
        .eq("id", user.id);

    if (error) {
        console.error("[Verify] Failed to save link token:", error);
        return NextResponse.json(
            { error: "Failed to generate link token" },
            { status: 500 }
        );
    }

    const botUsername = process.env.TELEGRAM_BOT_USERNAME;
    if (!botUsername) {
        return NextResponse.json(
            { error: "Bot not configured" },
            { status: 500 }
        );
    }

    const deepLink = `https://t.me/${botUsername}?start=${token}`;

    return NextResponse.json({
        deepLink,
        botUsername,
        expiresAt,
    });
}
