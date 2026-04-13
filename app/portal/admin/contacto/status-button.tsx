"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateContactSubmissionStatus } from "@/lib/actions/contact-submissions";

export function StatusButton({
  submissionId,
  targetStatus,
  label,
}: {
  submissionId: string;
  targetStatus: "REPLIED" | "CLOSED";
  label: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await updateContactSubmissionStatus(submissionId, targetStatus);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-md border border-border px-3 py-1.5 text-sm text-text-secondary hover:bg-background disabled:opacity-50"
    >
      {loading ? "..." : label}
    </button>
  );
}
