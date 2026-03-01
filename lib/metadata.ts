// ─── URL Metadata Extraction ────────────────────────────────────────
//
// Server-side utility to extract title, description, domain, and
// favicon from a URL. Handles paywalled / login-gated content with
// fallback strategies.

export interface LinkMetadata {
    title: string;
    description: string | null;
    domain: string;
    favicon_url: string;
    extraction_status: "success" | "partial" | "failed";
}

// ─── Public API ─────────────────────────────────────────────────────

/**
 * Extract metadata from a URL.
 * Always returns usable data, even when the page can't be fetched.
 */
export async function extractMetadata(url: string): Promise<LinkMetadata> {
    const domain = extractDomain(url);
    const favicon_url = getFaviconUrl(domain);

    // Try to fetch and parse the page HTML
    let ogTitle: string | null = null;
    let ogDescription: string | null = null;
    let htmlTitle: string | null = null;
    let metaDescription: string | null = null;

    try {
        const html = await fetchPageHtml(url);
        if (html) {
            ogTitle = parseMetaContent(html, "og:title");
            ogDescription = parseMetaContent(html, "og:description");
            htmlTitle = parseHtmlTitle(html);
            metaDescription =
                parseMetaName(html, "description") ??
                parseMetaName(html, "twitter:description");
        }
    } catch (err) {
        console.warn("[Metadata] Fetch failed for", url, err);
    }

    // Build title with fallback chain
    const title = pickTitle(ogTitle, htmlTitle, url, domain);
    const description = ogDescription ?? metaDescription ?? null;

    // Determine extraction quality
    let extraction_status: LinkMetadata["extraction_status"] = "failed";
    if (ogTitle || htmlTitle) {
        extraction_status = "success";
    } else if (getKnownSourceTitle(url, domain)) {
        extraction_status = "partial";
    }

    return { title, description, domain, favicon_url, extraction_status };
}

// ─── Domain & Favicon ───────────────────────────────────────────────

function extractDomain(url: string): string {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return "";
    }
}

function getFaviconUrl(domain: string): string {
    if (!domain) return "";
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

// ─── HTML Fetching ──────────────────────────────────────────────────

async function fetchPageHtml(url: string): Promise<string | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
        const res = await fetch(url, {
            signal: controller.signal,
            redirect: "follow",
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (compatible; ToReadListBot/1.0; +https://toreadlist.vercel.app)",
                Accept: "text/html,application/xhtml+xml",
                "Accept-Language": "en-US,en;q=0.9",
            },
        });

        if (!res.ok) return null;

        const contentType = res.headers.get("content-type") ?? "";
        if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
            return null;
        }

        // Only read the first ~50KB for speed — meta tags are always in <head>
        const reader = res.body?.getReader();
        if (!reader) return null;

        let html = "";
        const decoder = new TextDecoder();
        while (html.length < 50_000) {
            const { done, value } = await reader.read();
            if (done) break;
            html += decoder.decode(value, { stream: true });
        }
        reader.cancel();
        return html;
    } catch {
        return null;
    } finally {
        clearTimeout(timeout);
    }
}

// ─── HTML Parsing (regex-based, no dependencies) ────────────────────

function parseMetaContent(html: string, property: string): string | null {
    // Match <meta property="og:title" content="..."> or <meta content="..." property="og:title">
    const patterns = [
        new RegExp(
            `<meta[^>]+property=["']${escapeRegex(property)}["'][^>]+content=["']([^"']+)["']`,
            "i"
        ),
        new RegExp(
            `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${escapeRegex(property)}["']`,
            "i"
        ),
    ];

    for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match?.[1]) {
            return decodeHtmlEntities(match[1].trim());
        }
    }
    return null;
}

function parseMetaName(html: string, name: string): string | null {
    const patterns = [
        new RegExp(
            `<meta[^>]+name=["']${escapeRegex(name)}["'][^>]+content=["']([^"']+)["']`,
            "i"
        ),
        new RegExp(
            `<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${escapeRegex(name)}["']`,
            "i"
        ),
    ];

    for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match?.[1]) {
            return decodeHtmlEntities(match[1].trim());
        }
    }
    return null;
}

function parseHtmlTitle(html: string): string | null {
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (match?.[1]) {
        const title = decodeHtmlEntities(match[1].trim());
        // Filter out generic / useless titles
        if (title && title.length > 1 && !isGenericTitle(title)) {
            return title;
        }
    }
    return null;
}

function isGenericTitle(title: string): boolean {
    const generic = [
        "just a moment",
        "attention required",
        "access denied",
        "403 forbidden",
        "404 not found",
        "page not found",
        "loading",
        "redirecting",
        "sign in",
        "log in",
        "login",
    ];
    const lower = title.toLowerCase().trim();
    return generic.some((g) => lower === g || lower.startsWith(g));
}

