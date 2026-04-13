"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { startAdminConversation } from "@/lib/actions/chat";

export function StartAdminChatButton({
  buyerId,
  existingConversationId,
}: {
  buyerId: string;
  existingConversationId?: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (existingConversationId) {
      router.push(`/portal/admin/mensajes/${existingConversationId}`);
      return;
    }

    setLoading(true);
    try {
      const result = await startAdminConversation(buyerId);
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
      onClick={handleClick}
      disabled={loading}
      className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark disabled:opacity-50"
    >
      {loading
        ? "Abriendo..."
        : existingConversationId
          ? "Ver conversación"
          : "Iniciar conversación"}
    </button>
  );
}
