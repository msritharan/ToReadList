import { NextRequest, NextResponse } from "next/server";
import { createClientWithSession } from "@/lib/supabase/server";

// PATCH /api/trash/bulk/restore — bulk restore soft-deleted links
export async function PATCH(request: NextRequest) {
    const { supabase, user } = await createClientWithSession();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ error: "ids array is required" }, { status: 400 });
    }

    const { error } = await supabase
        .from("links")
        .update({ deleted_at: null })
        .eq("user_id", user.id)
        .in("id", ids)
        .not("deleted_at", "is", null);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
