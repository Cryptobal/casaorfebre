"use client";

import { useState } from "react";

interface ShareButtonsProps {
  url: string;
  title: string;
  description: string;
  imageUrl?: string;
  type: "product" | "artisan";
  className?: string;
}

export function ShareButtons({
  url,
  title,
  description,
  imageUrl,
  type,
  className,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [instaCopied, setInstaCopied] = useState(false);

  function openPopup(popupUrl: string) {
    window.open(popupUrl, "_blank", "width=600,height=600,scrollbars=yes");
  }

  function withUtm(base: string, source: string, medium: string): string {
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}utm_source=${source}&utm_medium=${medium}`;
  }

  function handlePinterest() {
    if (!imageUrl) return;
    const trackedUrl = withUtm(url, "pinterest", "social");
    const pinDesc = encodeURIComponent(
      `${title} - ${description} | Casa Orfebre`
    );
    const pinUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(trackedUrl)}&media=${encodeURIComponent(imageUrl)}&description=${pinDesc}`;
    openPopup(pinUrl);
  }

  function handleWhatsApp() {
    const trackedUrl = withUtm(url, "whatsapp", "share");
    const text =
      type === "product"
        ? `Mira esta pieza: ${title} en Casa Orfebre 🔗 ${trackedUrl}`
        : `Conoce a ${title}, orfebre en Casa Orfebre 🔗 ${trackedUrl}`;
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  }

  function handleInstagram() {
    const trackedUrl = withUtm(url, "instagram", "share");
    navigator.clipboard.writeText(trackedUrl);
    setInstaCopied(true);
    setTimeout(() => setInstaCopied(false), 2000);
  }

  function handleCopyLink() {
    const trackedUrl = withUtm(url, "copy", "share");
    navigator.clipboard.writeText(trackedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      {/* Pinterest */}
      {imageUrl && (
        <button
          type="button"
          onClick={handlePinterest}
          title="Compartir en Pinterest"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text-secondary transition-all duration-200 hover:scale-105 hover:border-accent/30 hover:bg-accent/10 hover:text-accent"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
          </svg>
        </button>
      )}

      {/* WhatsApp */}
      <button
        type="button"
        onClick={handleWhatsApp}
        title="Compartir por WhatsApp"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text-secondary transition-all duration-200 hover:scale-105 hover:border-accent/30 hover:bg-accent/10 hover:text-accent"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </button>

      {/* Instagram (copy link) */}
      <div className="relative">
        <button
          type="button"
          onClick={handleInstagram}
          title="Copiar link para Instagram"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text-secondary transition-all duration-200 hover:scale-105 hover:border-accent/30 hover:bg-accent/10 hover:text-accent"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        </button>
        {instaCopied && (
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-text px-3 py-1.5 text-xs text-surface shadow-lg">
            Link copiado — pégalo en tu historia
          </span>
        )}
      </div>

      {/* Copy link */}
      <button
        type="button"
        onClick={handleCopyLink}
        title="Copiar link"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text-secondary transition-all duration-200 hover:scale-105 hover:border-accent/30 hover:bg-accent/10 hover:text-accent"
      >
        {copied ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        )}
      </button>
    </div>
  );
}

/** Standalone Pinterest "Pin It" button for image overlays */
export function PinItButton({
  url,
  imageUrl,
  description,
  className,
}: {
  url: string;
  imageUrl: string;
  description: string;
  className?: string;
}) {
  function handlePin() {
    const pinDesc = encodeURIComponent(`${description} | Casa Orfebre`);
    const pinUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(imageUrl)}&description=${pinDesc}`;
    window.open(pinUrl, "_blank", "width=600,height=600,scrollbars=yes");
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handlePin();
      }}
      title="Pin en Pinterest"
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#E60023] backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-white ${className ?? ""}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
      </svg>
    </button>
  );
}
