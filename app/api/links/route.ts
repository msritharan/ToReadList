import { NextRequest, NextResponse } from "next/server";
import { createClientWithSession } from "@/lib/supabase/server";

// GET /api/links — fetch paginated links for the authenticated user
export async function GET(request: NextRequest) {
    const { supabase, user } = await createClientWithSession();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const is_favorite = searchParams.get("is_favorite");
    const search = searchParams.get("search");
    const domain = searchParams.get("domain");
    const sort_by = searchParams.get("sort_by") ?? "created_at";
    const sort_order = searchParams.get("sort_order") ?? "desc";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(
        2000,
        Math.max(1, parseInt(searchParams.get("limit") ?? "25", 10))
    );
    const offset = (page - 1) * limit;

    // Validate sort params to prevent injection
    const allowedSortColumns = ["created_at"];
    const resolvedSortBy = allowedSortColumns.includes(sort_by) ? sort_by : "created_at";
    const ascending = sort_order === "asc";

    // Build the query (fetching ALL links including soft-deleted ones)
    let baseQuery = supabase
        .from("links")
        .select("*", { count: "exact" })
        .eq("user_id", user.id);

    if (status && status !== "all") {
        baseQuery = baseQuery.eq("status", status);
    }

    if (is_favorite === "true") {
        baseQuery = baseQuery.eq("is_favorite", true);
    }

    if (search && search.trim()) {
        // Sanitize: strip PostgREST-special characters to prevent filter injection
        const sanitizedSearch = search.replace(/[.,()]/g, "");
        if (sanitizedSearch) {
            baseQuery = baseQuery.or(
                `title.ilike.%${sanitizedSearch}%,url.ilike.%${sanitizedSearch}%,domain.ilike.%${sanitizedSearch}%`
            );
        }
    }

    if (domain && domain.trim()) {
        baseQuery = baseQuery.eq("domain", domain.trim());
    }

    const { data, error, count } = await baseQuery
        .order(resolvedSortBy, { ascending })
        .range(offset, offset + limit - 1);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({
        data: data ?? [],
        total,
        page,
        limit,
        totalPages,
    });
}

// POST /api/links — create a new link
export async function POST(request: NextRequest) {
    const { supabase, user } = await createClientWithSession();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { url, title, description, domain, favicon_url, status: rawStatus = "unread", is_favorite = false, source: rawSource = "manual", tags = [] } = body;

    if (!url) {
        return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate enum fields to prevent storing unexpected values
    const allowedStatuses = ["unread", "read", "skipped"];
    const allowedSources = ["manual", "telegram", "pwa"];
    const status = allowedStatuses.includes(rawStatus) ? rawStatus : "unread";
    const source = allowedSources.includes(rawSource) ? rawSource : "manual";

    const truncatedDescription = description?.slice(0, 1000) ?? null;

    const { data, error } = await supabase
        .from("links")
        .insert({
            user_id: user.id,
            url,
            title: title || domain || url,
            description: truncatedDescription,
            domain,
            favicon_url,
            status,
            is_favorite,
            source,
            extraction_status: "success",
            tags,
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}
