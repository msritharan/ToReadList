import { NextRequest, NextResponse } from "next/server";
import { createClientWithSession } from "@/lib/supabase/server";

// PATCH /api/links/bulk — bulk update multiple links
export async function PATCH(request: NextRequest) {
    const { supabase, user } = await createClientWithSession();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ids, updates } = body;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!Array.isArray(ids) || ids.length === 0 || !ids.every((id: unknown) => typeof id === "string" && uuidRegex.test(id))) {
        return NextResponse.json({ error: "ids must be a non-empty array of valid UUIDs" }, { status: 400 });
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
