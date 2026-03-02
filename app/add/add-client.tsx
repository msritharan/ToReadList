"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AddLinkDialog } from "@/components/add-link-dialog";
import { LinkItem } from "@/types";

async function addLink(link: Omit<LinkItem, "id" | "created_at">) {
  const res = await fetch("/api/links", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(link),
  });
  if (!res.ok) throw new Error("Failed to add link");
  return res.json();
}

interface AddLinkClientProps {
  url: string;
  title: string;
  description: string;
}

export function AddLinkClient({ url, title, description }: AddLinkClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: addLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      router.push("/dashboard");
    },
  });

  const handleAddLink = (link: Omit<LinkItem, "id" | "created_at">) => {
    mutation.mutate(link);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AddLinkDialog
          onAddLink={handleAddLink}
          trigger={<span />}
          initialUrl={url}
          initialTitle={title}
          initialDescription={description}
        />
      </div>
    </div>
  );
}
