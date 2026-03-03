import { NextRequest, NextResponse } from "next/server";
import { createClientWithSession } from "@/lib/supabase/server";

const VALID_CATEGORIES = ["support", "feature_request", "bug_report", "other"];

// POST /api/support — submit a support request
export async function POST(request: NextRequest) {
    const { supabase, user } = await createClientWithSession();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, category, message } = body;

    if (!name || !email || !message) {
        return NextResponse.json(
            { error: "Name, email, and message are required" },
            { status: 400 }
        );
    }

    if (!VALID_CATEGORIES.includes(category)) {
        return NextResponse.json(
            { error: "Invalid category" },
            { status: 400 }
        );
    }

    if (message.length > 2000) {
        return NextResponse.json(
            { error: "Message must be 2000 characters or less" },
            { status: 400 }
        );
    }

    const { error } = await supabase.from("support_requests").insert({
        user_id: user.id,
        name: name.trim(),
        email: email.trim(),
        category,
        message: message.trim(),
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
        { message: "Support request submitted successfully" },
        { status: 201 }
    );
}
