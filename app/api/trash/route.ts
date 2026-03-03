import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/trash — list all soft-deleted links for the authenticated user
export async function GET() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", user.id)
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
}

// DELETE /api/trash — empty trash or hard-delete specific soft-deleted links
export async function DELETE(request: NextRequest) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let idsToDelete: string[] | undefined;
    try {
        const text = await request.text();
        console.log("body text:", text);
        const body = text ? JSON.parse(text) : null;
        if (body && Array.isArray(body.ids) && body.ids.length > 0) {
            idsToDelete = body.ids;
        }
    } catch (e) {
        console.log("JSON parse error:", e);
    }

    let query = supabase
        .from("links")
        .delete()
        .eq("user_id", user.id)
        .not("deleted_at", "is", null);

    if (idsToDelete) {
        query = query.in("id", idsToDelete);
    }

    const { error } = await query;

    console.log("Supabase delete error:", error);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
