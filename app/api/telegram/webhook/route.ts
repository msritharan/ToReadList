import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
    type TelegramUpdate,
    sendMessage,
    extractUrls,
    getBotCommand,
    verifyWebhookSecret,
} from "@/lib/telegram";
import { extractMetadata } from "@/lib/metadata";

/**
 * POST /api/telegram/webhook
 *
 * Receives all incoming Telegram bot messages.
 * Handles:
 *   /start <token>  → link Telegram to a user account
 *   /help           → reply with usage instructions
 *   URLs            → save as links for the user
 *   #tags           → apply to pending link if in WAITING_FOR_TAGS state
 *   Other           → reply with help text (in IDLE) or ignore (in WAITING_FOR_TAGS)
 */
export async function POST(request: NextRequest) {
    const secret = request.headers.get("x-telegram-bot-api-secret-token");
    if (!verifyWebhookSecret(secret)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let update: TelegramUpdate;
    try {
        update = await request.json();
    } catch {
        return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    const message = update.message;
    if (!message || !message.chat) {
        return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const supabase = createAdminClient();

    const command = getBotCommand(message);

    if (command === "/start") {
        await handleStart(supabase, chatId, message.text ?? "");
        return NextResponse.json({ ok: true });
    }

    if (command === "/help") {
        await sendHelpMessage(chatId);
        return NextResponse.json({ ok: true });
    }

    const profile = await getProfile(supabase, chatId);
    if (!profile) {
        await sendMessage(
            chatId,
            "🔗 Your Telegram isn't connected to a ToReadList account yet.\n\nGo to Settings → Channels in the web app to connect."
        );
        return NextResponse.json({ ok: true });
    }

    const messageText = message.text ?? "";
    const urls = extractUrls(message);
    const hashtags = extractHashtags(messageText);

    if (profile.pending_tag_link_id) {
        await handleWaitingForTags(supabase, profile, urls, hashtags);
    } else {
        await handleIdleState(supabase, profile, urls, hashtags);
    }

    return NextResponse.json({ ok: true });
}

async function getProfile(supabase: ReturnType<typeof createAdminClient>, chatId: number) {
    const { data } = await supabase
        .from("profiles")
        .select("id, pending_tag_link_id")
        .eq("telegram_chat_id", String(chatId))
        .single();
    return data;
}

async function handleIdleState(
    supabase: ReturnType<typeof createAdminClient>,
    profile: { id: string; pending_tag_link_id: string | null },
    urls: string[],
    hashtags: string[]
) {
    const chatId = Number((await supabase.from("profiles").select("telegram_chat_id").eq("id", profile.id).single()).data?.telegram_chat_id);

    if (urls.length === 0) {
        await sendMessage(
            chatId,
            "I didn't find any links in that message. Send me a URL and I'll save it to your reading list!\n\nType /help for more info."
        );
        return;
    }

    const savedLink = await saveLink(supabase, profile.id, urls[0], chatId);
    if (!savedLink) return;

    await supabase
        .from("profiles")
        .update({ pending_tag_link_id: savedLink.id })
        .eq("id", profile.id);

    const title = savedLink.title ?? "your link";
    await sendMessage(
        chatId,
        `✅ Saved: "${title}"\n\nAdd tags (e.g., #work #tech) or send another link.`
    );
}

async function handleWaitingForTags(
    supabase: ReturnType<typeof createAdminClient>,
    profile: { id: string; pending_tag_link_id: string | null },
    urls: string[],
    hashtags: string[]
) {
    const chatId = Number((await supabase.from("profiles").select("telegram_chat_id").eq("id", profile.id).single()).data?.telegram_chat_id);

    if (urls.length > 0) {
        await supabase
            .from("profiles")
            .update({ pending_tag_link_id: null })
            .eq("id", profile.id);

        const savedLink = await saveLink(supabase, profile.id, urls[0], chatId);
        if (!savedLink) return;

        await supabase
            .from("profiles")
            .update({ pending_tag_link_id: savedLink.id })
            .eq("id", profile.id);

        const title = savedLink.title ?? "your link";
        await sendMessage(
            chatId,
            `✅ Saved: "${title}"\n\nAdd tags (e.g., #work #tech) or send another link.`
        );
        return;
    }

    if (hashtags.length > 0) {
        const normalizedTags = hashtags.map((tag) => tag.toLowerCase());

        await supabase
            .from("links")
            .update({ tags: normalizedTags })
            .eq("id", profile.pending_tag_link_id);

        await supabase
            .from("profiles")
            .update({ pending_tag_link_id: null })
            .eq("id", profile.id);

        const tagList = hashtags.map((t) => `#${t}`).join(" ");
        await sendMessage(
            chatId,
            `✅ Tags added: ${tagList}\n\nSend me more links whenever you're ready!`
        );
        return;
    }

    await sendMessage(
        chatId,
        "Add tags (e.g., #work #tech) or send another link."
    );
}

async function saveLink(
    supabase: ReturnType<typeof createAdminClient>,
    userId: string,
    url: string,
    chatId: number
) {
    const meta = await extractMetadata(url);

    const { data: savedLink, error: insertError } = await supabase
        .from("links")
        .insert({
            user_id: userId,
            url,
            title: meta.title,
            description: meta.description?.slice(0, 1000) ?? null,
            domain: meta.domain,
            favicon_url: meta.favicon_url,
            source: meta.domain || "telegram",
            status: "unread",
            extraction_status: meta.extraction_status,
            tags: [],
        })
        .select("id, url, title")
        .single();

    if (insertError) {
        console.error("[Telegram] Failed to save link:", insertError);
        await sendMessage(
            chatId,
            "❌ Failed to save the link. Please try again."
        );
        return null;
    }

    return savedLink;
}

function extractHashtags(text: string): string[] {
    const regex = /#([a-zA-Z0-9_]+)/g;
    const matches = text.match(regex);
    return matches ? matches.map((t) => t.slice(1)) : [];
}

async function handleStart(
    supabase: ReturnType<typeof createAdminClient>,
    chatId: number,
    text: string
) {
    const parts = text.trim().split(/\s+/);
    const token = parts.length > 1 ? parts[1] : null;

    if (!token) {
        await sendMessage(
            chatId,
            "👋 Welcome to ToReadList!\n\nTo connect your account, go to Settings → Channels in the web app and click 'Connect Telegram'.\n\nOnce connected, just send me any URL and I'll save it to your reading list!"
        );
        return;
    }

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

    const { error: updateError } = await supabase
        .from("profiles")
        .update({
            telegram_chat_id: String(chatId),
            telegram_verified: true,
            telegram_link_token: null,
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

async function sendHelpMessage(chatId: number) {
    await sendMessage(
        chatId,
        "📚 *ToReadList Bot*\n\n" +
        "Send me any URL and I'll save it to your reading list\\.\n\n" +
        "Use #hashtags to add tags to your links\\.\n\n" +
        "*Commands:*\n" +
        "/start — Connect your account\n" +
        "/help — Show this message\n\n" +
        "Manage your links at toreadlist\\.app",
        { parse_mode: "MarkdownV2" }
    );
}
