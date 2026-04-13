"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { replyToContactSubmission } from "@/lib/actions/contact-submissions";

export function ReplyButton({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleReply() {
    setLoading(true);
    try {
      const result = await replyToContactSubmission(submissionId);
      if (result.error) {
        alert(result.error);
        return;
      }
      if (result.conversationId) {
        router.push(`/portal/admin/mensajes/${result.conversationId}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleReply}
      disabled={loading}
      className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-dark disabled:opacity-50"
    >
      {loading ? "Abriendo..." : "Responder"}
    </button>
  );
}
