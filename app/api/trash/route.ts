import { NextRequest, NextResponse } from "next/server";
import { createClientWithSession } from "@/lib/supabase/server";

// GET /api/trash — list all soft-deleted links for the authenticated user
export async function GET() {
    const { supabase, user } = await createClientWithSession();

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
    const { supabase, user } = await createClientWithSession();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let idsToDelete: string[] | undefined;
    try {
        const text = await request.text();
        const body = text ? JSON.parse(text) : null;
        if (body && Array.isArray(body.ids) && body.ids.length > 0) {
            // Validate that all ids are valid UUIDs
            if (body.ids.every((id: unknown) => typeof id === "string" && uuidRegex.test(id))) {
                idsToDelete = body.ids;
            }
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
