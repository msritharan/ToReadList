import { NextRequest, NextResponse } from "next/server";
import { createClientWithSession } from "@/lib/supabase/server";

// PATCH /api/links/[id] — update a link
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { supabase, user } = await createClientWithSession();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Only allow updating specific fields
    const allowedFields = ["title", "status", "is_favorite", "description", "deleted_at", "tags"];
    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
        if (field in body) {
            if (field === "description" && typeof body[field] === "string") {
                updates[field] = body[field].slice(0, 1000);
            } else {
                updates[field] = body[field];
            }
        }
    }

    // If marking as read, set read_at timestamp
    if (updates.status === "read") {
        updates.read_at = new Date().toISOString();
    }

    const { data, error } = await supabase
        .from("links")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id) // Extra safety — RLS handles this too
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
        return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    return NextResponse.json(data);
}

// DELETE /api/links/[id] — delete a link
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { supabase, user } = await createClientWithSession();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { error } = await supabase
        .from("links")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
