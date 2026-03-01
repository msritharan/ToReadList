import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
    type TelegramUpdate,
    sendMessage,
    extractUrls,
    getBotCommand,
    verifyWebhookSecret,
} from "@/lib/telegram";

/**
 * POST /api/telegram/webhook
 *
 * Receives all incoming Telegram bot messages.
 * Handles:
 *   /start <token>  → link Telegram to a user account
 *   /help           → reply with usage instructions
 *   URLs            → save as links for the user
 *   Other           → reply with help text
 */
export async function POST(request: NextRequest) {
    // 1. Verify webhook secret
    const secret = request.headers.get("x-telegram-bot-api-secret-token");
    if (!verifyWebhookSecret(secret)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Parse the update
    let update: TelegramUpdate;
    try {
        update = await request.json();
    } catch {
        return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    const message = update.message;
    if (!message || !message.chat) {
        // Not a message update (could be edited_message, callback_query, etc.)
        return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const supabase = createAdminClient();

    // 3. Handle bot commands
    const command = getBotCommand(message);

    if (command === "/start") {
        await handleStart(supabase, chatId, message.text ?? "");
        return NextResponse.json({ ok: true });
    }

    if (command === "/help") {
        await sendHelpMessage(chatId);
        return NextResponse.json({ ok: true });
    }

    // 4. Handle URLs — save as links
    const urls = extractUrls(message);
    if (urls.length > 0) {
        await handleUrls(supabase, chatId, urls);
        return NextResponse.json({ ok: true });
    }

    // 5. Unknown message — send help
    await sendMessage(
        chatId,
        "I didn't find any links in that message. Send me a URL and I'll save it for you!\n\nType /help for more info."
    );

    return NextResponse.json({ ok: true });
}

// ─── Command Handlers ───────────────────────────────────────────────

async function handleStart(
    supabase: ReturnType<typeof createAdminClient>,
    chatId: number,
    text: string
) {
    // Extract the token from "/start <token>"
    const parts = text.trim().split(/\s+/);
    const token = parts.length > 1 ? parts[1] : null;

    if (!token) {
        // Plain /start with no token — just greet
        await sendMessage(
            chatId,
            "👋 Welcome to ToReadList!\n\nTo connect your account, go to Settings → Channels in the web app and click 'Connect Telegram'.\n\nOnce connected, just send me any URL and I'll save it to your reading list!"
        );
        return;
    }

    // Look up the profile with this link token
    const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, telegram_link_token, telegram_link_expires_at")
        .eq("telegram_link_token", token)
        .single();

    if (error || !profile) {
        await sendMessage(
            chatId,
            "❌ Invalid or expired link code. Please try again from Settings → Channels in the web app."
        );
        return;
    }

    // Check if the token has expired
    if (
        profile.telegram_link_expires_at &&
        new Date(profile.telegram_link_expires_at) < new Date()
    ) {
        await sendMessage(
            chatId,
            "⏰ This link code has expired. Please generate a new one from Settings → Channels in the web app."
        );
        return;
    }

    // Link the chat ID to the user's profile
    const { error: updateError } = await supabase
        .from("profiles")
        .update({
            telegram_chat_id: String(chatId),
            telegram_verified: true,
            telegram_link_token: null, // clear the token
            telegram_link_expires_at: null,
        })
        .eq("id", profile.id);

    if (updateError) {
        console.error("[Telegram] Failed to link chat ID:", updateError);
        await sendMessage(
            chatId,
            "❌ Something went wrong. Please try again."
        );
        return;
    }

    await sendMessage(
        chatId,
        "✅ Connected! Your Telegram is now linked to your ToReadList account.\n\nJust send me any URL and I'll save it to your reading list."
    );
}

async function handleUrls(
    supabase: ReturnType<typeof createAdminClient>,
    chatId: number,
    urls: string[]
) {
    // Look up the user by chat ID
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("telegram_chat_id", String(chatId))
        .single();

    if (profileError || !profile) {
        await sendMessage(
            chatId,
            "🔗 Your Telegram isn't connected to a ToReadList account yet.\n\nGo to Settings → Channels in the web app to connect."
        );
        return;
    }

    // Save each URL as a link
    const linksToInsert = urls.map((url) => ({
        user_id: profile.id,
        url,
        title: url, // temporary — will be replaced by metadata extraction
        source: "telegram",
        status: "unread",
        extraction_status: "pending",
    }));

    const { data: savedLinks, error: insertError } = await supabase
        .from("links")
        .insert(linksToInsert)
        .select("id, url");

    if (insertError) {
        console.error("[Telegram] Failed to save links:", insertError);
        await sendMessage(
            chatId,
            "❌ Failed to save the link(s). Please try again."
        );
        return;
    }

    const count = savedLinks?.length ?? urls.length;
    if (count === 1) {
        await sendMessage(chatId, "✅ Saved! Check your reading list.");
    } else {
        await sendMessage(
            chatId,
            `✅ Saved ${count} links! Check your reading list.`
        );
    }
}

async function sendHelpMessage(chatId: number) {
    await sendMessage(
        chatId,
        "📚 *ToReadList Bot*\n\n" +
        "Send me any URL and I'll save it to your reading list\\.\n\n" +
        "*Commands:*\n" +
        "/start — Connect your account\n" +
        "/help — Show this message\n\n" +
        "Manage your links at toreadlist\\.app",
        { parse_mode: "MarkdownV2" }
    );
}
