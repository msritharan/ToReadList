import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { extractMetadata } from "@/lib/metadata";
import { AddLinkClient } from "./add-client";

export default async function AddPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string; text?: string; title?: string }>;
}) {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not authenticated, redirect to login with return URL
  if (!user) {
    const params = await searchParams;
    const sharedUrl = params.url || params.text || "";
    const encodedUrl = encodeURIComponent(sharedUrl);
    redirect(`/?redirectTo=/add?url=${encodedUrl}`);
  }

  const params = await searchParams;
  const sharedUrl = params.url || params.text || "";
  const sharedTitle = params.title || "";

  let metadata = null;
  if (sharedUrl) {
    try {
      metadata = await extractMetadata(sharedUrl);
    } catch (error) {
      console.error("Failed to extract metadata:", error);
    }
  }

  return (
    <AddLinkClient
      url={sharedUrl}
      title={sharedTitle || metadata?.title || ""}
      description={metadata?.description || ""}
    />
  );
}
