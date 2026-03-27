"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { startConversation } from "@/lib/actions/chat";
import Link from "next/link";

export function MessageArtisanButton({
  artisanId,
  productId,
}: {
  artisanId: string;
  productId: string;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  if (status === "loading") return null;

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-accent/30 bg-accent/5 px-4 py-3 text-sm font-medium text-accent transition-colors hover:bg-accent/10 min-h-[44px]"
      >
        <MessageIcon />
        Inicia sesión para enviar un mensaje
      </Link>
    );
  }

  function handleClick() {
    setError("");
    startTransition(async () => {
      const result = await startConversation(artisanId, productId);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if (result.conversationId) {
        router.push(`/portal/comprador/mensajes/${result.conversationId}`);
      }
    });
  }

  return (
    <div className="mt-4">
      <button
        onClick={handleClick}
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-accent/30 bg-accent/5 px-4 py-3 text-sm font-medium text-accent transition-colors hover:bg-accent/10 disabled:opacity-50 min-h-[44px]"
      >
        {isPending ? (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <MessageIcon />
        )}
        Mensaje privado al orfebre
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

function MessageIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
