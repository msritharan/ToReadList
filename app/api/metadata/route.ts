import { NextRequest, NextResponse } from "next/server";
import { createClientWithSession } from "@/lib/supabase/server";
import { extractMetadata } from "@/lib/metadata";

// GET /api/metadata?url=...
export async function GET(request: NextRequest) {
    const { user } = await createClientWithSession();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    try {
        const metadata = await extractMetadata(url);
        return NextResponse.json(metadata);
    } catch (error) {
        console.error("[Metadata API] Error extracting metadata:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}
