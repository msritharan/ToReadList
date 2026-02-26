import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/links — fetch links for the authenticated user
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

    let query = supabase
        .from("links")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (status) {
        query = query.eq("status", status);
    }

    if (is_favorite === "true") {
        query = query.eq("is_favorite", true);
    }

    if (search) {
        query = query.or(`title.ilike.%${search}%,url.ilike.%${search}%,domain.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
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
