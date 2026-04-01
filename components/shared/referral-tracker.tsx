"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function getOrCreateSessionId(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/co_sid=([^;]+)/);
  if (match) return match[1];
  const id = crypto.randomUUID();
  document.cookie = `co_sid=${id};path=/;max-age=${60 * 60 * 24 * 30};samesite=lax`;
  return id;
}

function detectSource(
  utmSource: string | null,
  referrer: string,
): { source: string; medium: string } {
  if (utmSource) return { source: utmSource, medium: "campaign" };
  if (!referrer) return { source: "direct", medium: "none" };
  const r = referrer.toLowerCase();
  if (r.includes("pinterest.com")) return { source: "pinterest", medium: "social" };
  if (r.includes("instagram.com")) return { source: "instagram", medium: "social" };
  if (r.includes("google.")) return { source: "google", medium: "organic" };
  if (r.includes("wa.me") || r.includes("whatsapp"))
    return { source: "whatsapp", medium: "share" };
  if (r.includes("facebook.com") || r.includes("fb.com"))
    return { source: "facebook", medium: "social" };
  if (r.includes("x.com") || r.includes("twitter.com"))
    return { source: "twitter", medium: "social" };
  if (r.includes("casaorfebre.cl/blog"))
    return { source: "blog", medium: "internal" };
  return { source: "other", medium: "referral" };
}

export function ReferralTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Skip non-public pages
    if (pathname.startsWith("/portal") || pathname.startsWith("/api")) return;

    const sessionId = getOrCreateSessionId();
    if (!sessionId) return;

    const utmSource = searchParams.get("utm_source");
    const utmMedium = searchParams.get("utm_medium");
    const utmCampaign = searchParams.get("utm_campaign");

    const { source, medium } = detectSource(
      utmSource,
      document.referrer,
    );

    // Fire-and-forget
    fetch("/api/tracking/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source,
        medium: utmMedium || medium,
        campaign: utmCampaign || null,
        landingPage: pathname,
        sessionId,
      }),
    }).catch(() => {});
  }, [pathname, searchParams]);

  return null;
}
