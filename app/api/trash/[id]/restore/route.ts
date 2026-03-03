import { NextRequest, NextResponse } from "next/server";
import { createClientWithSession } from "@/lib/supabase/server";

// POST /api/trash/[id]/restore — restore a soft-deleted link
export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { supabase, user } = await createClientWithSession();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data, error } = await supabase
        .from("links")
        .update({ deleted_at: null })
        .eq("id", id)
        .eq("user_id", user.id)
        .not("deleted_at", "is", null) // Guard: only restore items that are actually trashed
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
        return NextResponse.json({ error: "Link not found in trash" }, { status: 404 });
    }

    return NextResponse.json(data);
}
