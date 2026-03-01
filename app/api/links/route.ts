import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/links — fetch paginated links for the authenticated user
export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

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
        200,
        Math.max(1, parseInt(searchParams.get("limit") ?? "25", 10))
    );
    const offset = (page - 1) * limit;

    // Validate sort params to prevent injection
    const allowedSortColumns = ["created_at"];
    const resolvedSortBy = allowedSortColumns.includes(sort_by) ? sort_by : "created_at";
    const ascending = sort_order === "asc";

    // Build the filtered query
    let baseQuery = supabase
        .from("links")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .is("deleted_at", null);

    if (status && status !== "all") {
        baseQuery = baseQuery.eq("status", status);
    }

    if (is_favorite === "true") {
        baseQuery = baseQuery.eq("is_favorite", true);
    }

    if (search && search.trim()) {
        baseQuery = baseQuery.or(
            `title.ilike.%${search}%,url.ilike.%${search}%,domain.ilike.%${search}%`
        );
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
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { url, title, domain, favicon_url, status = "unread", is_favorite = false, source = "manual" } = body;

    if (!url) {
        return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("links")
        .insert({
            user_id: user.id,
            url,
            title: title || domain || url,
            domain,
            favicon_url,
            status,
            is_favorite,
            source,
            extraction_status: "success",
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}
