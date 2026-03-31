import { getTrackingUrl } from "@/lib/tracking";

interface TrackingLinkProps {
  carrier: string | null;
  trackingNumber: string;
}

export function TrackingLink({ carrier, trackingNumber }: TrackingLinkProps) {
  const url = carrier ? getTrackingUrl(carrier, trackingNumber) : null;

  return (
    <div className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1 text-xs text-indigo-700">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
        <path d="M15 18H9" />
        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
      </svg>
      <span>
        {carrier && carrier !== "Otro" ? `${carrier}: ` : ""}
        {trackingNumber}
      </span>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 inline-flex items-center gap-0.5 font-medium text-indigo-600 hover:text-indigo-800"
        >
          Seguir envío
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      ) : null}
    </div>
  );
}
