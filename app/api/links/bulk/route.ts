import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH /api/links/bulk — bulk update multiple links
export async function PATCH(request: NextRequest) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ids, updates } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ error: "ids array is required" }, { status: 400 });
    }

    if (!updates || typeof updates !== "object") {
        return NextResponse.json({ error: "updates object is required" }, { status: 400 });
    }

    const allowedFields = ["title", "status", "is_favorite", "description", "deleted_at"];
    const filteredUpdates: Record<string, unknown> = {};
    for (const field of allowedFields) {
        if (field in updates) {
            const value = (updates as Record<string, unknown>)[field];
            if (field === "description" && typeof value === "string") {
                filteredUpdates[field] = value.slice(0, 1000);
            } else {
                filteredUpdates[field] = value;
            }
        }
    }

    if (filteredUpdates.status === "read") {
        filteredUpdates.read_at = new Date().toISOString();
    }

    const { error } = await supabase
        .from("links")
        .update(filteredUpdates)
        .eq("user_id", user.id)
        .in("id", ids);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