function decodeHtmlEntities(str: string): string {
    return str
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, "/");
}

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ─── Known-Source Title Formatter ───────────────────────────────────
//
// For sites where HTML scraping is unreliable (login walls, SPAs),
// generate a meaningful title from the URL structure.

function getKnownSourceTitle(url: string, domain: string): string | null {
    const pathname = getPathname(url);

    // X / Twitter
    if (domain === "x.com" || domain === "twitter.com") {
        // Pattern: /username/status/id
        const match = pathname.match(/^\/([^/]+)\/status\/\d+/);
        if (match) {
            return `Post on X by @${match[1]}`;
        }
        // Profile URL: /username
        const profileMatch = pathname.match(/^\/([^/]+)\/?$/);
        if (profileMatch && !profileMatch[1].startsWith("_")) {
            return `@${profileMatch[1]} on X`;
        }
        return "Post on X";
    }

    // YouTube
    if (domain === "youtube.com" || domain === "m.youtube.com") {
        if (pathname.startsWith("/watch") || pathname.startsWith("/shorts/")) {
            return "Video on YouTube";
        }
        const channelMatch = pathname.match(/^\/@([^/]+)/);
        if (channelMatch) {
            return `${channelMatch[1]} — YouTube Channel`;
        }
        return "YouTube";
    }
    if (domain === "youtu.be") {
        return "Video on YouTube";
    }

    // GitHub
    if (domain === "github.com") {
        const repoMatch = pathname.match(/^\/([^/]+)\/([^/]+)/);
        if (repoMatch) {
            const owner = repoMatch[1];
            const repo = repoMatch[2];
            // Issues / PRs
            const issueMatch = pathname.match(/\/(issues|pull)\/(\d+)/);
            if (issueMatch) {
                const type = issueMatch[1] === "pull" ? "PR" : "Issue";
                return `${owner}/${repo} — ${type} #${issueMatch[2]}`;
            }
            return `${owner}/${repo} — GitHub`;
        }
        return "GitHub";
    }

    // Reddit
    if (domain === "reddit.com" || domain === "old.reddit.com") {
        const subMatch = pathname.match(/^\/r\/([^/]+)/);
        if (subMatch) {
            return `Post in r/${subMatch[1]} — Reddit`;
        }
        return "Reddit";
    }

    // Medium
    if (domain === "medium.com" || domain.endsWith(".medium.com")) {
        return "Article on Medium";
    }

    // Substack
    if (domain.endsWith(".substack.com")) {
        const pub = domain.replace(".substack.com", "");
        return `Post on ${pub} (Substack)`;
    }

    // HN
    if (domain === "news.ycombinator.com") {
        return "Hacker News";
    }

    // LinkedIn
    if (domain === "linkedin.com" || domain === "www.linkedin.com") {
        if (pathname.includes("/posts/") || pathname.includes("/pulse/")) {
            return "Post on LinkedIn";
        }
        return "LinkedIn";
    }

    // Instagram
    if (domain === "instagram.com") {
        const igMatch = pathname.match(/^\/p\//);
        if (igMatch) return "Post on Instagram";
        const igProfile = pathname.match(/^\/([^/]+)\/?$/);
        if (igProfile) return `@${igProfile[1]} on Instagram`;
        return "Instagram";
    }

    return null;
}

// ─── Title Fallback Chain ───────────────────────────────────────────

function pickTitle(
    ogTitle: string | null,
    htmlTitle: string | null,
    url: string,
    domain: string
): string {
    // 1. OG title (highest quality)
    if (ogTitle && ogTitle.length > 1) return ogTitle;

    // 2. HTML <title> tag
    if (htmlTitle && htmlTitle.length > 1) return htmlTitle;

    // 3. Known-source formatter (URL pattern-based)
    const knownTitle = getKnownSourceTitle(url, domain);
    if (knownTitle) return knownTitle;

    // 4. Generate from URL path
    const cleanedPath = cleanUrlPath(url);
    if (cleanedPath) return cleanedPath;

    // 5. Last resort — domain name
    return domain || url;
}

function cleanUrlPath(url: string): string | null {
    const pathname = getPathname(url);
    if (!pathname || pathname === "/") return null;

    // Take the last meaningful segment
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return null;

    const last = segments[segments.length - 1];

    // Remove file extensions, query-ish suffixes
    const cleaned = last
        .replace(/\.[a-z]{2,5}$/i, "") // remove .html, .php etc
        .replace(/[-_]/g, " ") // hyphens/underscores to spaces
        .replace(/\b\w/g, (c) => c.toUpperCase()); // capitalize words

    if (cleaned.length < 3 || cleaned.length > 120) return null;

    return cleaned;
}

function getPathname(url: string): string {
    try {
        return new URL(url).pathname;
    } catch {
        return "";
    }
}
