import { NextResponse } from "next/server";
import { createClientWithSession } from "@/lib/supabase/server";

// GET /api/links/stats — returns aggregate counts for the authenticated user
export async function GET() {
    const { supabase, user } = await createClientWithSession();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
        .from("links")
        .select("status")
        .eq("user_id", user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const total = data.length;
    const read = data.filter((l) => l.status === "read").length;
    const unread = data.filter((l) => l.status === "unread").length;
    const skipped = data.filter((l) => l.status === "skipped").length;

    return NextResponse.json({ total, read, unread, skipped });
}
