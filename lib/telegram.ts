// ─── Telegram Bot API Types ─────────────────────────────────────────

export interface TelegramUser {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
}

export interface TelegramChat {
    id: number;
    type: "private" | "group" | "supergroup" | "channel";
    first_name?: string;
    last_name?: string;
    username?: string;
}

export interface TelegramMessageEntity {
    type: "url" | "text_link" | "bot_command" | "mention" | string;
    offset: number;
    length: number;
    url?: string; // only for text_link
}

export interface TelegramMessage {
    message_id: number;
    from?: TelegramUser;
    chat: TelegramChat;
    date: number;
    text?: string;
    entities?: TelegramMessageEntity[];
}

export interface TelegramUpdate {
    update_id: number;
    message?: TelegramMessage;
}

// ─── Bot API Helpers ────────────────────────────────────────────────

const TELEGRAM_API = "https://api.telegram.org";

function getBotToken(): string {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error("Missing TELEGRAM_BOT_TOKEN");
    return token;
}

/**
 * Send a text message to a Telegram chat.
 */
export async function sendMessage(
    chatId: number | string,
    text: string,
    options?: { parse_mode?: "HTML" | "MarkdownV2" }
): Promise<void> {
    const token = getBotToken();
    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: options?.parse_mode,
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        console.error("[Telegram] sendMessage failed:", err);
    }
}

/**
 * Extract all URLs from a Telegram message.
 * Handles both plain URLs (entity type "url") and hyperlinks (entity type "text_link").
 */
export function extractUrls(message: TelegramMessage): string[] {
    const urls: string[] = [];

    if (!message.text || !message.entities) return urls;

    for (const entity of message.entities) {
        if (entity.type === "url") {
            // Plain URL in the text
            let url = message.text.substring(
                entity.offset,
                entity.offset + entity.length
            );
            // Ensure it has a protocol
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                url = "https://" + url;
            }
            urls.push(url);
        } else if (entity.type === "text_link" && entity.url) {
            // Hyperlink — URL is in the entity itself
            urls.push(entity.url);
        }
    }

    return urls;
}

/**
 * Check if a message is a bot command (e.g. /start, /help).
 */
export function getBotCommand(message: TelegramMessage): string | null {
    if (!message.text || !message.entities) return null;

    for (const entity of message.entities) {
        if (entity.type === "bot_command" && entity.offset === 0) {
            return message.text
                .substring(entity.offset, entity.offset + entity.length)
                .toLowerCase();
        }
    }

    return null;
}

/**
 * Verify the webhook secret token from Telegram.
 * Returns true if the secret matches, or if no secret is configured (opt-out).
 */
export function verifyWebhookSecret(headerValue: string | null): boolean {
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (!secret) return true; // no secret configured — skip verification
    return headerValue === secret;
}
